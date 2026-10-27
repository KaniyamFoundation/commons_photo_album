import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div className="w-full px-3 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div className="h-4 bg-slate-800 rounded w-48" />
        <div className="h-8 bg-slate-800 rounded-lg w-28" />
      </div>

      {/* Grid items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
          <div
            key={i}
            className="w-full aspect-square bg-slate-800/80 rounded-xl overflow-hidden"
          />
        ))}
      </div>
    </div>
  );
}
