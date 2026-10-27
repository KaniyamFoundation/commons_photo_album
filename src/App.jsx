import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Header from './components/Header';
import CategoryFilter from './components/CategoryFilter';
import PhotoGrid from './components/PhotoGrid';
import PhotoLightbox from './components/PhotoLightbox';
import LoadingSkeleton from './components/LoadingSkeleton';
import ErrorState from './components/ErrorState';
import LandingPage from './components/LandingPage';
import Toast from './components/Toast';
import { ArrowUp } from 'lucide-react';
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
  // If hosted on GitHub Pages (e.g. kaniyamfoundation.github.io/commons_photo_album/)
  // or a subfolder, ignore the repo name segment so it doesn't get treated as a username.
  let pathSegments = window.location.pathname
    .split('/')
    .filter((s) => s && s !== 'index.html' && !s.includes('.'));

  if (
    window.location.hostname.includes('github.io') ||
    pathSegments[0] === 'commons_photo_album'
  ) {
    pathSegments = pathSegments.slice(1);
  }

  if (pathSegments.length > 0) {
    const cleanPath = decodeURIComponent(pathSegments[0].trim());
    if (cleanPath) return cleanPath;
  }

  // Default to null on first load so users see informative landing & search
  return null;
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
  const [showGoTop, setShowGoTop] = useState(false);
  const [timeOrder, setTimeOrder] = useState('desc'); // 'desc' (Newest first) or 'asc' (Oldest first)
  const isFetchingRef = useRef(false);

  // Monitor scroll position for "Go to Top" button
  useEffect(() => {
    const handleScroll = () => {
      setShowGoTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Sync browser URL whenever username changes
  const updateUrl = useCallback((newUsername, category = null) => {
    const base = window.location.origin + window.location.pathname;
    const url = new URL(base);
    if (newUsername) {
      url.hash = `#/${encodeURIComponent(newUsername)}`;
      if (category) {
        url.searchParams.set('category', category);
      } else {
        url.searchParams.delete('category');
      }
    } else {
      url.hash = '';
      url.search = '';
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
          // If totalUploads was capped at 1000 by previous bug, show loading until fresh count arrives
          if (cached.totalUploads === 1000) {
            setTotalUploads(null);
          } else {
            setTotalUploads(cached.totalUploads);
          }
          setPhotos(cached.photos);
          setContinueToken(cached.continueToken);
          setHasMore(cached.hasMore);
          setIsFromCache(true);
          setLoading(false);

          // Always revalidate total uploads count in background
          fetchTotalUploadCount(userToLoad).then((freshCount) => {
            if (freshCount && freshCount > 0) {
              setTotalUploads(freshCount);
              saveCachedContributor(userToLoad, {
                ...cached,
                totalUploads: freshCount,
              });
            }
          });
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

  // Handle user change (e.g. from search, clicking sample, or clicking logo to reset)
  const handleUserChange = (newUsername) => {
    if (!newUsername || (typeof newUsername === 'string' && newUsername.trim() === '')) {
      setUsername(null);
      setPhotos([]);
      setUserInfo(null);
      setTotalUploads(null);
      setError(null);
      setLoading(false);
      updateUrl(null);
      return;
    }
    const clean = newUsername.trim();
    setUsername(clean);
    updateUrl(clean, null);
    loadUserData(clean);
  };

  // Initial load and username sync
  useEffect(() => {
    if (username) {
      loadUserData(username);
    } else {
      setLoading(false);
      setPhotos([]);
      setUserInfo(null);
      setTotalUploads(null);
      setError(null);
    }
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

  // Filter and sort photos matching user category and chronological timeOrder
  const sortedCategoryPhotos = useMemo(() => {
    let result = photos;
    if (selectedCategory) {
      result = photos.filter((p) =>
        p.categories.some(
          (c) => c.toLowerCase() === selectedCategory.toLowerCase()
        )
      );
    }
    return [...result].sort((a, b) => {
      const timeA = new Date(a.uploadDate || a.dateTaken || 0).getTime() || 0;
      const timeB = new Date(b.uploadDate || b.dateTaken || 0).getTime() || 0;
      return timeOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });
  }, [photos, selectedCategory, timeOrder]);

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
      <main className="flex-1 flex flex-col">
        {!username ? (
          <LandingPage onSelectUser={handleUserChange} />
        ) : loading ? (
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
            timeOrder={timeOrder}
            onTimeOrderChange={setTimeOrder}
          />
        )}
      </main>

      {/* Lightbox / Fullscreen Google Photos viewer */}
      {activePhoto && (
        <PhotoLightbox
          photo={activePhoto}
          photos={sortedCategoryPhotos}
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

      {/* Floating Go to Top Button on right side */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-40 p-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-2xl shadow-blue-500/40 border border-blue-400/30 transition-all duration-300 flex items-center justify-center group ${
          showGoTop
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-4 scale-75 pointer-events-none'
        }`}
        title="Go to top"
        aria-label="Go to top"
      >
        <ArrowUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
      </button>

      {/* Floating Attribution Bar: Always visible while scrolling so footer info is never unreachable */}
      {username && (
        <div className="fixed bottom-6 left-4 sm:left-6 z-40 hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl text-xs text-slate-300 select-none">
          <span>
            Made with dedication by{' '}
            <a
              href="https://kaniyam.com/foundation"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Kaniyam Foundation
            </a>{' '}
            and{' '}
            <span className="text-teal-400 font-semibold">Antigravity</span>
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-900/50 text-purple-300 border border-purple-700/50">
            🤖 AI-written code
          </span>
          <span className="text-slate-600">•</span>
          <a
            href="https://github.com/KaniyamFoundation/commons_photo_album"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-white flex items-center gap-1 font-medium transition-colors"
            title="GitHub Repository"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span>Repo</span>
          </a>
        </div>
      )}

      {/* Main Page Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-slate-400">
            <span>
              Made with dedication by{' '}
              <a
                href="https://kaniyam.com/foundation"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2 transition-colors"
              >
                Kaniyam Foundation
              </a>{' '}
              and{' '}
              <span className="text-teal-400 font-semibold">Antigravity</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-900/40 text-purple-300 border border-purple-700/50">
              <span>🤖</span> 100% AI-written code with Antigravity
            </span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span>
              Powered by{' '}
              <a
                href="https://commons.wikimedia.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white underline underline-offset-2 transition-colors"
              >
                Wikimedia Commons
              </a>
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            {username ? (
              <span>
                Viewing portfolio for <span className="text-blue-400 font-medium">{username}</span>
              </span>
            ) : (
              <span>Wikimedia Commons Contributor Showcase</span>
            )}
            <span className="text-slate-700">•</span>
            <a
              href="https://github.com/KaniyamFoundation/commons_photo_album"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
              title="View source code on GitHub"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>GitHub Repo</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
