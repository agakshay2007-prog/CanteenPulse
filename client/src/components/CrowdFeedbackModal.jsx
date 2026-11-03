import React, { useState } from 'react';
import { X, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CrowdFeedbackModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [crowdLevel, setCrowdLevel] = useState('Moderate');
  const [estimatedWait, setEstimatedWait] = useState('5-10 mins');
  const [studentName, setStudentName] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    onSubmit({
      crowdLevel,
      estimatedWait,
      studentName: studentName.trim() || 'Anonymous Student',
      studentIdentifier: studentName.trim() || 'student_' + Math.random().toString(36).substring(7),
      comment: comment.trim()
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-forest-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-mint-100 text-forest-800 flex items-center justify-center">
              <Users className="w-5 h-5 text-mint-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Voluntary Crowd Check-in</h3>
              <p className="text-xs text-slate-500 font-medium">Help peers skip lines by sharing the queue vibe</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          
          {/* Level Options */}
          <div>
            <label className="block font-black text-slate-800 mb-2">
              How crowded is the canteen right now? *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCrowdLevel('Quiet');
                  setEstimatedWait('< 5 mins');
                }}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                  crowdLevel === 'Quiet'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-black shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 font-bold'
                }`}
              >
                <span className="text-base">🟢</span>
                <span className="text-xs">Quiet</span>
                <span className="text-[10px] text-slate-400">&lt; 5m wait</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCrowdLevel('Moderate');
                  setEstimatedWait('5-10 mins');
                }}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                  crowdLevel === 'Moderate'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-900 font-black shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 font-bold'
                }`}
              >
                <span className="text-base">🟡</span>
                <span className="text-xs">Moderate</span>
                <span className="text-[10px] text-slate-400">5-10m wait</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCrowdLevel('Busy');
                  setEstimatedWait('15+ mins');
                }}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                  crowdLevel === 'Busy'
                    ? 'border-rose-500 bg-rose-50/70 text-rose-900 font-black shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 font-bold'
                }`}
              >
                <span className="text-base">🔴</span>
                <span className="text-xs">Busy</span>
                <span className="text-[10px] text-slate-400">15+m wait</span>
              </button>
            </div>
          </div>

          {/* Student Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Your Name / Branch (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Rahul S. (CSE 3rd Yr)"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FAF9F5] focus:outline-none focus:ring-1 focus:ring-mint-500"
            />
          </div>

          {/* Optional Short Comment */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Counter Tip / Comment (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Counter 2 for noodles is moving fast!"
              maxLength={200}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FAF9F5] focus:outline-none focus:ring-1 focus:ring-mint-500"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-normal">
            Note: To prevent trend inflation, repeated reports within 3 minutes from the same device are protected.
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-white font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-mint-400" />
            <span>{isSubmitting ? 'Posting Update...' : 'Post Crowd Vibe'}</span>
          </button>
        </form>

      </div>
    </div>
  );
}

