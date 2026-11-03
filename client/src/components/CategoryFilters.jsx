import React from 'react';

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Beverages', 'Dessert', 'Specials'];

export default function CategoryFilters({
  activeCategory,
  onSelectCategory,
  vegOnly,
  onToggleVeg,
  availableOnly,
  onToggleAvailable
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-slate-200/80 mb-6">
      
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-forest-800 text-white shadow-sm shadow-forest-800/20'
                  : 'bg-white text-slate-600 hover:text-forest-800 hover:bg-forest-50/50 border border-slate-200/80'
              }`}
            >
              {cat === 'All' ? 'All Dishes' : cat}
            </button>
          );
        })}
      </div>

      {/* Dietary & Availability Toggles */}
      <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 shrink-0">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={vegOnly}
            onChange={(e) => onToggleVeg(e.target.checked)}
            className="w-4 h-4 rounded text-forest-700 focus:ring-mint-500 accent-forest-700"
          />
          <span className="flex items-center gap-1.5">
            <span className="veg-icon"></span>
            <span>Veg Only</span>
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => onToggleAvailable(e.target.checked)}
            className="w-4 h-4 rounded text-forest-700 focus:ring-mint-500 accent-forest-700"
          />
          <span>In Stock Only</span>
        </label>
      </div>

    </div>
  );
}

