import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FoodCard from './components/FoodCard';
import CartDrawer from './components/CartDrawer';
import OrderSuccessModal from './components/OrderSuccessModal';
import OrderTracker from './components/OrderTracker';
import CrowdPulse from './components/CrowdPulse';
import CrowdFeedbackModal from './components/CrowdFeedbackModal';
import ReviewsSection from './components/ReviewsSection';
import ReviewModal from './components/ReviewModal';
import AdminPortal from './components/AdminPortal';

import {
  getMenu,
  submitOrder,
  getOrder,
  getCrowdSummary,
  submitCrowdFeedback,
  getReviews,
  submitReview
} from './services/api';

export default function App() {
  // State
  const [menuDishes, setMenuDishes] = useState([]);
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cp_cart') || '[]');
    } catch {
      return [];
    }
  });

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);

  const [crowdSummary, setCrowdSummary] = useState(null);
  const [reviews, setReviews] = useState([]);

  // Tracked order
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCrowdModalOpen, setIsCrowdModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isSubmittingCrowd, setIsSubmittingCrowd] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Navigation & Admin Mode
  const [activeSection, setActiveSection] = useState('menu');
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cp_cart', JSON.stringify(cart));
  }, [cart]);

  // Initial Data Load
  const loadMenuData = async () => {
    const res = await getMenu();
    if (res && res.success) {
      setMenuDishes(res.data);
    }
  };

  const loadCrowdData = async () => {
    const res = await getCrowdSummary();
    if (res && res.success) {
      setCrowdSummary(res.data);
    }
  };

  const loadReviewsData = async () => {
    const res = await getReviews();
    if (res && res.success) {
      setReviews(res.data);
    }
  };

  useEffect(() => {
    loadMenuData();
    loadCrowdData();
    loadReviewsData();

    // Check if previous order exists
    const lastOrder = localStorage.getItem('cp_last_order');
    if (lastOrder) {
      handleLookupOrder(lastOrder, false);
    }

    // Polling for live updates
    const interval = setInterval(() => {
      loadCrowdData();
      const currentToken = localStorage.getItem('cp_last_order');
      if (currentToken) {
        handleLookupOrder(currentToken, false);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  // Cart operations
  const handleAddToCart = (dish) => {
    if (dish.isAvailable === false) {
      showToast('This dish is currently sold out.', 'warning');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.menuItemId === dish._id);
      if (existing) {
        return prev.map((item) =>
          item.menuItemId === dish._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          menuItemId: dish._id,
          name: dish.name,
          price: dish.price,
          quantity: 1,
          image: dish.image,
          specialInstructions: ''
        }
      ];
    });

    showToast(`Added ${dish.name} to cart!`, 'success');
  };

  const handleUpdateQuantity = (menuItemId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.menuItemId === menuItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveItem = (menuItemId) => {
    setCart((prev) => prev.filter((item) => item.menuItemId !== menuItemId));
  };

  const handleUpdateItemNote = (menuItemId, note) => {
    setCart((prev) =>
      prev.map((item) =>
        item.menuItemId === menuItemId ? { ...item, specialInstructions: note } : item
      )
    );
  };

  // Submit Order (Online Booking)
  const handleSubmitOrder = async (orderPayload) => {
    setIsSubmittingOrder(true);
    const res = await submitOrder(orderPayload);
    setIsSubmittingOrder(false);

    if (res && res.success) {
      const order = res.data;
      setSuccessOrder(order);
      setTrackedOrder(order);
      localStorage.setItem('cp_last_order', order.orderNumber);

      // Clear cart & close drawer
      setCart([]);
      setIsCartOpen(false);

      showToast(`Order placed! Token #${order.orderNumber}`, 'success');
    } else {
      showToast(res.message || 'Error placing order', 'error');
    }
  };

  // Track order lookup
  const handleLookupOrder = async (orderNumber, showNotification = true) => {
    setIsTrackingLoading(true);
    setTrackError('');

    const res = await getOrder(orderNumber);
    setIsTrackingLoading(false);

    if (res && res.success) {
      setTrackedOrder(res.data);
      localStorage.setItem('cp_last_order', res.data.orderNumber);
      if (showNotification) {
        showToast(`Loaded Order #${res.data.orderNumber}`, 'info');
      }
    } else {
      setTrackError(res.message || `Order #${orderNumber} not found.`);
      if (showNotification) {
        showToast(res.message || 'Order not found', 'error');
      }
    }
  };

  // Crowd Check-in Submit
  const handleCrowdSubmit = async (crowdData) => {
    setIsSubmittingCrowd(true);
    const res = await submitCrowdFeedback(crowdData);
    setIsSubmittingCrowd(false);

    if (res && res.success) {
      showToast(res.message, 'success');
      setIsCrowdModalOpen(false);
      loadCrowdData();
    } else {
      showToast(res.message || 'Error submitting report', 'error');
    }
  };

  // Review Submit
  const handleReviewSubmit = async (reviewData) => {
    setIsSubmittingReview(true);
    const res = await submitReview(reviewData);
    setIsSubmittingReview(false);

    if (res && res.success) {
      showToast(res.message, 'success');
      setIsReviewModalOpen(false);
      loadReviewsData();
      loadMenuData(); // refresh dish rating
    } else {
      showToast(res.message || 'Error submitting review', 'error');
    }
  };

  // Navigation scroll helper
  const handleNavigate = (sectionId) => {
    if (isAdminMode) setIsAdminMode(false);
    setActiveSection(sectionId);
    const el = document.getElementById(`${sectionId}-section`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter dishes
  const filteredDishes = menuDishes.filter((dish) => {
    const matchCategory =
      activeCategory === 'All' || dish.category.toLowerCase() === activeCategory.toLowerCase();
    const matchSearch =
      !searchQuery ||
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dish.description && dish.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchVeg = !vegOnly || dish.isVeg === true;
    const matchAvailable = !availableOnly || dish.isAvailable !== false;
    return matchCategory && matchSearch && matchVeg && matchAvailable;
  });

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col font-sans relative campus-bg-doodles">
      
      {/* Top Navbar */}
      <Navbar
        cartCount={cartTotalCount}
        cartTotal={cartSubtotal}
        onOpenCart={() => setIsCartOpen(true)}
        crowdSummary={crowdSummary}
        onNavigate={handleNavigate}
        activeSection={activeSection}
        isAdmin={isAdminMode}
        onToggleAdmin={() => setIsAdminMode(!isAdminMode)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Area */}
      {isAdminMode ? (
        <AdminPortal
          onExit={() => setIsAdminMode(false)}
          showToast={showToast}
          menuDishes={menuDishes}
          onRefreshMenu={loadMenuData}
        />
      ) : (
        <main className="flex-1 pb-24">
          
          {/* Hero Section with Greeting, Category Pills & Big Headline */}
          <Hero
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            vegOnly={vegOnly}
            onToggleVeg={setVegOnly}
            availableOnly={availableOnly}
            onToggleAvailable={setAvailableOnly}
          />

          {/* Menu / Best Sellers Section - Exactly matching reference screenshot */}
          <section id="menu-section" className="py-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Section Header with "Best Sellers" and "See All >" */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                {activeCategory === 'All' ? 'Best Sellers' : `${activeCategory} Specials`}
              </h2>
              <button
                onClick={() => {
                  setActiveCategory('All');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-[#10B981] hover:text-[#059669] transition flex items-center gap-1"
              >
                <span>See All</span>
                <span>&gt;</span>
              </button>
            </div>

            {/* Food Card Grid - 4 Columns Matching Reference Screenshot */}
            {filteredDishes.length === 0 ? (
              <div className="py-16 text-center text-gray-400 bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-xs">
                <p className="font-extrabold text-gray-700 text-sm">No dishes match your filter.</p>
                <p className="text-xs text-gray-400 mt-1">Try resetting the category filter or search input.</p>
                <button
                  onClick={() => {
                    setActiveCategory('All');
                    setSearchQuery('');
                    setVegOnly(false);
                    setAvailableOnly(false);
                  }}
                  className="mt-3.5 px-4 py-2 rounded-full bg-[#10B981] text-white text-xs font-bold transition hover:bg-[#059669]"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                {filteredDishes.map((dish) => (
                  <FoodCard
                    key={dish._id}
                    dish={dish}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Crowd Pulse Section */}
          <CrowdPulse
            summary={crowdSummary}
            onOpenModal={() => setIsCrowdModalOpen(true)}
          />

          {/* Live Order Tracking Section */}
          <OrderTracker
            trackedOrder={trackedOrder}
            onSearchOrder={(num) => handleLookupOrder(num, true)}
            onRefresh={() => trackedOrder && handleLookupOrder(trackedOrder.orderNumber, true)}
            isLoading={isTrackingLoading}
            error={trackError}
          />

          {/* Reviews Section */}
          <ReviewsSection
            reviews={reviews}
            onOpenModal={() => setIsReviewModalOpen(true)}
          />

        </main>
      )}

      {/* Floating Bottom Green Pill CTA Button - Exactly matching reference screenshot "Discover Now" */}
      {!isAdminMode && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => {
              if (cartTotalCount > 0) {
                setIsCartOpen(true);
              } else {
                handleNavigate('menu');
              }
            }}
            className="px-7 py-3.5 rounded-full bg-[#2EB872] hover:bg-[#25A162] text-white font-black text-sm shadow-xl hover:shadow-2xl transition hover:scale-105 active:scale-95 flex items-center gap-2.5 border border-emerald-400/30"
          >
            <span>{cartTotalCount > 0 ? `View Cart (${cartTotalCount})` : 'Discover Now'}</span>
            <span className="text-emerald-100 text-xs font-bold font-mono">→</span>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onUpdateItemNote={handleUpdateItemNote}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmittingOrder}
      />

      {/* Modals */}
      <OrderSuccessModal
        order={successOrder}
        onClose={() => setSuccessOrder(null)}
        onTrackOrder={(num) => handleLookupOrder(num, true)}
      />

      <CrowdFeedbackModal
        isOpen={isCrowdModalOpen}
        onClose={() => setIsCrowdModalOpen(false)}
        onSubmit={handleCrowdSubmit}
        isSubmitting={isSubmittingCrowd}
      />

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        dishes={menuDishes}
        onSubmit={handleReviewSubmit}
        isSubmitting={isSubmittingReview}
      />

      {/* Toast Notification Stack */}
      <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-bold flex items-center gap-2 max-w-sm ${
              toast.type === 'success'
                ? 'bg-gray-900 text-[#10B981] border border-[#10B981]/30'
                : toast.type === 'error'
                ? 'bg-rose-600 text-white'
                : toast.type === 'warning'
                ? 'bg-amber-500 text-slate-900'
                : 'bg-slate-900 text-white'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
