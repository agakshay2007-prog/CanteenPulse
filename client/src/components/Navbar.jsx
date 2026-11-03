import React from 'react';
import { Search, ShoppingBag, ShieldCheck, User, Sparkles } from 'lucide-react';

export default function Navbar({
  cartCount,
  cartTotal,
  onOpenCart,
  crowdSummary,
  onNavigate,
  activeSection,
  isAdmin,
  onToggleAdmin,
  searchQuery,
  onSearchChange
}) {
  const vibe = crowdSummary?.currentLevel || 'Moderate';
  const wait = crowdSummary?.avgWait || '5-10m';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Brand Logo - Matching reference with green circular C badge */}
        <div 
          onClick={() => onNavigate('menu')} 
          className="flex items-center gap-2.5 cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center text-white font-black text-sm shadow-sm">
            C
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Canteen<span className="text-[#10B981]">Pulse</span>
          </span>
        </div>

        {/* Center Pill Search Bar - Exact match to reference screenshot */}
        <div className="flex-1 max-w-md mx-2 sm:mx-6">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search for food..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100/90 hover:bg-gray-100 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#10B981]/30 focus:border-[#10B981] transition border border-transparent shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Live Crowd Pulse Pill */}
          <button
            onClick={() => onNavigate('crowd')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot"></span>
            <span>Vibe: {vibe} (~{wait})</span>
          </button>

          {/* Quick Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-gray-600">
            <button 
              onClick={() => onNavigate('menu')}
              className={`px-3 py-1.5 rounded-full transition ${activeSection === 'menu' ? 'text-[#10B981] font-bold bg-emerald-50' : 'hover:text-gray-900'}`}
            >
              Menu
            </button>
            <button 
              onClick={() => onNavigate('track')}
              className={`px-3 py-1.5 rounded-full transition ${activeSection === 'track' ? 'text-[#10B981] font-bold bg-emerald-50' : 'hover:text-gray-900'}`}
            >
              Track Order
            </button>
            <button 
              onClick={() => onNavigate('reviews')}
              className={`px-3 py-1.5 rounded-full transition ${activeSection === 'reviews' ? 'text-[#10B981] font-bold bg-emerald-50' : 'hover:text-gray-900'}`}
            >
              Reviews
            </button>
          </nav>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="p-2 sm:px-3 sm:py-2 rounded-full bg-gray-100 hover:bg-gray-200/80 text-gray-800 transition flex items-center gap-1.5 shadow-2xs"
            title="Open Cart"
          >
            <ShoppingBag className="w-4 h-4 text-gray-700" />
            <span className="w-5 h-5 rounded-full bg-[#10B981] text-white text-[11px] font-black flex items-center justify-center">
              {cartCount}
            </span>
            <span className="hidden sm:inline font-bold text-xs text-gray-900">
              ₹{cartTotal}
            </span>
          </button>

          {/* Admin Switcher / Profile */}
          <button
            onClick={onToggleAdmin}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
              isAdmin
                ? 'bg-amber-500 hover:bg-amber-600 text-gray-900'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            title="Canteen Staff Portal"
          >
            <User className="w-4 h-4 text-gray-600" />
            <span className="hidden sm:inline">{isAdmin ? 'Student View' : 'Admin'}</span>
          </button>

        </div>

      </div>
    </header>
  );
}
