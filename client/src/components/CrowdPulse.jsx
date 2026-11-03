import React from 'react';
import { Activity, Clock, Armchair, BarChart3, PlusCircle, Info, MessageSquare } from 'lucide-react';

export default function CrowdPulse({ summary, onOpenModal }) {
  const currentLevel = summary?.currentLevel || 'Moderate';
  const avgWait = summary?.avgWait || '5-10 mins';
  const scheduleTrends = summary?.scheduleTrends || [];
  const recentReports = summary?.recentReports || [];

  return (
    <section id="crowd-section" className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-mint-500 animate-ping"></span>
              <h2 className="text-xl sm:text-2xl font-black text-forest-900 tracking-tight">Canteen Crowd Pulse</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-mint-50 text-forest-800 border border-mint-200">
                Community Vibe
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Check community wait-time vibes and voluntary crowd check-ins before heading to the canteen.
            </p>
          </div>

          <button
            onClick={onOpenModal}
            className="px-4 py-2.5 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-extrabold text-xs sm:text-sm transition flex items-center gap-2 shadow-xs self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-mint-300" />
            <span>Submit Voluntary Check-in</span>
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F5] border border-forest-100/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-800 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6 text-mint-700" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Current Queue Level</p>
              <h3 className="text-xl font-black text-forest-900">{currentLevel}</h3>
              <p className="text-[11px] text-slate-400 font-medium">Based on recent campus check-ins</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F5] border border-forest-100/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Counter Wait Estimate</p>
              <h3 className="text-xl font-black text-slate-900">~{avgWait}</h3>
              <p className="text-[11px] text-slate-400 font-medium">Pre-ordering skips the counter</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF9F5] border border-forest-100/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Armchair className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Seating Tip</p>
              <h3 className="text-base font-black text-slate-900">
                {currentLevel === 'Quiet' ? 'Plenty of tables open' : currentLevel === 'Busy' ? 'Seating packed, takeout advised' : 'Few seats available'}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Garden courtyard is quieter</p>
            </div>
          </div>

        </div>

        {/* Typical Campus Lunch & Break Trend Timeline */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold text-forest-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-mint-600" />
              <span>Campus Peak Rush & Break Trends (09:00 AM - 05:00 PM)</span>
            </h3>
            <span className="text-xs text-slate-400 hidden sm:inline">Typical Schedule Pattern</span>
          </div>

          {/* Visual Trend Bars */}
          <div className="grid grid-cols-7 gap-2 sm:gap-4 text-center">
            {scheduleTrends.map((slot) => {
              const barHeight = Math.max(20, slot.score);
              const colorClass =
                slot.crowdLevel === 'Busy'
                  ? 'bg-rose-400'
                  : slot.crowdLevel === 'Moderate'
                  ? 'bg-amber-400'
                  : 'bg-mint-400';

              return (
                <div key={slot.time} className="flex flex-col items-center gap-1.5">
                  <div className="h-28 w-full bg-slate-100/80 rounded-2xl p-1 flex flex-col justify-end items-center group">
                    <span className="text-[9px] font-bold text-slate-500 mb-1">{slot.crowdLevel}</span>
                    <div
                      className={`w-full ${colorClass} rounded-xl transition-all duration-500`}
                      style={{ height: `${barHeight}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-black text-slate-800">{slot.time}</span>
                  <span className="text-[10px] text-slate-400 truncate w-full">{slot.label}</span>
                </div>
              );
            })}
          </div>

          {/* Mandatory Disclaimer Box */}
          <div className="mt-5 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Notice:</strong> {summary?.disclaimer || 'Estimates are based on voluntary student check-ins and typical campus peak hours. This does not claim exact sensor occupancy.'}
            </p>
          </div>
        </div>

        {/* Recent Student Feedback Feed */}
        {recentReports.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-extrabold text-forest-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-mint-600" />
              <span>Recent Voluntary Student Notes</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {recentReports.map((r, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-slate-200/80 text-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-slate-900">{r.studentName}</span>
                      <span className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                        r.crowdLevel === 'Quiet'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.crowdLevel === 'Busy'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.crowdLevel}
                      </span>
                    </div>
                    <p className="text-slate-600 italic">
                      "{r.comment || 'Queue is moving normally.'}"
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex justify-between text-[10px] text-slate-400">
                    <span>Wait: {r.estimatedWait || '5-10m'}</span>
                    <span>{new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

