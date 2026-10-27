import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Header from './components/Header';
import CategoryFilter from './components/CategoryFilter';
import PhotoGrid from './components/PhotoGrid';
import PhotoLightbox from './components/PhotoLightbox';
import LoadingSkeleton from './components/LoadingSkeleton';
import ErrorState from './components/ErrorState';
import Toast from './components/Toast';
import {
  fetchUserInfo,
  fetchTotalUploadCount,
  fetchUserPhotos,
  isContentCategory,
} from './services/commonsApi';
import {
  getCachedContributor,
  saveCachedContributor,
} from './services/localCache';

// Determine initial username from URL pathname, hash, query param, or default
function getInitialUsername() {
  // 1. Check query param ?user=...
  const searchParams = new URLSearchParams(window.location.search);
  const userParam = searchParams.get('user');
  if (userParam && userParam.trim()) return userParam.trim();

  // 2. Check hash /#/username
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash) {
    const cleanHash = decodeURIComponent(hash.split('?')[0].trim());
    if (cleanHash) return cleanHash;
  }

  // 3. Check pathname /username
  const path = window.location.pathname.replace(/^\//, '').trim();
  if (path && path !== 'index.html' && !path.includes('.')) {
    const cleanPath = decodeURIComponent(path.split('/')[0].trim());
    if (cleanPath) return cleanPath;
  }

  // Default to Tshrinivasan from specs.md
  return 'Tshrinivasan';
}

function getInitialCategory() {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get('category') || null;
}

export default function App() {
  const [username, setUsername] = useState(getInitialUsername);
  const [userInfo, setUserInfo] = useState(null);
  const [totalUploads, setTotalUploads] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [continueToken, setContinueToken] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(getInitialCategory);
  const [activePhoto, setActivePhoto] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [copied, setCopied] = useState(false);
  const isFetchingRef = useRef(false);

  // Sync browser URL whenever username changes
  const updateUrl = useCallback((newUsername, category = null) => {
    const base = window.location.origin + window.location.pathname;
    const url = new URL(base);
    // Use hash or path
    url.hash = `#/${encodeURIComponent(newUsername)}`;
    if (category) {
      url.searchParams.set('category', category);
    } else {
      url.searchParams.delete('category');
    }
    window.history.replaceState({}, '', url.toString());
  }, []);

  // Display a brief toast
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // Load user data and photos (with persistent local cache)
  const loadUserData = useCallback(async (userToLoad, forceRefresh = false) => {
    // 1. Instant check from local IndexedDB cache
    if (!forceRefresh) {
      try {
        const cached = await getCachedContributor(userToLoad);
        if (cached && cached.photos && cached.photos.length > 0) {
          setUserInfo(cached.userInfo);
          setTotalUploads(cached.totalUploads);
          setPhotos(cached.photos);
          setContinueToken(cached.continueToken);
          setHasMore(cached.hasMore);
          setIsFromCache(true);
          setLoading(false);
          // Fast cached render complete!
          return;
        }
      } catch (e) {
        console.warn('Cache lookup failed, proceeding to network', e);
      }
    }

    setLoading(true);
    setIsRefreshing(forceRefresh);
    setError(null);
    if (!forceRefresh) {
      setPhotos([]);
      setContinueToken(null);
      setHasMore(false);
    }
    setSelectedCategory(null);
    setActivePhoto(null);

    try {
      // Parallel fetch from Wikimedia Commons API
      const [uInfo, uTotal, initialPhotos] = await Promise.all([
        fetchUserInfo(userToLoad),
        fetchTotalUploadCount(userToLoad),
        fetchUserPhotos(userToLoad, null, 40),
      ]);

      const count = uTotal || initialPhotos.photos.length;
      setUserInfo(uInfo);
      setTotalUploads(count);
      setPhotos(initialPhotos.photos);
      setContinueToken(initialPhotos.continueToken);
      setHasMore(initialPhotos.hasMore);
      setIsFromCache(false);

      // Save into persistent local cache for instant zero-latency future visits
      saveCachedContributor(userToLoad, {
        photos: initialPhotos.photos,
        continueToken: initialPhotos.continueToken,
        totalUploads: count,
        userInfo: uInfo,
        hasMore: initialPhotos.hasMore,
      });

      if (forceRefresh) {
        triggerToast('Synchronized with Wikimedia Commons');
      }

      // Check if photo param exists in URL
      const searchParams = new URLSearchParams(window.location.search);
      const photoParam = searchParams.get('photo');
      if (photoParam) {
        const found = initialPhotos.photos.find(
          (p) => p.id === photoParam || p.title === photoParam
        );
        if (found) setActivePhoto(found);
      }
    } catch (err) {
      console.error(err);
      setError(`Failed to load photos for "${userToLoad}". Contributor may not exist or network is offline.`);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Handle user change (e.g. from search or clicking sample)
  const handleUserChange = (newUsername) => {
    if (!newUsername || newUsername.trim() === '') return;
    const clean = newUsername.trim();
    setUsername(clean);
    updateUrl(clean, null);
    loadUserData(clean);
  };

  // Initial load
  useEffect(() => {
    loadUserData(username);
  }, [username, loadUserData]);

  // Load more photos for pagination and persist to local cache
  const handleLoadMore = useCallback(async () => {
    if (isFetchingRef.current || !hasMore || !continueToken) return;
    isFetchingRef.current = true;
    setLoadingMore(true);

    try {
      const nextBatch = await fetchUserPhotos(username, continueToken, 40);
      setPhotos((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newOnes = nextBatch.photos.filter((p) => !existingIds.has(p.id));
        const merged = [...prev, ...newOnes];

        // Persist newly appended photos to local cache!
        saveCachedContributor(username, {
          photos: merged,
          continueToken: nextBatch.continueToken,
          totalUploads: totalUploads || merged.length,
          userInfo: userInfo,
          hasMore: nextBatch.hasMore,
        });

        return merged;
      });
      setContinueToken(nextBatch.continueToken);
      setHasMore(nextBatch.hasMore);
    } catch (err) {
      console.error('Failed to load more photos:', err);
      triggerToast('Failed to load more photos. Check connection.');
    } finally {
      isFetchingRef.current = false;
      setLoadingMore(false);
    }
  }, [username, hasMore, continueToken, totalUploads, userInfo]);

  // Derive categories list with occurrence count from all loaded photos
  const categoriesList = useMemo(() => {
    const counts = {};
    for (const photo of photos) {
      if (!photo.categories) continue;
      for (const cat of photo.categories) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    }

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        isContent: isContentCategory(name),
      }))
      // Sort content categories first, then by frequency descending
      .sort((a, b) => {
        if (a.isContent && !b.isContent) return -1;
        if (!a.isContent && b.isContent) return 1;
        return b.count - a.count;
      });
  }, [photos]);

  // Handle Category select
  const handleSelectCategory = (catName) => {
    setSelectedCategory(catName);
    updateUrl(username, catName);
  };

  // Share album
  const handleShare = () => {
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      triggerToast('Portfolio link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Header with profile and stats */}
      <Header
        username={username}
        userInfo={userInfo}
        totalUploads={totalUploads}
        categoriesCount={categoriesList.length}
        onUserChange={handleUserChange}
        onShare={handleShare}
        onRefresh={() => loadUserData(username, true)}
        isRefreshing={isRefreshing}
        isFromCache={isFromCache}
        copied={copied}
      />

      {/* Categories Filter Bar */}
      {!loading && !error && photos.length > 0 && (
        <CategoryFilter
          categories={categoriesList}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          totalPhotosCount={photos.length}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState error={error} onRetry={() => loadUserData(username, true)} />
        ) : (
          <PhotoGrid
            photos={photos}
            selectedCategory={selectedCategory}
            onPhotoClick={(photo) => setActivePhoto(photo)}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            loadingMore={loadingMore}
            totalAvailable={totalUploads}
          />
        )}
      </main>

      {/* Lightbox / Fullscreen Google Photos viewer */}
      {activePhoto && (
        <PhotoLightbox
          photo={activePhoto}
          photos={
            selectedCategory
              ? photos.filter((p) =>
                  p.categories.some(
                    (c) => c.toLowerCase() === selectedCategory.toLowerCase()
                  )
                )
              : photos
          }
          onClose={() => setActivePhoto(null)}
          onSelectPhoto={(photo) => setActivePhoto(photo)}
          onFilterByCategory={(cat) => {
            handleSelectCategory(cat);
            setActivePhoto(null);
          }}
        />
      )}

      {/* Toast popup */}
      <Toast message={toastMessage} visible={showToast} />

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            Commons Photo Album • Powered by{' '}
            <a
              href="https://commons.wikimedia.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-blue-400 underline"
            >
              Wikimedia Commons
            </a>
          </p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">
              Viewing portfolio for <span className="text-blue-400 font-semibold">{username}</span>
            </span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300"
            >
              Open Source
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
