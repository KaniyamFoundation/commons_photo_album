import React, { useState } from 'react';
import { Calendar, Tag, Maximize2 } from 'lucide-react';
import { formatDate } from '../services/commonsApi';

export default function PhotoCard({ photo, onClick }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      onClick={() => onClick(photo)}
      className="group relative rounded-xl overflow-hidden bg-slate-800 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-black/40 transition-all duration-300 transform hover:-translate-y-0.5 border border-slate-800/80 hover:border-slate-700 select-none break-inside-avoid mb-4"
    >
      {/* Aspect ratio container */}
      <div
        className="w-full relative overflow-hidden bg-slate-850"
        style={{
          // Maintain realistic aspect ratio with sensible min/max boundaries
          paddingBottom: `${Math.min(Math.max((photo.height / photo.width) * 100, 60), 160)}%`,
        }}
      >
        {/* Placeholder skeleton while loading */}
        {!loaded && !error && (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-750 to-slate-800 animate-pulse" />
        )}

        {/* Thumbnail Image */}
        <img
          src={photo.thumbUrl}
          alt={photo.title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setError(true);
            setLoaded(true);
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Fallback if error */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-xs text-slate-400 bg-slate-800">
            <span>Failed to load preview</span>
          </div>
        )}

        {/* Dark gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3.5">
          {/* Top badges */}
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-semibold text-white/90 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
              {photo.width} × {photo.height}
            </span>
            <div className="p-1 rounded-full bg-black/60 text-white/80 backdrop-blur-md">
              <Maximize2 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Bottom details */}
          <div className="transform translate-y-1 group-hover:translate-y-0 transition-transform duration-200">
            <h4 className="text-white text-xs sm:text-sm font-semibold line-clamp-2 leading-tight drop-shadow-md">
              {photo.description || photo.title}
            </h4>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-300">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {formatDate(photo.dateTaken || photo.uploadDate)}
              </span>
              {photo.contentCategories && photo.contentCategories.length > 0 && (
                <span className="flex items-center gap-1 truncate max-w-[140px] text-blue-300">
                  <Tag className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{photo.contentCategories[0]}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
