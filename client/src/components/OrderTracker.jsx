import React, { useState } from 'react';
import { Search, PackageCheck, ChefHat, BellRing, Smile, AlertCircle, RefreshCw, Clock } from 'lucide-react';

const STATUS_STEPS = [
  { key: 'Pending', label: '1. Pending', desc: 'Received by Kitchen', icon: PackageCheck },
  { key: 'Confirmed', label: '2. Confirmed', desc: 'Order Accepted', icon: PackageCheck },
  { key: 'Preparing', label: '3. Preparing', desc: 'Cooking Fresh', icon: ChefHat },
  { key: 'Ready for Pickup', label: '4. Ready', desc: 'At Counter #1', icon: BellRing },
  { key: 'Completed', label: '5. Completed', desc: 'Picked Up', icon: Smile }
];

export default function OrderTracker({
  trackedOrder,
  onSearchOrder,
  onRefresh,
  isLoading,
  error
}) {
  const [searchInput, setSearchInput] = useState(trackedOrder?.orderNumber || '');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchOrder(searchInput.trim().toUpperCase());
    }
  };

  const currentStatus = trackedOrder?.status || 'Pending';
  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <section id="track-section" className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-8">
        
        {/* Section Header & Lookup Input */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-forest-600 pulse-dot"></span>
              <h2 className="text-xl sm:text-2xl font-black text-forest-900 tracking-tight">Live Order Tracker</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Enter your Order Number (e.g. <strong>CP-101</strong>) to check preparation status.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Order Number (e.g. CP-101)"
                className="pl-4 pr-10 py-2.5 rounded-2xl border border-slate-200 bg-[#FAF9F5] text-xs sm:text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-mint-500/20 focus:border-forest-600 focus:outline-none w-56 sm:w-64"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-forest-800 text-white hover:bg-forest-900 transition"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Order Display Box */}
        {trackedOrder ? (
          <div className="mt-6 bg-[#FAF9F5] rounded-3xl border border-slate-200/80 p-5 sm:p-8 space-y-6">
            
            {/* Order Header Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/80 gap-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Active Campus Order
                </span>
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-black text-forest-900 font-mono tracking-tight">
                    {trackedOrder.orderNumber}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    trackedOrder.status === 'Ready for Pickup'
                      ? 'bg-mint-100 text-forest-900 border border-mint-300'
                      : trackedOrder.status === 'Preparing'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : trackedOrder.status === 'Completed'
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-blue-100 text-blue-900 border border-blue-300'
                  }`}>
                    {trackedOrder.status}
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pickup Window</span>
                <p className="text-sm font-black text-forest-900 flex items-center gap-1 sm:justify-end mt-0.5">
                  <Clock className="w-4 h-4 text-mint-600" />
                  {trackedOrder.pickupTime}
                </p>
                <p className="text-xs text-mint-700 font-bold mt-0.5">
                  {trackedOrder.pickupCounter || 'Counter #1 (Express Pickup)'}
                </p>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="py-2">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                {STATUS_STEPS.map((step, idx) => {
                  const isCurrent = currentStatus === step.key;
                  const isDone = currentStepIdx >= idx;
                  const Icon = step.icon;

                  return (
                    <div 
                      key={step.key} 
                      className={`p-3 rounded-2xl border flex flex-col items-center transition ${
                        isCurrent
                          ? 'bg-forest-800 text-white border-forest-800 shadow-md shadow-forest-800/10'
                          : isDone
                          ? 'bg-white text-forest-900 border-mint-300'
                          : 'bg-white/50 text-slate-400 border-slate-200/60'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 ${
                        isCurrent ? 'bg-mint-400 text-forest-900' : isDone ? 'bg-forest-100 text-forest-800' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black">{step.label}</span>
                      <span className={`text-[10px] mt-0.5 ${isCurrent ? 'text-mint-200' : 'text-slate-400'}`}>
                        {step.desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Itemized Bill & Student Verification */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dishes In This Order</span>
                <span className="text-xs text-slate-400">Student: <strong>{trackedOrder.student?.name}</strong> ({trackedOrder.student?.studentId})</span>
              </div>

              <div className="divide-y divide-slate-100 text-xs mt-2">
                {trackedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900">{item.quantity}x {item.name}</span>
                      {item.specialInstructions && (
                        <p className="text-[11px] text-slate-400">Note: {item.specialInstructions}</p>
                      )}
                    </div>
                    <span className="font-extrabold text-forest-800">₹{item.price * item.quantity}</span>
                  </div>
                ))}

                <div className="pt-3 flex justify-between items-center text-sm font-black text-slate-900">
                  <span>Grand Total Payable:</span>
                  <span className="text-forest-700">₹{trackedOrder.total} ({trackedOrder.paymentMethod})</span>
                </div>
              </div>
            </div>

            {/* Refresh and Pickup Reminders */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-2">
              <p>
                Showing live status. Food will be prepared freshly for your pickup window.
              </p>
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-mint-600' : ''}`} />
                <span>Refresh Status</span>
              </button>
            </div>

          </div>
        ) : (
          <div className="py-14 text-center text-slate-400">
            <PackageCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h4 className="font-bold text-slate-700 text-sm">No Active Order Selected</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Place an order from the menu or type your Order Number in the search box above to track live progress.
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
