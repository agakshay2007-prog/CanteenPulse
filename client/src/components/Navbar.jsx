import React from 'react';
import { Utensils, ShoppingBag, ShieldCheck, Users, Search } from 'lucide-react';

export default function Navbar({
  cartCount,
  cartTotal,
  onOpenCart,
  crowdSummary,
  onNavigate,
  activeSection,
  isAdmin,
  onToggleAdmin
}) {
  const vibe = crowdSummary?.currentLevel || 'Moderate';
  const wait = crowdSummary?.avgWait || '5-10m';

  const vibeColors = {
    Quiet: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Moderate: 'bg-amber-100 text-amber-800 border-amber-300',
    Busy: 'bg-rose-100 text-rose-800 border-rose-300'
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-forest-100/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => onNavigate('menu')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-forest-700 to-mint-600 flex items-center justify-center text-white shadow-md shadow-forest-700/20 group-hover:scale-105 transition">
            <Utensils className="w-5 h-5 text-mint-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-forest-900">
                Canteen<span className="text-mint-600">Pulse</span>
              </span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-forest-100 text-forest-700 tracking-wider">
                Campus
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block font-medium">Smart Online Canteen Hub</p>
          </div>
        </div>

        {/* Live Crowd Pulse Pill */}
        <button
          onClick={() => onNavigate('crowd')}
          className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer hover:brightness-95 transition ${vibeColors[vibe] || vibeColors.Moderate}`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-current pulse-dot"></span>
          <span>Crowd: {vibe}</span>
          <span className="opacity-40">|</span>
          <span className="font-medium">Wait: ~{wait}</span>
        </button>

        {/* Navigation Links */}
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="hidden lg:flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-600 mr-2">
            <button 
              onClick={() => onNavigate('menu')}
              className={`px-3 py-1.5 rounded-xl transition ${activeSection === 'menu' ? 'text-forest-800 bg-forest-50 font-bold' : 'hover:text-forest-700 hover:bg-slate-50'}`}
            >
              Menu
            </button>
            <button 
              onClick={() => onNavigate('crowd')}
              className={`px-3 py-1.5 rounded-xl transition ${activeSection === 'crowd' ? 'text-forest-800 bg-forest-50 font-bold' : 'hover:text-forest-700 hover:bg-slate-50'}`}
            >
              Crowd Pulse
            </button>
            <button 
              onClick={() => onNavigate('track')}
              className={`px-3 py-1.5 rounded-xl transition ${activeSection === 'track' ? 'text-forest-800 bg-forest-50 font-bold' : 'hover:text-forest-700 hover:bg-slate-50'}`}
            >
              Track Order
            </button>
            <button 
              onClick={() => onNavigate('reviews')}
              className={`px-3 py-1.5 rounded-xl transition ${activeSection === 'reviews' ? 'text-forest-800 bg-forest-50 font-bold' : 'hover:text-forest-700 hover:bg-slate-50'}`}
            >
              Reviews
            </button>
          </nav>

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-mint-50 text-forest-800 border border-mint-200 hover:bg-mint-100 hover:border-mint-300 transition flex items-center gap-2 shadow-xs"
          >
            <ShoppingBag className="w-5 h-5 text-mint-700" />
            <span className="hidden sm:inline font-bold text-xs">Cart</span>
            <span className="w-5 h-5 rounded-full bg-mint-600 text-white text-[11px] font-extrabold flex items-center justify-center">
              {cartCount}
            </span>
            <span className="hidden md:inline font-extrabold text-xs text-forest-900">
              ₹{cartTotal}
            </span>
          </button>

          {/* Admin Switcher */}
          <button
            onClick={onToggleAdmin}
            className={`px-3 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
              isAdmin
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-900'
                : 'bg-forest-900 hover:bg-forest-800 text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-mint-300" />
            <span>{isAdmin ? 'Student View' : 'Admin Staff'}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
