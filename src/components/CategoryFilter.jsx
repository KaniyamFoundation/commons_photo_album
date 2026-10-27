import React, { useState, useRef, useMemo } from 'react';
import { Tag, ChevronRight, ChevronLeft, Search, X, Check, ArrowDownAZ, ArrowDownWideNarrow } from 'lucide-react';

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  totalPhotosCount,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('count'); // 'count' or 'alpha'
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Filter and sort modal categories
  const filteredModalCategories = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    let result = categories.filter((c) =>
      c.name.toLowerCase().includes(term)
    );

    if (sortBy === 'alpha') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => b.count - a.count);
    }

    return result;
  }, [categories, searchTerm, sortBy]);

  // Top 15 categories for horizontal pill bar
  const topPillCategories = categories.slice(0, 15);
  const remainingCount = categories.length - topPillCategories.length;

  return (
    <div className="bg-slate-900/95 sticky top-[137px] sm:top-[145px] z-20 border-b border-slate-800/80 backdrop-blur-md py-2.5">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          {/* Scroll Left Button */}
          <button
            onClick={() => scroll('left')}
            className="hidden sm:flex items-center justify-center p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 transition-colors"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Horizontal Pill Bar */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 flex-1"
          >
            {/* "All Categories" button */}
            <button
              onClick={() => onSelectCategory(null)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shadow-sm shrink-0 ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-500/50'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80'
              }`}
            >
              <span>All Categories</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  selectedCategory === null
                    ? 'bg-blue-700/80 text-blue-100'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {totalPhotosCount}
              </span>
            </button>

            {/* Selected category pinned to front if not in top list */}
            {selectedCategory && !topPillCategories.some((c) => c.name === selectedCategory) && (
              <button
                onClick={() => onSelectCategory(null)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-500/50 whitespace-nowrap shrink-0"
                title="Click to clear filter"
              >
                <Tag className="w-3.5 h-3.5" />
                <span className="truncate max-w-[200px]">{selectedCategory}</span>
                <X className="w-4 h-4 ml-0.5" />
              </button>
            )}

            {/* Top categories pills */}
            {topPillCategories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => onSelectCategory(isSelected ? null : cat.name)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-500/50'
                      : 'bg-slate-800/90 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/70 hover:border-slate-600'
                  }`}
                >
                  <span className="truncate max-w-[200px]">{cat.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-700/80 text-slate-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}

            {/* "+N More" button in pill track when 100+ categories exist */}
            {remainingCount > 0 && (
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-slate-800/80 hover:bg-slate-700 text-blue-400 hover:text-white border border-blue-900/40 hover:border-blue-700 whitespace-nowrap shrink-0 transition-colors"
              >
                <span>+{remainingCount} More...</span>
              </button>
            )}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => scroll('right')}
            className="hidden sm:flex items-center justify-center p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white shrink-0 transition-colors"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Browse / Search All Categories Button */}
          {categories.length > 5 && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 shrink-0 transition-colors shadow-sm"
              title="Search and browse all categories"
            >
              <Search className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Explore ({categories.length})</span>
            </button>
          )}
        </div>

        {/* Active filter banner if category selected */}
        {selectedCategory && (
          <div className="mt-2 flex items-center justify-between bg-blue-950/40 border border-blue-900/50 rounded-lg px-3 py-1.5 text-xs text-blue-200">
            <div className="flex items-center gap-2 truncate">
              <span className="text-slate-400">Filtering by category:</span>
              <span className="font-semibold text-white bg-blue-600/50 px-2 py-0.5 rounded">
                {selectedCategory}
              </span>
            </div>
            <button
              onClick={() => onSelectCategory(null)}
              className="text-xs text-blue-400 hover:text-white flex items-center gap-1 shrink-0 font-medium ml-2"
            >
              <X className="w-3.5 h-3.5" /> Clear filter
            </button>
          </div>
        )}
      </div>

      {/* Modal for 100+ Categories (Searchable Category Explorer) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-850 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Category Explorer</h3>
                  <p className="text-xs text-slate-400">
                    {categories.length} total categories across loaded contributions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-750 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input & Sort Controls */}
            <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Type to filter categories (e.g. temples, birds, monuments)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-9 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Toggle (Most Photos vs Alphabetical) */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 shrink-0 self-end sm:self-auto text-xs">
                <button
                  onClick={() => setSortBy('count')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                    sortBy === 'count'
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Sort by most photos"
                >
                  <ArrowDownWideNarrow className="w-3.5 h-3.5" />
                  <span>Popular</span>
                </button>
                <button
                  onClick={() => setSortBy('alpha')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                    sortBy === 'alpha'
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Sort alphabetically A-Z"
                >
                  <ArrowDownAZ className="w-3.5 h-3.5" />
                  <span>A–Z</span>
                </button>
              </div>
            </div>

            {/* Quick Chips for Top Categories */}
            {!searchTerm && categories.length > 5 && (
              <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                <span className="text-[11px] text-slate-400 font-medium shrink-0">Top:</span>
                {categories.slice(0, 6).map((c) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      onSelectCategory(c.name);
                      setModalOpen(false);
                    }}
                    className="px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-blue-600/30 text-slate-300 hover:text-blue-300 text-[11px] border border-slate-700/60 shrink-0 transition-colors"
                  >
                    {c.name} ({c.count})
                  </button>
                ))}
              </div>
            )}

            {/* Category Cards (2 Columns on Desktop) */}
            <div className="p-3 sm:p-4 overflow-y-auto max-h-[55vh] flex-1">
              {filteredModalCategories.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-400">
                  <p>No categories found matching "{searchTerm}"</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-2 text-xs text-blue-400 hover:underline"
                  >
                    Clear search filter
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredModalCategories.map((cat) => {
                    const isSelected = selectedCategory === cat.name;
                    return (
                      <button
                        key={cat.name}
                        onClick={() => {
                          onSelectCategory(cat.name);
                          setModalOpen(false);
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all group ${
                          isSelected
                            ? 'bg-blue-600/25 border-blue-500 text-white font-semibold shadow-sm'
                            : 'bg-slate-800/60 hover:bg-slate-800 border-slate-750 hover:border-slate-600 text-slate-200 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <Tag
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isSelected ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400'
                            }`}
                          />
                          <span className="text-xs sm:text-sm truncate">{cat.name}</span>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700/80 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                          }`}
                        >
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-slate-800 bg-slate-900/90 flex justify-between items-center text-xs text-slate-400">
              <span>
                Showing {filteredModalCategories.length} of {categories.length} categories
              </span>
              <div className="flex items-center gap-3">
                {selectedCategory && (
                  <button
                    onClick={() => {
                      onSelectCategory(null);
                      setModalOpen(false);
                    }}
                    className="text-blue-400 hover:text-white font-medium"
                  >
                    Show All Photos
                  </button>
                )}
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
