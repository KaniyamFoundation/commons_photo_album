import React, { useState } from 'react';
import {
  Search,
  Image as ImageIcon,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Camera,
  Grid,
  Zap,
} from 'lucide-react';

export default function LandingPage({ onSelectUser }) {
  const [inputUser, setInputUser] = useState('');

  const sampleUsers = [
    { name: 'Tshrinivasan', role: 'Kaniyam Foundation Founder', count: '600+ photos' },
    { name: 'Yercaud-elango', role: 'Top Contributor', count: '26,000+ photos' },
    { name: 'Jkadavoor', role: 'Wildlife & Nature', count: '10,000+ photos' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputUser.trim();
    if (trimmed) {
      onSelectUser(trimmed);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="max-w-3xl w-full mx-auto text-center space-y-8 sm:space-y-10">
        {/* Hero Branding */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs sm:text-sm font-semibold shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Wikimedia Commons Contributor Portfolio Viewer</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Commons <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-teal-400 bg-clip-text text-transparent">Photo Album</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            A responsive, mobile-friendly Google Photos-style showcase for any Wikimedia Commons contributor. Turn standard upload lists into an elegant, interactive portfolio.
          </p>
        </div>

        {/* Input & Search Box */}
        <div className="bg-slate-850/90 border border-slate-700/80 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl text-left space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <label
              htmlFor="commons-username"
              className="block text-sm sm:text-base font-semibold text-white"
            >
              Give a Wikimedia Commons user name:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="commons-username"
                  type="text"
                  placeholder="e.g. Tshrinivasan, Yercaud-elango..."
                  value={inputUser}
                  onChange={(e) => setInputUser(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl text-base text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-sm sm:text-base font-bold shadow-lg shadow-blue-500/25 transition-all shrink-0 cursor-pointer"
              >
                <span>Explore Album</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Start Suggestions */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-xs sm:text-sm font-medium text-slate-400 block mb-2.5">
              Or explore popular contributors:
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleUsers.map((u) => (
                <button
                  key={u.name}
                  onClick={() => onSelectUser(u.name)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/80 hover:border-blue-500/60 text-slate-200 hover:text-white transition-all text-xs sm:text-sm group cursor-pointer"
                >
                  <span className="font-semibold text-blue-400 group-hover:text-blue-300">
                    {u.name}
                  </span>
                  <span className="text-slate-400 text-xs">({u.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-850/60 border border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-2">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">Google Photos Layout</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Timeline grouping by month and year, continuous stream, edge-to-edge masonry tiles, and chronological sorting.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-850/60 border border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-2">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">Smart Category Filter</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Intelligently filters subject categories, monuments, events, and topics with live photo counts and search.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-850/60 border border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-2">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white">Full-Res Lightbox</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Fullscreen viewer with copiable EXIF metadata, camera resolution, GPS map links, and direct Commons deed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
