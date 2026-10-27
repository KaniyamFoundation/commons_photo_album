import React, { useState } from 'react';
import {
  Search,
  Share2,
  ExternalLink,
  Image as ImageIcon,
  Calendar,
  Award,
  Check,
  Layers,
  RotateCw,
  Database,
} from 'lucide-react';
import { formatDate } from '../services/commonsApi';

export default function Header({
  username,
  userInfo,
  totalUploads,
  categoriesCount,
  onUserChange,
  onShare,
  onRefresh,
  isRefreshing,
  isFromCache,
  copied,
}) {
  const [searchInput, setSearchInput] = useState(username || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed && trimmed.toLowerCase() !== username.toLowerCase()) {
      onUserChange(trimmed);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'C';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
      {/* Top Navbar */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & App title */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => onUserChange(username)}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                Commons <span className="text-blue-400">Photos</span>
              </span>
            </div>
          </div>

          {/* Search username input with prompt */}
          <form onSubmit={handleSubmit} className="flex-1 max-w-xl mx-2 sm:mx-6 flex items-center gap-2.5">
            <span className="hidden sm:inline text-xs font-medium text-slate-300 whitespace-nowrap shrink-0">
              Give a wikimedia commons user name:
            </span>
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Give a wikimedia commons user name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-16 py-2 bg-slate-800/80 hover:bg-slate-800 focus:bg-slate-800 border border-slate-700/80 focus:border-blue-500 rounded-full text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-full transition-colors shadow"
              >
                Go
              </button>
            </div>
          </form>

          {/* External links, Sync & Share */}
          <div className="flex items-center gap-2">
            {/* Sync / Refresh cache */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh / Re-sync from Commons"
            >
              <RotateCw
                className={`w-3.5 h-3.5 text-slate-400 ${
                  isRefreshing ? 'animate-spin text-blue-400' : ''
                }`}
              />
              <span className="hidden sm:inline">Sync</span>
            </button>

            {/* Share */}
            <button
              onClick={onShare}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-lg transition-colors"
              title="Share album link"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
            </button>

            {/* Open Special:ListFiles */}
            <a
              href={`https://commons.wikimedia.org/wiki/Special:ListFiles/${encodeURIComponent(username)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
              title="Open Special:ListFiles on Commons"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Commons List</span>
            </a>

            {/* GitHub Repo */}
            <a
              href="https://github.com/KaniyamFoundation/commons_photo_album"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
              title="GitHub Repository (Kaniyam Foundation • Antigravity AI)"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Profile & Stats Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-850 border-t border-slate-800/60 px-4 sm:px-6 lg:px-8 py-5">
        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* User Identity */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-xl shadow-indigo-500/20 ring-4 ring-slate-800">
              {getInitials(username)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {username}
                </h1>
                <a
                  href={`https://commons.wikimedia.org/wiki/User:${encodeURIComponent(username)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-blue-400 transition-colors"
                  title="Wikimedia Commons User Page"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                {isFromCache && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                    <Database className="w-2.5 h-2.5" />
                    Cached
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Wikimedia Commons Contributor Portfolio
              </p>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl shadow-sm">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Photos</div>
                <div className="text-sm font-bold text-white">
                  {totalUploads !== null ? totalUploads.toLocaleString() : '...'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl shadow-sm">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Categories</div>
                <div className="text-sm font-bold text-white">
                  {categoriesCount !== null ? categoriesCount.toLocaleString() : '...'}
                </div>
              </div>
            </div>

            {userInfo?.registration && (
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl shadow-sm">
                <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Contributor Since</div>
                  <div className="text-sm font-bold text-white">
                    {formatDate(userInfo.registration)}
                  </div>
                </div>
              </div>
            )}

            {userInfo?.editcount !== undefined && userInfo.editcount > 0 && (
              <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl shadow-sm">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Edits</div>
                  <div className="text-sm font-bold text-white">
                    {userInfo.editcount.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
