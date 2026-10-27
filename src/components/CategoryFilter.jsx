import React, { useState, useRef } from 'react';
import { Tag, ChevronRight, ChevronLeft, Search, X, Check } from 'lucide-react';

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  totalPhotosCount,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const filteredModalCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-900/95 sticky top-[137px] sm:top-[145px] z-20 border-b border-slate-800/80 backdrop-blur-md py-2.5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            {/* "All" button */}
            <button
              onClick={() => onSelectCategory(null)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm shrink-0 ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-500/50'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80'
              }`}
            >
              <span>All Photos</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedCategory === null
                    ? 'bg-blue-700/80 text-blue-100'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {totalPhotosCount}
              </span>
            </button>

            {/* Selected category if active and not already in top list */}
            {selectedCategory && !categories.slice(0, 15).some((c) => c.name === selectedCategory) && (
              <button
                onClick={() => onSelectCategory(null)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-500/50 whitespace-nowrap shrink-0"
              >
                <span>{selectedCategory}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Top categories pills */}
            {categories.slice(0, 18).map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => onSelectCategory(isSelected ? null : cat.name)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-500/50'
                      : 'bg-slate-800/90 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/70 hover:border-slate-600'
                  }`}
                >
                  <span className="truncate max-w-[200px]">{cat.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-700/80 text-slate-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => scroll('right')}
            className="hidden sm:flex items-center justify-center p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white shrink-0 transition-colors"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* All Categories Modal Button */}
          {categories.length > 5 && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 shrink-0 transition-colors"
              title="Browse all categories"
            >
              <Tag className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">All</span> ({categories.length})
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

      {/* Modal for All Categories */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-850 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-white text-base">Browse Categories</h3>
                <span className="text-xs text-slate-400">({categories.length} total)</span>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-750 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-slate-800 bg-slate-900/60">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Category List */}
            <div className="p-3 overflow-y-auto max-h-[50vh] divide-y divide-slate-800">
              {filteredModalCategories.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">
                  No categories matching "{searchTerm}"
                </div>
              ) : (
                filteredModalCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => {
                        onSelectCategory(cat.name);
                        setModalOpen(false);
                      }}
                      className={`w-full py-2.5 px-3 flex items-center justify-between text-left rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-blue-600/20 text-blue-300 font-semibold'
                          : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate pr-2">
                        {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                        <span className="text-sm truncate">{cat.name}</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 shrink-0">
                        {cat.count} photos
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex justify-between items-center text-xs text-slate-400">
              <span>Click any category to filter photos</span>
              {selectedCategory && (
                <button
                  onClick={() => {
                    onSelectCategory(null);
                    setModalOpen(false);
                  }}
                  className="text-blue-400 hover:text-white font-medium"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
