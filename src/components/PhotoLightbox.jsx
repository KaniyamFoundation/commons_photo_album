import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Info,
  ExternalLink,
  Calendar,
  Tag,
  Award,
  Check,
  Maximize2,
  HardDrive,
  MapPin,
  Loader2,
} from 'lucide-react';
import { formatDate, formatBytes } from '../services/commonsApi';

export default function PhotoLightbox({
  photo,
  photos,
  onClose,
  onSelectPhoto,
  onFilterByCategory,
}) {
  // Show info drawer by default only on desktop screens so mobile shows the photo full-screen
  const [showInfo, setShowInfo] = useState(() => window.innerWidth >= 1024);
  const [copied, setCopied] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const currentIndex = photos.findIndex((p) => p.id === photo.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  // Reset imageLoaded whenever photo changes
  useEffect(() => {
    setImageLoaded(false);
  }, [photo.id]);

  const handlePrev = () => {
    if (hasPrev) onSelectPhoto(photos[currentIndex - 1]);
  };

  const handleNext = () => {
    if (hasNext) onSelectPhoto(photos[currentIndex + 1]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'i' || e.key === 'I') setShowInfo((prev) => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, photos]);

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) handleNext(); // swipe left -> next
    if (diff < -50) handlePrev(); // swipe right -> prev
    setTouchStart(null);
  };

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('photo', photo.id);
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe megapixels calculation
  const megaPixels =
    photo.width && photo.height
      ? ((photo.width * photo.height) / 1000000).toFixed(1)
      : null;

  // Safe coordinates formatting
  const latFormatted = photo.gps?.lat ? Number(photo.gps.lat).toFixed(4) : null;
  const lngFormatted = photo.gps?.lng ? Number(photo.gps.lng).toFixed(4) : null;
  const artistName = photo.artist || 'Contributor';

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col backdrop-blur-md select-none overflow-hidden animate-in fade-in duration-150">
      {/* Top Navigation Bar */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-white/10 bg-black/60 z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-xs text-white/70 font-medium hidden sm:inline">
            {currentIndex + 1} of {photos.length}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Share */}
          <button
            onClick={handleCopyLink}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            title="Copy photo link"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Download Original */}
          <a
            href={photo.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            title="Download full resolution"
          >
            <Download className="w-4 h-4" />
          </a>

          {/* Open full page on Commons */}
          <a
            href={photo.commonsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full hover:bg-white/10 text-xs text-blue-400 hover:text-white transition-colors border border-blue-500/30"
            title="Open file page on Wikimedia Commons"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Commons Page</span>
          </a>

          {/* Toggle Info Drawer */}
          <button
            onClick={() => setShowInfo((prev) => !prev)}
            className={`p-2 rounded-full transition-colors ${
              showInfo ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-white/80 hover:text-white'
            }`}
            title="Toggle details panel (i)"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content: Photo view + Info sidebar */}
      <div
        className="flex-1 flex overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Photo Container */}
        <div className="flex-1 flex items-center justify-center p-2 sm:p-6 relative overflow-hidden">
          {/* Previous Button */}
          {hasPrev && (
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition-all backdrop-blur-md z-10 border border-white/10 hidden sm:flex items-center justify-center"
              title="Previous photo (Left arrow)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Photo with progressive loading */}
          <div className="max-w-full max-h-full flex items-center justify-center relative">
            {/* Loading spinner while high-res loads */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            )}

            <img
              key={photo.id}
              src={photo.originalUrl || photo.thumbUrl}
              alt={photo.title}
              onLoad={() => setImageLoaded(true)}
              className={`max-h-[calc(100vh-80px)] max-w-full object-contain rounded-lg shadow-2xl transition-opacity duration-300 select-none ${
                imageLoaded ? 'opacity-100' : 'opacity-40'
              }`}
            />
          </div>

          {/* Next Button */}
          {hasNext && (
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition-all backdrop-blur-md z-10 border border-white/10 hidden sm:flex items-center justify-center"
              title="Next photo (Right arrow)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Info Sidebar (like Google Photos info panel) */}
        {showInfo && (
          <aside className="w-full sm:w-96 bg-slate-900 border-l border-white/10 flex flex-col overflow-y-auto shrink-0 z-20 absolute sm:relative inset-y-0 right-0 max-h-full shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Info & Details</h3>
              <button
                onClick={() => setShowInfo(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-6 flex-1 text-xs">
              {/* Title & Description */}
              <div>
                <h2 className="text-base font-bold text-white leading-snug break-words">
                  {photo.title}
                </h2>
                {photo.description && photo.description !== photo.title && (
                  <p className="mt-2 text-slate-300 leading-relaxed text-xs break-words">
                    {photo.description}
                  </p>
                )}
              </div>

              {/* Contributor */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-850 border border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                  {artistName.charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <div className="text-[10px] text-slate-400">Contributor</div>
                  <div className="text-xs font-semibold text-white truncate">{artistName}</div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-400 text-[11px]">Date Taken</div>
                    <div className="text-slate-200 font-medium">
                      {formatDate(photo.dateTaken)}
                    </div>
                  </div>
                </div>

                {photo.uploadDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-slate-400 text-[11px]">Uploaded to Commons</div>
                      <div className="text-slate-200 font-medium">
                        {formatDate(photo.uploadDate)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Photo Dimensions & Size */}
              <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Resolution</span>
                  </div>
                  <span className="font-semibold text-white">
                    {photo.width} × {photo.height} {megaPixels ? `(${megaPixels} MP)` : ''}
                  </span>
                </div>

                {photo.fileSize > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300">
                      <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                      <span>File Size</span>
                    </div>
                    <span className="font-semibold text-white">
                      {formatBytes(photo.fileSize)}
                    </span>
                  </div>
                )}

                {latFormatted && lngFormatted && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>Coordinates</span>
                    </div>
                    <a
                      href={`https://maps.google.com/?q=${photo.gps.lat},${photo.gps.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline font-mono text-[10px]"
                    >
                      {latFormatted}, {lngFormatted}
                    </a>
                  </div>
                )}
              </div>

              {/* License & Rights */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-850 border border-slate-800">
                <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1 truncate">
                  <div className="text-[10px] text-slate-400">License</div>
                  <div className="text-xs font-semibold text-white truncate">{photo.license}</div>
                  {photo.licenseUrl && (
                    <a
                      href={photo.licenseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                    >
                      View license deed <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Categories */}
              {photo.categories && photo.categories.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-2">
                    <Tag className="w-3.5 h-3.5 text-blue-400" />
                    <span>Categories ({photo.categories.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {photo.categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          onFilterByCategory(cat);
                          onClose();
                        }}
                        className="px-2 py-1 rounded-md bg-slate-800 hover:bg-blue-600/30 text-slate-300 hover:text-blue-200 border border-slate-700/80 text-[11px] transition-colors truncate max-w-full text-left"
                        title={`Filter gallery by "${cat}"`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Direct Full Commons Page Button */}
              <a
                href={photo.commonsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs transition-colors shadow-lg shadow-blue-600/20"
              >
                <span>Open Full Page on Wikimedia Commons</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
