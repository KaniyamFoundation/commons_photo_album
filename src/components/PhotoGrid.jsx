import React, { useState, useMemo, useEffect, useRef } from 'react';
import PhotoCard from './PhotoCard';
import { Calendar, LayoutGrid, Clock, Columns, Loader2, ImageOff } from 'lucide-react';

export default function PhotoGrid({
  photos,
  selectedCategory,
  onPhotoClick,
  hasMore,
  onLoadMore,
  loadingMore,
  totalAvailable,
}) {
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'stream'
  const [layoutStyle, setLayoutStyle] = useState('grid'); // 'grid' (Google Photos square) or 'masonry'
  const sentinelRef = useRef(null);

  // Filter photos by selected category if any
  const filteredPhotos = useMemo(() => {
    if (!selectedCategory) return photos;
    return photos.filter((p) =>
      p.categories.some(
        (c) => c.toLowerCase() === selectedCategory.toLowerCase()
      )
    );
  }, [photos, selectedCategory]);

  // Group photos by Year/Month for Timeline view
  const groupedByTimeline = useMemo(() => {
    const groups = {};
    for (const photo of filteredPhotos) {
      const key = photo.yearMonth || 'Other';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(photo);
    }
    return groups;
  }, [filteredPhotos]);

  // Automatic infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loadingMore) {
          onLoadMore();
        }
      },
      {
        root: null, // viewport
        rootMargin: '400px', // trigger 400px before bottom
        threshold: 0.05,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadingMore, onLoadMore]);

  if (filteredPhotos.length === 0 && !loadingMore) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500">
          <ImageOff className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">No Photos Found</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          {selectedCategory
            ? `No photos found in category "${selectedCategory}" among the loaded photos.`
            : 'No photos found for this contributor.'}
        </p>
        {hasMore && (
          <button
            onClick={onLoadMore}
            className="mt-4 px-4 py-2 text-xs font-semibold text-blue-400 bg-blue-900/30 hover:bg-blue-900/50 rounded-lg border border-blue-800 transition-colors"
          >
            Load more photos to search deeper
          </button>
        )}
      </div>
    );
  }

  // Grid container classes based on layout style
  const getGridClasses = () => {
    if (layoutStyle === 'grid') {
      // Stable CSS Grid: zero reflow or shifting when scrolling up/down
      return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3.5';
    } else {
      // Masonry Columns
      return 'columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3.5 space-y-3.5';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between pb-5 mb-4 border-b border-slate-800 gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-300">
            Showing <strong className="text-white">{filteredPhotos.length}</strong>
            {totalAvailable && totalAvailable > filteredPhotos.length ? ` of ${totalAvailable}` : ''} photos
          </span>
          {selectedCategory && (
            <span className="text-blue-400 font-medium">in "{selectedCategory}"</span>
          )}
        </div>

        {/* View & Layout Style Toggles */}
        <div className="flex items-center gap-2">
          {/* Timeline vs Stream View */}
          <div className="flex items-center gap-1 bg-slate-850 p-1 rounded-lg border border-slate-700/80">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Timeline grouping by month/year"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Timeline</span>
            </button>
            <button
              onClick={() => setViewMode('stream')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'stream'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Continuous photo stream"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Stream</span>
            </button>
          </div>

          {/* Grid vs Masonry */}
          <div className="flex items-center gap-1 bg-slate-850 p-1 rounded-lg border border-slate-700/80">
            <button
              onClick={() => setLayoutStyle('grid')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                layoutStyle === 'grid'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Google Photos square grid (fast, stable)"
            >
              <LayoutGrid className="w-3 h-3" />
              <span className="hidden md:inline">Grid</span>
            </button>
            <button
              onClick={() => setLayoutStyle('masonry')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                layoutStyle === 'masonry'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Masonry aspect ratio layout"
            >
              <Columns className="w-3 h-3" />
              <span className="hidden md:inline">Masonry</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      {viewMode === 'timeline' ? (
        <div className="space-y-10">
          {Object.entries(groupedByTimeline).map(([period, groupPhotos]) => (
            <div key={period} className="relative">
              {/* Timeline Header (Google Photos sticky month header style) */}
              <div className="sticky top-[180px] sm:top-[190px] z-10 py-2 mb-3 bg-slate-900/95 backdrop-blur-sm flex items-center justify-between border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {period}
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-medium px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                  {groupPhotos.length} {groupPhotos.length === 1 ? 'photo' : 'photos'}
                </span>
              </div>

              {/* Photos for this period */}
              <div className={getGridClasses()}>
                {groupPhotos.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    onClick={onPhotoClick}
                    isSquare={layoutStyle === 'grid'}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Continuous Stream */
        <div className={getGridClasses()}>
          {filteredPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onClick={onPhotoClick}
              isSquare={layoutStyle === 'grid'}
            />
          ))}
        </div>
      )}

      {/* Infinite Scroll Sentinel & Loading Indicator */}
      {hasMore && (
        <div
          ref={sentinelRef}
          className="mt-8 py-10 flex flex-col items-center justify-center gap-2.5 text-slate-400"
        >
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-xs font-medium text-slate-400">
            Loading more photos automatically...
          </span>
        </div>
      )}

      {/* End of results indicator */}
      {!hasMore && filteredPhotos.length > 0 && (
        <div className="mt-12 py-10 text-center text-xs text-slate-500 flex items-center justify-center gap-3">
          <div className="h-px bg-slate-800 w-16 sm:w-24"></div>
          <span>All {totalAvailable || filteredPhotos.length} photos loaded</span>
          <div className="h-px bg-slate-800 w-16 sm:w-24"></div>
        </div>
      )}
    </div>
  );
}
