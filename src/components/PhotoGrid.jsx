import React, { useState, useMemo, useEffect, useRef } from 'react';
import PhotoCard from './PhotoCard';
import {
  Calendar,
  LayoutGrid,
  Clock,
  Columns,
  Loader2,
  ImageOff,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export default function PhotoGrid({
  photos,
  selectedCategory,
  onPhotoClick,
  hasMore,
  onLoadMore,
  loadingMore,
  totalAvailable,
  timeOrder: propTimeOrder,
  onTimeOrderChange,
}) {
  // Defaults requested: Stream, Masonry, Large
  const [viewMode, setViewMode] = useState('stream'); // 'stream' (default) or 'timeline'
  const [layoutStyle, setLayoutStyle] = useState('masonry'); // 'masonry' (default) or 'grid'
  const [tileSize, setTileSize] = useState('large'); // 'large' (default), 'medium', 'compact'
  const [localTimeOrder, setLocalTimeOrder] = useState('desc'); // 'desc' (Newest first) or 'asc' (Oldest first)

  const timeOrder = propTimeOrder || localTimeOrder;
  const setTimeOrder = onTimeOrderChange || setLocalTimeOrder;

  const sentinelRef = useRef(null);

  // Filter photos by selected category and sort according to timeOrder
  const filteredPhotos = useMemo(() => {
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

  // Group photos by Year/Month for Timeline view preserving chronological order
  const groupedByTimeline = useMemo(() => {
    const groups = new Map();
    for (const photo of filteredPhotos) {
      const key = photo.yearMonth || 'Other';
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(photo);
    }
    return Array.from(groups.entries());
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
        rootMargin: '500px', // trigger 500px before bottom
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
      <div className="w-full px-4 py-20 text-center">
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

  // Dynamic grid container classes based on layout and tile size
  const getGridClasses = () => {
    if (layoutStyle === 'grid') {
      if (tileSize === 'large') {
        // Full screen wide with big prominent photos
        return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5';
      } else if (tileSize === 'medium') {
        return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2.5 sm:gap-3.5';
      } else {
        // Compact
        return 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-1.5 sm:gap-2';
      }
    } else {
      // Masonry Columns (Cards have break-inside-avoid and bottom margin)
      if (tileSize === 'large') {
        return 'columns-1 sm:columns-2 md:columns-3 lg:columns-3 xl:columns-4 2xl:columns-5 gap-4 lg:gap-5';
      } else if (tileSize === 'medium') {
        return 'columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-3.5';
      } else {
        return 'columns-3 sm:columns-4 md:columns-6 lg:columns-7 xl:columns-8 gap-2';
      }
    }
  };

  return (
    <div className="w-full px-3 sm:px-6 lg:px-8 py-6">
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

        {/* View, Layout Style, Time Order & Tile Size Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tile Size Selector: Large, Medium, Compact */}
          <div className="flex items-center gap-1 bg-slate-850 p-1 rounded-lg border border-slate-700/80">
            <button
              onClick={() => setTileSize('large')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                tileSize === 'large'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Large full-screen photos (Default)"
            >
              Large
            </button>
            <button
              onClick={() => setTileSize('medium')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                tileSize === 'medium'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Medium size tiles"
            >
              Medium
            </button>
            <button
              onClick={() => setTileSize('compact')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                tileSize === 'compact'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Compact overview tiles"
            >
              Compact
            </button>
          </div>

          {/* Timeline vs Stream View */}
          <div className="flex items-center gap-1 bg-slate-850 p-1 rounded-lg border border-slate-700/80">
            <button
              onClick={() => setViewMode('stream')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'stream'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Continuous photo stream (Default)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Stream</span>
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Timeline grouping by month/year"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Timeline</span>
            </button>
          </div>

          {/* Time Order: Up arrow (Oldest first) vs Down arrow (Newest first) */}
          <div className="flex items-center gap-1 bg-slate-850 p-1 rounded-lg border border-slate-700/80" title="Sort by time order">
            <button
              onClick={() => setTimeOrder('desc')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                timeOrder === 'desc'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Newest photos first (Down arrow)"
              aria-label="Newest first"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Newest</span>
            </button>
            <button
              onClick={() => setTimeOrder('asc')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                timeOrder === 'asc'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Oldest photos first (Up arrow)"
              aria-label="Oldest first"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Oldest</span>
            </button>
          </div>

          {/* Masonry vs Grid */}
          <div className="flex items-center gap-1 bg-slate-850 p-1 rounded-lg border border-slate-700/80">
            <button
              onClick={() => setLayoutStyle('masonry')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                layoutStyle === 'masonry'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Masonry aspect ratio layout (Default)"
            >
              <Columns className="w-3 h-3" />
              <span className="hidden md:inline">Masonry</span>
            </button>
            <button
              onClick={() => setLayoutStyle('grid')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                layoutStyle === 'grid'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Square grid (Google Photos style)"
            >
              <LayoutGrid className="w-3 h-3" />
              <span className="hidden md:inline">Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      {viewMode === 'timeline' ? (
        <div className="space-y-10">
          {/* Timeline View Header & Time Order Bar */}
          <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-850/80 rounded-xl border border-slate-800 text-xs text-slate-300 gap-2 shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-white">Timeline Order:</span>
              <span className="text-slate-300">
                {timeOrder === 'desc' ? 'Newest to Oldest (Descending)' : 'Oldest to Newest (Ascending)'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-xs hidden sm:inline mr-1">Time order:</span>
              <button
                onClick={() => setTimeOrder('desc')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeOrder === 'desc'
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
                title="Sort Newest First (Down arrow)"
                aria-label="Newest first"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                <span>Newest first</span>
              </button>
              <button
                onClick={() => setTimeOrder('asc')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeOrder === 'asc'
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
                title="Sort Oldest First (Up arrow)"
                aria-label="Oldest first"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Oldest first</span>
              </button>
            </div>
          </div>

          {groupedByTimeline.map(([period, groupPhotos]) => (
            <div key={period} className="relative">
              {/* Timeline Header (Google Photos sticky month header style) */}
              <div className="sticky top-[96px] sm:top-[104px] z-10 py-2.5 mb-4 bg-slate-900/95 backdrop-blur-md flex items-center justify-between border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {period}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                    {groupPhotos.length} {groupPhotos.length === 1 ? 'photo' : 'photos'}
                  </span>
                </div>
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
