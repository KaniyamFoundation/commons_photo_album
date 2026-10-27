import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div className="h-4 bg-slate-800 rounded w-48" />
        <div className="h-8 bg-slate-800 rounded-lg w-28" />
      </div>

      {/* Grid items */}
      <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3.5 space-y-3.5">
        {[200, 280, 180, 240, 320, 210, 190, 260, 220, 300, 180, 250].map((height, i) => (
          <div
            key={i}
            className="w-full bg-slate-800/80 rounded-xl overflow-hidden break-inside-avoid"
            style={{ height: `${height}px` }}
          />
        ))}
      </div>
    </div>
  );
}
