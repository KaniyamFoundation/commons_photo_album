import React, { useState, useMemo } from 'react';
import PhotoCard from './PhotoCard';
import { Calendar, LayoutGrid, Clock, Loader2, ImageOff } from 'lucide-react';

export default function PhotoGrid({
  photos,
  selectedCategory,
  onPhotoClick,
  hasMore,
  onLoadMore,
  loadingMore,
  totalAvailable,
}) {
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'grid'

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

  if (filteredPhotos.length === 0) {
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
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Controls Bar */}
      <div className="flex items-center justify-between pb-5 mb-4 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-300">
            Showing <strong className="text-white">{filteredPhotos.length}</strong>
            {totalAvailable && totalAvailable > filteredPhotos.length ? ` of ${totalAvailable}` : ''} photos
          </span>
          {selectedCategory && (
            <span className="text-blue-400 font-medium">in "{selectedCategory}"</span>
          )}
        </div>

        {/* View Mode Toggle */}
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
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Continuous masonry grid"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid</span>
          </button>
        </div>
      </div>

      {/* Grid Content */}
      {viewMode === 'timeline' ? (
        <div className="space-y-10">
          {Object.entries(groupedByTimeline).map(([period, groupPhotos]) => (
            <div key={period} className="relative">
              {/* Timeline Header (Google Photos sticky month header style) */}
              <div className="sticky top-[180px] sm:top-[190px] z-10 py-2 mb-3 bg-slate-900/90 backdrop-blur-sm flex items-center justify-between border-b border-slate-800/60">
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

              {/* Masonry Columns for this period */}
              <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3.5">
                {groupPhotos.map((photo) => (
                  <PhotoCard key={photo.id} photo={photo} onClick={onPhotoClick} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Continuous Masonry Columns */
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3.5">
          {filteredPhotos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} onClick={onPhotoClick} />
          ))}
        </div>
      )}

      {/* Load More Button / Indicator */}
      {hasMore && !selectedCategory && (
        <div className="mt-12 text-center pb-8">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-750 text-white font-semibold text-sm rounded-full border border-slate-700 shadow-md transition-all hover:border-slate-600 disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span>Loading more photos...</span>
              </>
            ) : (
              <span>Load More Photos</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
