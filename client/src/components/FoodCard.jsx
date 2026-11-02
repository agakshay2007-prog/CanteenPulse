import React, { useState } from 'react';
import { Plus, Clock, Star, Flame } from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';

export default function FoodCard({ dish, onAddToCart }) {
  const [imgSrc, setImgSrc] = useState(dish.image || FALLBACK_IMAGE);
  const isAvailable = dish.isAvailable !== false;

  return (
    <div className="food-card-hover bg-white rounded-3xl border border-slate-200/80 overflow-hidden flex flex-col justify-between shadow-xs">
      
      {/* Top Image Container */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
        <img
          src={imgSrc}
          alt={dish.name}
          loading="lazy"
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${!isAvailable ? 'grayscale contrast-75' : ''}`}
        />

        {/* Veg / Non-Veg Tag */}
        <div className="absolute top-3 left-3 px-2 py-1 rounded-xl bg-white/95 backdrop-blur shadow-2xs flex items-center gap-1.5 text-[11px] font-bold">
          <span className={dish.isVeg ? 'veg-icon' : 'non-veg-icon'}></span>
          <span className={dish.isVeg ? 'text-forest-700' : 'text-rose-700'}>
            {dish.isVeg ? 'Veg' : 'Non-Veg'}
          </span>
        </div>

        {/* Prep Time Tag */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-forest-900/80 backdrop-blur text-white text-[11px] font-bold flex items-center gap-1">
          <Clock className="w-3 h-3 text-mint-400" />
          <span>{dish.preparationTime || 10}m</span>
        </div>

        {/* Popular Tag */}
        {dish.isPopular && isAvailable && (
          <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-900 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
            <Flame className="w-3 h-3 fill-slate-900" />
            <span>Popular</span>
          </div>
        )}

        {/* Sold Out Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {dish.category}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{dish.rating || 4.5}</span>
              <span className="text-slate-400 font-normal text-[10px]">
                ({dish.ratingCount || 10})
              </span>
            </div>
          </div>

          <h3 className="font-extrabold text-slate-900 text-base line-clamp-1">{dish.name}</h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {dish.description || 'Prepared fresh at the counter.'}
          </p>
        </div>

        {/* Bottom Price & Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Price</span>
            <p className="text-lg font-black text-forest-700">₹{dish.price}</p>
          </div>

          {isAvailable ? (
            <button
              onClick={() => onAddToCart(dish)}
              className="px-3.5 py-2 rounded-2xl bg-mint-50 hover:bg-forest-800 text-forest-800 hover:text-white border border-mint-200 hover:border-forest-800 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs group"
            >
              <Plus className="w-4 h-4 text-mint-600 group-hover:text-white" />
              <span>Add to Cart</span>
            </button>
          ) : (
            <button
              disabled
              className="px-3.5 py-2 rounded-2xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed"
            >
              Unavailable
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
