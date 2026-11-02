import React from 'react';
import { Search, Sparkles, Clock, CheckCircle2, Users } from 'lucide-react';

export default function Hero({ searchQuery, onSearchChange, onReportCrowd, onExploreMenu, crowdSummary }) {
  const currentVibe = crowdSummary?.currentLevel || 'Moderate';
  const waitTime = crowdSummary?.avgWait || '5-10 mins';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-forest-50/70 via-mint-50/40 to-transparent py-8 sm:py-14 border-b border-forest-100/50">
      
      {/* Decorative Mint Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-mint-200/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute -bottom-10 left-10 w-72 h-72 bg-cream-200/40 rounded-full blur-2xl pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          {/* Main Hero Copy */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-100/80 border border-forest-200 text-forest-800 text-xs font-bold mb-4 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-mint-600" />
              <span>Campus Pre-Ordering & Live Crowd Vibe</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-forest-900 tracking-tight leading-[1.12]">
              Good Food. <br />
              <span className="text-mint-600">Less Waiting.</span>
            </h1>

            <p className="mt-3.5 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Order meals online directly from your phone. Pick a convenient collection slot, check live crowd vibes, and walk straight to Express Counter #1 without queueing.
            </p>

            {/* Hero Search Bar */}
            <div className="mt-6 relative max-w-lg">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search food by name (e.g. Masala Dosa, Biryani, Chai)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-forest-200/90 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-mint-500/30 focus:border-mint-600 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded bg-slate-100"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Badges */}
            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5 text-forest-700">
                <CheckCircle2 className="w-4 h-4 text-mint-600" />
                <span>Express Pickup Counter #1</span>
              </div>
              <div className="flex items-center gap-1.5 text-forest-700">
                <Clock className="w-4 h-4 text-mint-600" />
                <span>Hot & Freshly Cooked</span>
              </div>
              <div className="flex items-center gap-1.5 text-forest-700">
                <Users className="w-4 h-4 text-mint-600" />
                <span>Community Crowd Pulse</span>
              </div>
            </div>
          </div>

          {/* Quick Crowd Status Card */}
          <div className="lg:w-80 bg-white/95 backdrop-blur-md rounded-3xl border border-forest-100 p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Canteen Pulse</span>
                <span className="w-2.5 h-2.5 rounded-full bg-mint-500 pulse-dot"></span>
              </div>

              <div className="my-4">
                <p className="text-xs font-medium text-slate-500">Current Queue Vibe</p>
                <h3 className="text-2xl font-black text-forest-900 mt-0.5">{currentVibe}</h3>
                <p className="text-xs text-mint-700 font-semibold mt-1">Est. wait: ~{waitTime}</p>
              </div>

              <p className="text-[11px] text-slate-400 leading-normal bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                Based on voluntary campus reports. Skip the peak rush by reserving your collection slot.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={onExploreMenu}
                className="flex-1 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition shadow-xs"
              >
                Order Now
              </button>
              <button
                onClick={onReportCrowd}
                className="px-3.5 py-2.5 rounded-xl bg-mint-50 hover:bg-mint-100 text-forest-800 border border-mint-200 text-xs font-bold transition"
              >
                Report Vibe
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
