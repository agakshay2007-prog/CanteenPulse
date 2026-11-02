import React from 'react';
import { Star, MessageSquarePlus, ThumbsUp } from 'lucide-react';

export default function ReviewsSection({ reviews, onOpenModal }) {
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '4.8';

  return (
    <section id="reviews-section" className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-black text-forest-900 tracking-tight">
                Campus Food Ratings & Reviews
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Honest ratings and taste recommendations from college students.
            </p>
          </div>

          <button
            onClick={onOpenModal}
            className="px-4 py-2.5 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-extrabold text-xs sm:text-sm transition flex items-center gap-2 shadow-xs self-start sm:self-auto"
          >
            <MessageSquarePlus className="w-4 h-4 text-mint-300" />
            <span>Rate Food & Share Review</span>
          </button>
        </div>

        {/* Rating Banner */}
        <div className="my-6 p-5 rounded-2xl bg-gradient-to-r from-forest-50 to-mint-50/50 border border-forest-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-forest-800 text-white flex flex-col items-center justify-center font-black">
              <span className="text-xl leading-none">{avgRating}</span>
              <span className="text-[10px] text-mint-300 font-bold">out of 5</span>
            </div>
            <div>
              <div className="flex items-center text-amber-400 gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs font-bold text-forest-900 mt-1">Campus Satisfaction Rating</p>
              <p className="text-[11px] text-slate-500">Based on {reviews.length} student reviews</p>
            </div>
          </div>

          <div className="text-xs text-forest-800 font-bold bg-white/80 backdrop-blur px-3 py-2 rounded-xl border border-forest-100 self-start sm:self-auto flex items-center gap-1.5">
            <ThumbsUp className="w-4 h-4 text-mint-600" />
            <span>94% students recommend eating before 1:30 PM peak</span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reviews.length === 0 ? (
            <p className="col-span-3 text-center text-slate-400 py-8 text-xs">
              No reviews yet. Be the first to share your review!
            </p>
          ) : (
            reviews.map((rev, idx) => (
              <div
                key={rev._id || idx}
                className="p-4 rounded-2xl bg-[#FAF9F5] border border-slate-200/80 flex flex-col justify-between text-xs shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-forest-900 line-clamp-1">{rev.dishName}</span>
                    <div className="flex items-center text-amber-400">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed italic">"{rev.comment}"</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-bold text-slate-700">{rev.studentName}</span>
                  <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </section>
  );
}
