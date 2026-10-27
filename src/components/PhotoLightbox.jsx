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
  Minimize2,
  HardDrive,
  MapPin,
  Loader2,
  Copy,
} from 'lucide-react';
import { formatDate, formatBytes } from '../services/commonsApi';

export default function PhotoLightbox({
  photo,
  photos,
  onClose,
  onSelectPhoto,
  onFilterByCategory,
}) {
  // Show info drawer on the right side always by default
  const [showInfo, setShowInfo] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      if (e.key === 'f' || e.key === 'F') toggleFullScreen();
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

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('photo', photo.id);
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
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

  // Copy all details & full attribution summary
  const handleCopyAllInfo = () => {
    const lines = [
      `Title: ${photo.title}`,
      photo.description && photo.description !== photo.title
        ? `Description: ${photo.description}`
        : null,
      `Author: ${artistName}`,
      photo.dateTaken ? `Date Taken: ${formatDate(photo.dateTaken)}` : null,
      photo.uploadDate ? `Uploaded to Commons: ${formatDate(photo.uploadDate)}` : null,
      photo.width && photo.height
        ? `Resolution: ${photo.width} × ${photo.height} (${megaPixels} MP)`
        : null,
      photo.fileSize ? `File Size: ${formatBytes(photo.fileSize)}` : null,
      latFormatted && lngFormatted ? `Coordinates: ${latFormatted}, ${lngFormatted}` : null,
      `License: ${photo.license}`,
      photo.licenseUrl ? `License URL: ${photo.licenseUrl}` : null,
      photo.categories && photo.categories.length > 0
        ? `Categories: ${photo.categories.join(', ')}`
        : null,
      `Commons URL: ${photo.commonsUrl}`,
    ]
      .filter(Boolean)
      .join('\n');

    copyToClipboard(lines, 'all');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden animate-in fade-in duration-150">
      {/* Top Navigation Bar */}
      <div className="h-14 px-3 sm:px-5 flex items-center justify-between border-b border-white/10 bg-black/80 backdrop-blur-md z-30 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-xs text-white/70 font-medium hidden sm:inline">
            {currentIndex + 1} of {photos.length}
          </span>
          <span className="text-xs text-white/90 font-semibold truncate max-w-[200px] sm:max-w-md hidden md:inline">
            {photo.title}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Fullscreen browser toggle */}
          <button
            onClick={toggleFullScreen}
            className="p-2 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Share */}
          <button
            onClick={handleCopyLink}
            className="p-2 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors"
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
            className="p-2 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors"
            title="Download original resolution"
          >
            <Download className="w-4 h-4" />
          </a>

          {/* Open full page on Commons */}
          <a
            href={photo.commonsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full hover:bg-white/15 text-xs text-blue-400 hover:text-white transition-colors border border-blue-500/30"
            title="Open file page on Wikimedia Commons"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Commons</span>
          </a>

          {/* Toggle Info Drawer */}
          <button
            onClick={() => setShowInfo((prev) => !prev)}
            className={`p-2 rounded-full transition-colors ${
              showInfo
                ? 'bg-blue-600 text-white'
                : 'hover:bg-white/15 text-white/80 hover:text-white'
            }`}
            title="Toggle details panel (i)"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area: Side-by-side photo and info on desktop/tablet */}
      <div
        className="flex-1 flex flex-col md:flex-row overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Photo Container: Takes remaining space on the left */}
        <div className="flex-1 w-full h-full flex items-center justify-center relative overflow-hidden bg-black min-w-0 select-none">
          {/* Previous Button */}
          {hasPrev && (
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white transition-all backdrop-blur-md z-20 border border-white/10 flex items-center justify-center shadow-2xl group"
              title="Previous photo (Left arrow)"
            >
              <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" />
            </button>
          )}

          {/* Photo Display: Maximum viewport utilization */}
          <div className="w-full h-full flex items-center justify-center p-1 sm:p-3 relative">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            )}

            <img
              key={photo.id}
              src={photo.previewUrl || photo.thumbUrl || photo.originalUrl}
              alt={photo.title}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                if (e.target.src !== photo.thumbUrl) {
                  e.target.src = photo.thumbUrl;
                }
              }}
              className={`max-h-[calc(100vh-68px)] max-w-full w-auto h-auto object-contain rounded shadow-2xl transition-all duration-200 select-none ${
                imageLoaded ? 'opacity-100' : 'opacity-40'
              }`}
            />
          </div>

          {/* Next Button */}
          {hasNext && (
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white transition-all backdrop-blur-md z-20 border border-white/10 flex items-center justify-center shadow-2xl group"
              title="Next photo (Right arrow)"
            >
              <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>

        {/* Info Sidebar: Always docked on the right side with 100% copiable text */}
        {showInfo && (
          <aside className="w-full md:w-80 lg:w-96 bg-slate-900 border-t md:border-t-0 md:border-l border-white/10 flex flex-col overflow-y-auto shrink-0 z-20 h-72 md:h-full max-h-[50vh] md:max-h-full shadow-2xl select-text">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">Info & Details</h3>
                <button
                  onClick={handleCopyAllInfo}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors shadow-sm"
                  title="Copy all photo details & metadata to clipboard"
                >
                  {copiedField === 'all' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-300" />
                      <span>Copy All</span>
                    </>
                  )}
                </button>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Hide info panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-6 flex-1 text-xs select-text">
              {/* Title & Description */}
              <div className="group/title relative">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base font-bold text-white leading-snug break-words select-text cursor-text flex-1">
                    {photo.title}
                  </h2>
                  <button
                    onClick={() => copyToClipboard(photo.title, 'title')}
                    className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 shrink-0 transition-colors"
                    title="Copy title"
                  >
                    {copiedField === 'title' ? (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                {photo.description && photo.description !== photo.title && (
                  <div className="mt-2.5 flex items-start justify-between gap-2 p-3 rounded-lg bg-slate-850/70 border border-slate-800">
                    <p className="text-slate-300 leading-relaxed text-xs break-words select-text cursor-text flex-1">
                      {photo.description}
                    </p>
                    <button
                      onClick={() => copyToClipboard(photo.description, 'description')}
                      className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 shrink-0 transition-colors"
                      title="Copy description"
                    >
                      {copiedField === 'description' ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Contributor / Attribution */}
              <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-850 border border-slate-800">
                <div className="flex items-center gap-2.5 min-w-0 flex-1 select-text">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs shrink-0 select-none">
                    {artistName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1 select-text">
                    <div className="text-[10px] text-slate-400 select-text">Contributor</div>
                    <div className="text-xs font-semibold text-white truncate cursor-text select-text">
                      {artistName}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(artistName, 'artist')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                  title="Copy contributor name"
                >
                  {copiedField === 'artist' ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Timestamps */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 select-text flex-1">
                    <Calendar className="w-4 h-4 text-blue-400 shrink-0 mt-0.5 select-none" />
                    <div className="select-text">
                      <div className="text-slate-400 text-[11px] select-text">Date Taken</div>
                      <div className="text-slate-200 font-medium select-text cursor-text">
                        {formatDate(photo.dateTaken)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(formatDate(photo.dateTaken), 'dateTaken')}
                    className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Copy date taken"
                  >
                    {copiedField === 'dateTaken' ? (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {photo.uploadDate && (
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 select-text flex-1">
                      <Calendar className="w-4 h-4 text-teal-400 shrink-0 mt-0.5 select-none" />
                      <div className="select-text">
                        <div className="text-slate-400 text-[11px] select-text">Uploaded to Commons</div>
                        <div className="text-slate-200 font-medium select-text cursor-text">
                          {formatDate(photo.uploadDate)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(formatDate(photo.uploadDate), 'uploadDate')}
                      className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Copy upload date"
                    >
                      {copiedField === 'uploadDate' ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Photo Dimensions & Size */}
              <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 space-y-2.5 select-text">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300 select-text">
                    <Maximize2 className="w-3.5 h-3.5 text-indigo-400 select-none" />
                    <span>Resolution</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-white select-text cursor-text">
                      {photo.width} × {photo.height} {megaPixels ? `(${megaPixels} MP)` : ''}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${photo.width} × ${photo.height}${megaPixels ? ` (${megaPixels} MP)` : ''}`,
                          'resolution'
                        )
                      }
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Copy resolution"
                    >
                      {copiedField === 'resolution' ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {photo.fileSize > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300 select-text">
                      <HardDrive className="w-3.5 h-3.5 text-purple-400 select-none" />
                      <span>File Size</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white select-text cursor-text">
                        {formatBytes(photo.fileSize)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(formatBytes(photo.fileSize), 'filesize')}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Copy file size"
                      >
                        {copiedField === 'filesize' ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {latFormatted && lngFormatted && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300 select-text">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 select-none" />
                      <span>Coordinates</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://maps.google.com/?q=${photo.gps.lat},${photo.gps.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline font-mono text-[10px] select-text cursor-text"
                      >
                        {latFormatted}, {lngFormatted}
                      </a>
                      <button
                        onClick={() => copyToClipboard(`${latFormatted}, ${lngFormatted}`, 'coords')}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Copy coordinates"
                      >
                        {copiedField === 'coords' ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* License & Rights */}
              <div className="flex items-start justify-between gap-2 p-3 rounded-xl bg-slate-850 border border-slate-800 select-text">
                <div className="flex items-start gap-3 min-w-0 flex-1 select-text">
                  <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 select-none" />
                  <div className="min-w-0 flex-1 select-text">
                    <div className="text-[10px] text-slate-400 select-text">License</div>
                    <div className="text-xs font-semibold text-white select-text cursor-text">
                      {photo.license}
                    </div>
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
                <button
                  onClick={() => copyToClipboard(photo.license, 'license')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                  title="Copy license name"
                >
                  {copiedField === 'license' ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Categories */}
              {photo.categories && photo.categories.length > 0 && (
                <div className="select-text">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2 select-none">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-blue-400" />
                      <span>Categories ({photo.categories.length})</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(photo.categories.join(', '), 'categories')}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Copy list of all categories"
                    >
                      {copiedField === 'categories' ? (
                        <>
                          <Check className="w-3 h-3 text-green-400" />
                          <span className="text-green-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy List</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1 select-text">
                    {photo.categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          onFilterByCategory(cat);
                          onClose();
                        }}
                        className="px-2 py-1 rounded-md bg-slate-850 hover:bg-blue-600/30 text-slate-300 hover:text-blue-200 border border-slate-700/80 text-[11px] transition-colors truncate max-w-full text-left select-text cursor-pointer"
                        title={`Filter gallery by "${cat}"`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Direct Full Commons Page Button & Copy URL */}
              <div className="flex items-center gap-2 select-none">
                <a
                  href={photo.commonsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs transition-colors shadow-lg shadow-blue-600/20"
                >
                  <span>Open on Wikimedia Commons</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => copyToClipboard(photo.commonsUrl, 'commonsUrl')}
                  className="p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors shrink-0"
                  title="Copy Wikimedia Commons page URL"
                >
                  {copiedField === 'commonsUrl' ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
