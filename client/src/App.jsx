import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategoryFilters from './components/CategoryFilters';
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
    <div className="min-h-screen flex flex-col font-sans">
      
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
      />

      {/* Main Views */}
      {isAdminMode ? (
        <AdminPortal
          onExit={() => setIsAdminMode(false)}
          showToast={showToast}
          menuDishes={menuDishes}
          onRefreshMenu={loadMenuData}
        />
      ) : (
        <main className="flex-1 pb-16">
          
          {/* Hero Section */}
          <Hero
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onReportCrowd={() => setIsCrowdModalOpen(true)}
            onExploreMenu={() => handleNavigate('menu')}
            crowdSummary={crowdSummary}
          />

          {/* Crowd Pulse Section */}
          <CrowdPulse
            summary={crowdSummary}
            onOpenModal={() => setIsCrowdModalOpen(true)}
          />

          {/* Menu Section */}
          <section id="menu-section" className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-forest-700 bg-forest-50 px-3 py-1 rounded-full border border-forest-100">
                Fresh From Kitchen
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-forest-900 tracking-tight mt-2">
                Today's Canteen Menu
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Prices and availability verified in real-time. Pre-order to beat the queue.
              </p>
            </div>

            {/* Category & Dietary Filters */}
            <CategoryFilters
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              vegOnly={vegOnly}
              onToggleVeg={setVegOnly}
              availableOnly={availableOnly}
              onToggleAvailable={setAvailableOnly}
            />

            {/* Food Card Grid */}
            {filteredDishes.length === 0 ? (
              <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80">
                <p className="font-extrabold text-slate-700 text-sm">No dishes match your filter.</p>
                <p className="text-xs text-slate-400 mt-1">Try resetting the category filter or search input.</p>
                <button
                  onClick={() => {
                    setActiveCategory('All');
                    setSearchQuery('');
                    setVegOnly(false);
                    setAvailableOnly(false);
                  }}
                  className="mt-3.5 px-4 py-2 rounded-xl bg-forest-800 text-white text-xs font-bold transition hover:bg-forest-900"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-bold flex items-center gap-2 max-w-sm animate-slideLeft ${
              toast.type === 'success'
                ? 'bg-forest-900 text-mint-300 border border-mint-500/30'
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
