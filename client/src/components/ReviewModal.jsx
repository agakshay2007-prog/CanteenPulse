import React, { useState } from 'react';
import { X, Star, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ReviewModal({ isOpen, onClose, dishes, onSubmit, isSubmitting }) {
  const [selectedDish, setSelectedDish] = useState('General Canteen Service');
  const [rating, setRating] = useState(5);
  const [studentName, setStudentName] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!studentName.trim() || !comment.trim()) {
      setError('Please provide your name and feedback comment.');
      return;
    }

    const matchedDish = dishes.find((d) => d.name === selectedDish);

    onSubmit({
      menuItemId: matchedDish ? matchedDish._id : null,
      dishName: selectedDish,
      studentName: studentName.trim(),
      rating,
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
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Rate Food & Feedback</h3>
              <p className="text-xs text-slate-500 font-medium">Share your taste experience with campus peers</p>
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          
          {/* Select Dish */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Dish or Service *</label>
            <select
              value={selectedDish}
              onChange={(e) => setSelectedDish(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FAF9F5] font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-mint-500"
            >
              <option value="General Canteen Service">General Canteen Food & Service</option>
              {dishes.map((d) => (
                <option key={d._id} value={d.name}>{d.name} ({d.category})</option>
              ))}
            </select>
          </div>

          {/* Star Rating */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Rating (1 to 5 Stars) *</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-2xl transition hover:scale-110"
                >
                  <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
              <span className="ml-2 font-black text-sm text-amber-600">{rating} / 5 Stars</span>
            </div>
          </div>

          {/* Student Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Your Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Sneha Patel"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FAF9F5] focus:outline-none focus:ring-1 focus:ring-mint-500 font-medium"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Review Comments *</label>
            <textarea
              required
              rows={3}
              placeholder="Tell others about taste, freshness, portion size, and temperature..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FAF9F5] focus:outline-none focus:ring-1 focus:ring-mint-500 font-medium"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-white font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-mint-400" />
            <span>{isSubmitting ? 'Publishing Review...' : 'Publish Food Review'}</span>
          </button>
        </form>

      </div>
    </div>
  );
}
