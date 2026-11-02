import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const PICKUP_SLOTS = [
  'Immediate (~15 mins)',
  '12:45 PM - 1:00 PM',
  '1:00 PM - 1:15 PM (Lunch Slot 1)',
  '1:15 PM - 1:30 PM (Lunch Slot 2)',
  '1:30 PM - 1:45 PM (Lunch Slot 3)',
  '3:30 PM - 3:45 PM (Snack Break)'
];

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateItemNote,
  onSubmitOrder,
  isSubmitting
}) {
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupTime, setPickupTime] = useState(PICKUP_SLOTS[2]);
  const [paymentMethod, setPaymentMethod] = useState('Pay at Counter');
  const [validationError, setValidationError] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = (e) => {
    e.preventDefault();
    setValidationError('');

    if (cart.length === 0) {
      setValidationError('Your cart is empty.');
      return;
    }

    if (!studentName.trim() || !studentId.trim() || !phone.trim()) {
      setValidationError('Please provide your Name, Roll Number/Student ID, and Phone Number.');
      return;
    }

    // Phone simple validation
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setValidationError('Please enter a valid 10-digit mobile number for pickup notification.');
      return;
    }

    onSubmitOrder({
      student: {
        name: studentName.trim(),
        studentId: studentId.trim().toUpperCase(),
        phone: cleanPhone
      },
      items: cart,
      pickupTime,
      pickupCounter: 'Counter #1 (Express Pickup)',
      paymentMethod
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
      ></div>

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#FAF9F5]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-mint-100 text-forest-800 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-mint-700" />
              </div>
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">Your Food Cart</h2>
                <p className="text-xs text-slate-500 font-medium">{cart.length} item{cart.length === 1 ? '' : 's'} added</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {cart.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                <div className="w-16 h-16 rounded-full bg-forest-50 text-forest-400 mx-auto flex items-center justify-center mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-slate-700 text-base">Your cart is empty</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Browse through the CanteenPulse menu and add your favorite dishes.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div 
                  key={item.menuItemId} 
                  className="p-3.5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img 
                        src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'} 
                        alt={item.name} 
                        className="w-11 h-11 rounded-xl object-cover shrink-0"
                      />
                      <div className="truncate">
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">{item.name}</h4>
                        <p className="text-xs text-forest-700 font-bold">₹{item.price} each</p>
                      </div>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
                      <button
                        onClick={() => onUpdateQuantity(item.menuItemId, -1)}
                        className="w-6 h-6 rounded-lg bg-white text-slate-700 font-bold flex items-center justify-center text-xs hover:bg-slate-200 transition shadow-2xs"
                      >
                        -
                      </button>
                      <span className="w-5 text-center font-black text-xs text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.menuItemId, 1)}
                        className="w-6 h-6 rounded-lg bg-white text-slate-700 font-bold flex items-center justify-center text-xs hover:bg-slate-200 transition shadow-2xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Notes & Subtotal */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <input
                      type="text"
                      placeholder="Special instructions (e.g. less spicy)..."
                      value={item.specialInstructions || ''}
                      onChange={(e) => onUpdateItemNote(item.menuItemId, e.target.value)}
                      className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60 w-3/4 focus:outline-none focus:bg-white focus:border-forest-500"
                    />
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-forest-800">₹{item.price * item.quantity}</span>
                      <button
                        onClick={() => onRemoveItem(item.menuItemId)}
                        className="text-slate-300 hover:text-rose-500 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Form & Order Summary */}
          {cart.length > 0 && (
            <form onSubmit={handleCheckout} className="p-5 border-t border-slate-100 bg-[#FAF9F5] space-y-4">
              
              {validationError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Pickup Time Slot */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-mint-600" />
                    Pickup Time Slot *
                  </span>
                  <span className="text-[10px] text-forest-700 font-extrabold uppercase">Express Pickup</span>
                </label>
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-mint-500/20 focus:border-mint-600 focus:outline-none"
                >
                  {PICKUP_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Collect your hot food at <strong>Counter #1</strong> during your designated time window.
                </p>
              </div>

              {/* Student Details */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arjun K."
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-1 focus:ring-mint-500 focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Roll No / Student ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 23BCSE042"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-1 focus:ring-mint-500 focus:outline-none uppercase font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone Number (For verification) *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-1 focus:ring-mint-500 focus:outline-none font-mono"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Payment Method</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer font-semibold transition ${paymentMethod === 'Pay at Counter' ? 'border-forest-600 bg-forest-50/50 text-forest-900' : 'border-slate-200 bg-white text-slate-600'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="Pay at Counter"
                      checked={paymentMethod === 'Pay at Counter'}
                      onChange={() => setPaymentMethod('Pay at Counter')}
                      className="accent-forest-700"
                    />
                    <span>Pay at Counter</span>
                  </label>
                  <label className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer font-semibold transition ${paymentMethod === 'UPI / Online' ? 'border-forest-600 bg-forest-50/50 text-forest-900' : 'border-slate-200 bg-white text-slate-600'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="UPI / Online"
                      checked={paymentMethod === 'UPI / Online'}
                      onChange={() => setPaymentMethod('UPI / Online')}
                      className="accent-forest-700"
                    />
                    <span>Campus UPI</span>
                  </label>
                </div>
              </div>

              {/* Bill Summary */}
              <div className="pt-2 border-t border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-700">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Packaging & Campus Fee</span>
                  <span className="font-bold text-mint-600">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200/60">
                  <span>Total Payable:</span>
                  <span className="text-forest-700">₹{subtotal}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-white font-extrabold text-sm shadow-md shadow-forest-800/20 transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Verifying Order with Kitchen...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-mint-400" />
                    <span>Confirm Order & Get Token</span>
                  </>
                )}
              </button>

            </form>
          )}

        </aside>
      </div>
    </div>
  );
}
