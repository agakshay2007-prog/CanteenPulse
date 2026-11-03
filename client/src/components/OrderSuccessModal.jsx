import React from 'react';
import { Check, Clock, MapPin, Radar, X } from 'lucide-react';

export default function OrderSuccessModal({ order, onClose, onTrackOrder }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-center relative border border-forest-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Big Checkmark */}
        <div className="w-16 h-16 rounded-3xl bg-mint-100 text-forest-800 mx-auto flex items-center justify-center mb-4 shadow-sm">
          <Check className="w-8 h-8 text-forest-700 stroke-[3]" />
        </div>

        <span className="text-[11px] font-extrabold uppercase tracking-wider text-forest-700 bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
          Order Successfully Placed
        </span>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2.5">
          Your Collection Token
        </h2>

        {/* Big Token Number Card */}
        <div className="my-5 p-5 rounded-2xl bg-forest-900 text-white shadow-inner relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-mint-500/10 rounded-full blur-xl"></div>
          <span className="text-[11px] text-mint-200 uppercase tracking-widest block font-bold mb-1">
            Order Number
          </span>
          <span className="text-4xl sm:text-5xl font-black text-mint-400 font-mono tracking-wider">
            {order.orderNumber}
          </span>
          <p className="text-xs text-mint-100/90 mt-2 flex items-center justify-center gap-1.5 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-mint-400" />
            <span>{order.pickupCounter || 'Counter #1 (Express Pickup)'}</span>
          </p>
        </div>

        {/* Pickup Notice */}
        <div className="text-xs text-slate-600 bg-[#FBFBF7] p-4 rounded-2xl mb-5 text-left space-y-1.5 border border-slate-200/80">
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Pickup Time:</span>
            <span className="font-extrabold text-forest-900 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-mint-600" />
              {order.pickupTime}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Total Payable:</span>
            <span className="font-extrabold text-slate-900">₹{order.total} ({order.paymentMethod})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Student:</span>
            <span className="font-semibold text-slate-700">{order.student.name} ({order.student.studentId})</span>
          </div>
        </div>

        {/* Important Instructions */}
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 text-left mb-5">
          <strong>Important:</strong> Please arrive at Express Counter #1 during your selected pickup time. Show this token number to collect your hot meal without waiting in the ordering line.
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              onClose();
              onTrackOrder(order.orderNumber);
            }}
            className="flex-1 py-3 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-forest-800/20 transition flex items-center justify-center gap-1.5"
          >
            <Radar className="w-4 h-4 text-mint-400" />
            <span>Track Kitchen Progress</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}

