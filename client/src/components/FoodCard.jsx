import React, { useState } from 'react';
import { Plus, Star, Clock } from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';

export default function FoodCard({ dish, onAddToCart }) {
  const [imgSrc, setImgSrc] = useState(dish.image || FALLBACK_IMAGE);
  const isAvailable = dish.isAvailable !== false;

  return (
    <div className="campus-card bg-white rounded-3xl overflow-hidden shadow-xs border border-gray-100 flex flex-col justify-between group">
      
      {/* Food Photo Container - Matching Reference Aspect Ratio & Curvature */}
      <div className="relative h-44 w-full bg-gray-50 overflow-hidden">
        <img
          src={imgSrc}
          alt={dish.name}
          loading="lazy"
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            !isAvailable ? 'grayscale contrast-75' : ''
          }`}
        />

        {/* Veg Badge Tag */}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur text-[10px] font-bold shadow-2xs flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${dish.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          <span className={dish.isVeg ? 'text-emerald-800' : 'text-rose-800'}>
            {dish.isVeg ? 'Veg' : 'Non-Veg'}
          </span>
        </div>

        {/* Sold Out Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-sm">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Card Body - Exactly matching the reference layout */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        
        {/* Row 1: Dish Title on left, Green Price on right */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-extrabold text-sm sm:text-base text-gray-900 tracking-tight line-clamp-1">
            {dish.name}
          </h3>
          <span className="font-extrabold text-sm sm:text-base text-[#10B981] shrink-0 font-mono">
            ₹{Number(dish.price).toFixed(2)}
          </span>
        </div>

        {/* Description Snippet */}
        <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
          {dish.description || 'Prepared fresh at the campus kitchen.'}
        </p>

        {/* Row 2: Star rating & Prep time on left, Round Green + button on right */}
        <div className="mt-3 pt-2 flex items-center justify-between">
          
          <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{dish.rating || 4.5}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span>{dish.preparationTime || 10} min</span>
            </div>
          </div>

          {/* Solid Green Round + Button from Reference Screenshot */}
          {isAvailable ? (
            <button
              onClick={() => onAddToCart(dish)}
              className="w-7 h-7 rounded-full bg-[#10B981] hover:bg-[#059669] text-white flex items-center justify-center font-bold shadow-xs transition hover:scale-110 active:scale-95"
              title="Add to cart"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          ) : (
            <span className="text-[10px] text-gray-400 font-bold px-2 py-0.5 rounded bg-gray-100">
              Unavailable
            </span>
          )}

        </div>

      </div>

    </div>
  );
}
