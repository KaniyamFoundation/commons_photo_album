import React, { useState, useEffect } from 'react';
import { Calendar, Tag, Maximize2, Image as ImageIcon } from 'lucide-react';
import { formatDate } from '../services/commonsApi';

export default function PhotoCard({ photo, onClick, isSquare = true }) {
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(photo.thumbUrl);
  const [retried, setRetried] = useState(false);

  // Sync if photo changes
  useEffect(() => {
    setImgSrc(photo.thumbUrl);
    setError(false);
    setRetried(false);
  }, [photo.thumbUrl]);

  const handleError = () => {
    // If thumbnail failed, fallback once to the original Commons URL
    if (!retried && photo.originalUrl && photo.originalUrl !== imgSrc) {
      setRetried(true);
      setImgSrc(photo.originalUrl);
    } else {
      setError(true);
    }
  };

  return (
    <div
      onClick={() => onClick(photo)}
      className="group relative rounded-xl overflow-hidden bg-slate-850 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-black/50 transition-all duration-200 transform hover:-translate-y-0.5 border border-slate-800/80 hover:border-slate-700 select-none"
    >
      {/* Aspect Ratio Container */}
      <div
        className={`w-full relative overflow-hidden bg-slate-850 ${
          isSquare ? 'aspect-square' : ''
        }`}
        style={
          !isSquare
            ? {
                paddingBottom: `${Math.min(
                  Math.max((photo.height / photo.width) * 100, 65),
                  145
                )}%`,
              }
            : undefined
        }
      >
        {/* Subtle background placeholder (sits underneath image) */}
        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-slate-700/60" />
        </div>

        {/* Thumbnail Image - NEVER hidden with opacity-0 */}
        {!error ? (
          <img
            src={imgSrc}
            alt={photo.title}
            loading="lazy"
            decoding="async"
            onError={handleError}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 z-10"
          />
        ) : (
          /* Fallback when image fails completely */
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-3 text-center bg-slate-850 text-slate-400">
            <ImageIcon className="w-8 h-8 text-slate-600 mb-1.5" />
            <span className="text-[11px] font-medium text-slate-400 line-clamp-2 px-1">
              {photo.title}
            </span>
          </div>
        )}

        {/* Dark gradient overlay on hover */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3 pointer-events-none">
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
                <span className="flex items-center gap-1 truncate max-w-[120px] text-blue-300">
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
