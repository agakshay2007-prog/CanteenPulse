import React from 'react';

const CATEGORIES = [
  { id: 'All', label: 'All Dishes', icon: '🌿' },
  { id: 'Breakfast', label: 'Breakfast', icon: '🥪' },
  { id: 'Lunch', label: 'Lunch Meals', icon: '🍛' },
  { id: 'Snacks', label: 'Fast Food', icon: '🍔' },
  { id: 'Beverages', label: 'Drinks & Coffee', icon: '🥤' },
  { id: 'Dessert', label: 'Desserts', icon: '🍩' },
  { id: 'Specials', label: 'Specials', icon: '⭐' }
];

export default function Hero({
  activeCategory,
  onSelectCategory,
  vegOnly,
  onToggleVeg,
  availableOnly,
  onToggleAvailable
}) {
  return (
    <section className="pt-6 sm:pt-8 pb-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Small Greeting Header - Exact match to reference screenshot */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
          <span>Hello</span> <span>👋</span>
        </p>
        <h2 className="text-sm font-extrabold text-gray-900 tracking-tight">
          CanteenPulse
        </h2>
      </div>

      {/* Horizontal Category Pill Bar - Exact match to reference screenshot */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap shadow-2xs ${
                isActive
                  ? 'bg-[#10B981] text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-gray-100'
              }`}
            >
              <span className="text-sm leading-none">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Big Bold Headline - Exact match to reference screenshot */}
      <div className="mt-8 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-6xl font-black text-gray-950 tracking-tight leading-tight">
            Food on your Campus
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
            Good Food. Less Waiting. Pre-order online and collect at Express Counter #1.
          </p>
        </div>

        {/* Dietary toggles */}
        <div className="flex items-center gap-3 text-xs font-semibold text-gray-600 bg-white/70 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-gray-200/60 shadow-2xs self-start sm:self-auto">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={vegOnly}
              onChange={(e) => onToggleVeg(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-[#10B981]"
            />
            <span>Veg Only 🟢</span>
          </label>
          <span className="text-gray-300">|</span>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => onToggleAvailable(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-[#10B981]"
            />
            <span>In Stock Only</span>
          </label>
        </div>
      </div>

    </section>
  );
}
