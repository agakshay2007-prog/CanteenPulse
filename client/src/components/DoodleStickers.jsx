import React from 'react';

/**
 * DoodleStickers Component
 * Recreates the exact hand-drawn sticker illustrations from the reference screenshot:
 * - Left edge: Green line-art (Sub Sandwich, Pizza Slice, Drink with Straw, Burger, Juice Box, Coffee Cup)
 * - Right edge: Warm Tan line-art (Pizza Slice, College Backpack, Running Student Figures, Burger, Sushi Roll)
 */

export default function DoodleStickers() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 select-none">
      
      {/* ================= LEFT SIDE (GREEN STICKERS) ================= */}
      <div className="absolute left-2 top-20 w-32 sm:w-40 xl:w-48 flex flex-col items-start gap-8 opacity-45 sm:opacity-55 float-sticker-1">
        
        {/* 1. Sub Sandwich / Baguette */}
        <div className="transform -rotate-12 hover:scale-105 transition -ml-4">
          <svg width="110" height="70" viewBox="0 0 110 70" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Top Bun */}
            <path d="M12 28 C 12 14, 85 8, 98 22 C 102 26, 95 35, 88 36 L 15 36 Z" />
            {/* Sesame / Score marks on bread */}
            <path d="M30 18 L36 24" />
            <path d="M50 16 L56 22" />
            <path d="M70 17 L76 23" />
            {/* Wavy Lettuce & Fillings */}
            <path d="M8 36 Q 16 42, 24 36 Q 32 44, 40 37 Q 48 44, 56 36 Q 64 43, 72 36 Q 80 43, 90 36 L 96 38" />
            <path d="M18 42 L 85 42" strokeDasharray="6 3" />
            {/* Bottom Bun */}
            <path d="M14 42 C 14 56, 85 58, 92 46 L 90 42" />
          </svg>
        </div>

        {/* 2. Pizza Slice */}
        <div className="transform rotate-15 hover:scale-105 transition ml-3 float-sticker-2">
          <svg width="90" height="90" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Crust */}
            <path d="M18 20 C 35 12, 65 14, 80 28" strokeWidth="3.5" />
            {/* Slice Triangle */}
            <path d="M18 20 L 50 82 L 80 28" />
            {/* Pepperoni Circles */}
            <circle cx="45" cy="36" r="6" />
            <circle cx="58" cy="48" r="5" />
            <circle cx="38" cy="54" r="4.5" />
            {/* Crust detail line */}
            <path d="M22 25 C 38 18, 62 20, 75 32" strokeWidth="1.5" />
          </svg>
        </div>

        {/* 3. Drink with Straw */}
        <div className="transform -rotate-6 hover:scale-105 transition -ml-2 float-sticker-3">
          <svg width="65" height="90" viewBox="0 0 65 90" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Straw */}
            <path d="M38 10 L 44 2 L 52 2" strokeWidth="2.8" />
            {/* Cup Lid */}
            <path d="M12 22 L 54 22 L 51 26 L 15 26 Z" />
            {/* Cup Body */}
            <path d="M16 26 L 22 82 L 44 82 L 50 26" />
            {/* Liquid Level */}
            <path d="M20 45 L 46 45" strokeDasharray="3 3" />
            {/* Ice Cubes */}
            <rect x="25" y="32" width="10" height="9" rx="2" transform="rotate(10 25 32)" />
            <rect x="33" y="52" width="9" height="9" rx="2" transform="rotate(-15 33 52)" />
          </svg>
        </div>

        {/* 4. Hamburger / Cheeseburger */}
        <div className="transform rotate-8 hover:scale-105 transition ml-2 float-sticker-1">
          <svg width="95" height="85" viewBox="0 0 95 85" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Top Bun Dome */}
            <path d="M12 36 C 12 12, 82 12, 82 36 Z" />
            {/* Sesame Seeds */}
            <circle cx="32" cy="22" r="1.5" fill="#15803D" stroke="none" />
            <circle cx="48" cy="18" r="1.5" fill="#15803D" stroke="none" />
            <circle cx="62" cy="24" r="1.5" fill="#15803D" stroke="none" />
            <circle cx="40" cy="28" r="1.5" fill="#15803D" stroke="none" />
            <circle cx="56" cy="30" r="1.5" fill="#15803D" stroke="none" />
            {/* Wavy Lettuce Layer */}
            <path d="M8 38 Q 16 46, 24 39 Q 32 46, 40 39 Q 48 46, 56 39 Q 64 46, 72 39 Q 80 46, 88 39" />
            {/* Cheese Slice Droop */}
            <path d="M14 44 L 46 44 L 52 52 L 58 44 L 80 44" />
            {/* Patty */}
            <rect x="14" y="48" width="66" height="10" rx="4" />
            {/* Bottom Bun */}
            <path d="M16 62 C 16 72, 78 72, 78 62 Z" />
          </svg>
        </div>

        {/* 5. Juice Box / Pocket Drink */}
        <div className="transform -rotate-10 hover:scale-105 transition -ml-1 float-sticker-2">
          <svg width="60" height="75" viewBox="0 0 60 75" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Box Body */}
            <rect x="10" y="16" width="38" height="52" rx="4" />
            {/* Straw Insert */}
            <path d="M36 8 L 40 2 L 46 2" strokeWidth="2.5" />
            <circle cx="36" cy="16" r="2.5" />
            {/* Circle Center Emblem */}
            <circle cx="29" cy="38" r="9" />
            <circle cx="29" cy="38" r="4" strokeDasharray="2 2" />
            {/* Bottom Crease */}
            <path d="M10 56 L 48 56" strokeWidth="1.5" />
          </svg>
        </div>

        {/* 6. Coffee Paper Cup with Lid */}
        <div className="transform rotate-12 hover:scale-105 transition ml-3 float-sticker-3">
          <svg width="70" height="85" viewBox="0 0 70 85" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Lid Rim */}
            <path d="M16 14 L 54 14 L 51 18 L 19 18 Z" />
            <path d="M22 10 L 48 10 L 48 14 L 22 14 Z" />
            {/* Cup Body */}
            <path d="M19 18 L 26 76 L 44 76 L 51 18" />
            {/* Sleeve */}
            <path d="M21 32 L 49 32 L 47 52 L 23 52 Z" />
            {/* Cup Emblem */}
            <circle cx="35" cy="42" r="5" strokeWidth="1.8" />
          </svg>
        </div>

      </div>

      {/* ================= RIGHT SIDE (WARM BEIGE / TAN STICKERS) ================= */}
      <div className="absolute right-2 top-24 w-36 sm:w-44 xl:w-56 flex flex-col items-end gap-10 opacity-45 sm:opacity-55 float-sticker-2">
        
        {/* 1. Pizza Slice Top Right */}
        <div className="transform -rotate-25 hover:scale-105 transition mr-4 float-sticker-1">
          <svg width="85" height="85" viewBox="0 0 85 85" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#8C6A48" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            {/* Crust */}
            <path d="M16 22 C 34 14, 62 16, 76 28" strokeWidth="3.5" />
            {/* Body */}
            <path d="M16 22 L 48 80 L 76 28" />
            {/* Pepperoni & toppings */}
            <circle cx="44" cy="38" r="5.5" />
            <circle cx="56" cy="48" r="4.5" />
            <circle cx="36" cy="54" r="4" />
          </svg>
        </div>

        {/* 2. College Backpack (Matching reference image 2 exactly!) */}
        <div className="transform -rotate-6 hover:scale-105 transition mr-2 float-sticker-3">
          <svg width="125" height="120" viewBox="0 0 125 120" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#8C6A48" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            {/* Top Loop Handle */}
            <path d="M52 24 C 52 14, 72 14, 72 24" strokeWidth="2.8" />
            
            {/* Left Strap Arc */}
            <path d="M38 42 C 26 48, 22 72, 32 94" strokeWidth="3" />
            
            {/* Main Backpack Dome */}
            <path d="M38 38 C 38 20, 86 20, 86 38 L 92 102 C 92 108, 32 108, 32 102 Z" />
            
            {/* Zipper Arc Line on main body */}
            <path d="M42 42 C 48 30, 76 30, 82 42" strokeDasharray="3 2" />
            
            {/* Front Pocket */}
            <rect x="42" y="58" width="46" height="42" rx="10" />
            {/* Pocket Zipper with Pull Tab */}
            <path d="M46 66 L 84 66" />
            <circle cx="50" cy="66" r="2" fill="#8C6A48" stroke="none" />
            <path d="M50 68 L 50 74" />
            
            {/* Right Side Bottle Mesh Pocket */}
            <path d="M86 64 C 94 64, 96 82, 88 88" />
          </svg>
        </div>

        {/* 3. Running / High-Fiving Student Figures (From reference image 2!) */}
        <div className="transform rotate-6 hover:scale-105 transition mr-3 float-sticker-1">
          <svg width="105" height="95" viewBox="0 0 105 95" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#8C6A48" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            {/* Student 1 Head */}
            <circle cx="34" cy="20" r="7" />
            {/* Student 1 Torso */}
            <path d="M34 27 L 34 50" />
            {/* Student 1 Legs Running */}
            <path d="M34 50 L 20 72 L 12 70" />
            <path d="M34 50 L 48 68 L 56 68" />
            {/* Student 1 Arms (reaching out) */}
            <path d="M34 34 L 18 42 L 14 36" />
            <path d="M34 34 L 54 28" />

            {/* Student 2 Head */}
            <circle cx="68" cy="18" r="7" />
            {/* Student 2 Torso */}
            <path d="M68 25 L 68 48" />
            {/* Student 2 Running Legs */}
            <path d="M68 48 L 54 66 L 46 64" />
            <path d="M68 48 L 82 68 L 92 66" />
            {/* Student 2 Arms Reaching to touch hands */}
            <path d="M68 32 L 54 28" />
            <path d="M68 32 L 84 38 L 88 32" />
          </svg>
        </div>

        {/* 4. Hamburger / Burger Doodle */}
        <div className="transform -rotate-10 hover:scale-105 transition mr-5 float-sticker-2">
          <svg width="90" height="80" viewBox="0 0 90 80" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#8C6A48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Top Bun */}
            <path d="M12 32 C 12 10, 78 10, 78 32 Z" />
            {/* Sesame Seeds */}
            <circle cx="32" cy="18" r="1.5" fill="#8C6A48" stroke="none" />
            <circle cx="48" cy="16" r="1.5" fill="#8C6A48" stroke="none" />
            <circle cx="62" cy="22" r="1.5" fill="#8C6A48" stroke="none" />
            {/* Wavy Lettuce */}
            <path d="M8 35 Q 16 42, 24 36 Q 32 42, 40 36 Q 48 42, 56 36 Q 64 42, 72 36 Q 80 42, 84 36" />
            {/* Patty */}
            <rect x="12" y="44" width="66" height="9" rx="3.5" />
            {/* Bottom Bun */}
            <path d="M14 56 C 14 66, 76 66, 76 56 Z" />
          </svg>
        </div>

        {/* 5. Sushi Maki Roll (From reference image 2 bottom!) */}
        <div className="transform rotate-15 hover:scale-105 transition mr-3 float-sticker-3">
          <svg width="75" height="70" viewBox="0 0 75 70" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#8C6A48" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            {/* Top Ellipse (Cut Face) */}
            <ellipse cx="38" cy="22" rx="26" ry="14" />
            {/* Inner Salmon / Filling */}
            <circle cx="38" cy="22" r="7" fill="#8C6A48" fillOpacity="0.15" />
            <circle cx="38" cy="22" r="3.5" />
            {/* Garnish / sesame inside */}
            <circle cx="48" cy="22" r="1.2" fill="#8C6A48" stroke="none" />
            <circle cx="28" cy="23" r="1.2" fill="#8C6A48" stroke="none" />
            {/* Cylindrical Seaweed Wrap Body */}
            <path d="M12 22 L 12 46 C 12 58, 64 58, 64 46 L 64 22" />
          </svg>
        </div>

      </div>

    </div>
  );
}
