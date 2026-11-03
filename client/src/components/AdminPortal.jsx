import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ChefHat,
  BellRing,
  Check,
  X,
  Plus,
  Trash2,
  Edit2,
  Lock,
  RefreshCw,
  Search,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Users
} from 'lucide-react';
import {
  adminLogin,
  getAdminStats,
  getAdminOrders,
  updateOrderStatus,
  addMenuItem,
  updateMenuItem,
  toggleItemAvailability,
  deleteMenuItem
} from '../services/api';

export default function AdminPortal({ onExit, showToast, menuDishes, onRefreshMenu }) {
  const [authToken, setAuthToken] = useState(sessionStorage.getItem('cp_admin_token') || '');
  const [passcode, setPasscode] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'menu' | 'stats'
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Add / Edit Dish Modal State
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [dishFormData, setDishFormData] = useState({
    name: '',
    category: 'Lunch',
    price: '',
    preparationTime: 10,
    isVeg: true,
    image: '',
    description: '',
    isAvailable: true
  });

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    const res = await adminLogin(passcode);
    setIsLoggingIn(false);

    if (res && res.success && res.token) {
      sessionStorage.setItem('cp_admin_token', res.token);
      setAuthToken(res.token);
      showToast('Admin access verified!', 'success');
    } else {
      setLoginError(res.message || 'Invalid passcode. Default is admin123');
    }
  };

  // Fetch admin stats & orders
  const loadAdminData = async () => {
    if (!authToken) return;
    setIsLoadingOrders(true);

    const [statsRes, ordersRes] = await Promise.all([
      getAdminStats(authToken),
      getAdminOrders(authToken)
    ]);

    setIsLoadingOrders(false);

    if (statsRes && statsRes.success) {
      setStats(statsRes.data);
    }
    if (ordersRes && ordersRes.success) {
      setOrders(ordersRes.data);
    }
  };

  useEffect(() => {
    if (authToken) {
      loadAdminData();
    }
  }, [authToken]);

  // Status progression action
  const handleStatusChange = async (orderNumber, newStatus) => {
    const res = await updateOrderStatus(authToken, orderNumber, newStatus);
    if (res && res.success) {
      showToast(`Order #${orderNumber} updated to ${newStatus}`, 'success');
      loadAdminData();
    } else {
      showToast(res.message || 'Status update failed', 'error');
    }
  };

  // Dish toggle availability
  const handleToggleAvailability = async (id) => {
    const res = await toggleItemAvailability(authToken, id);
    if (res && res.success) {
      showToast(res.message, 'success');
      onRefreshMenu();
      loadAdminData();
    } else {
      showToast(res.message || 'Failed to update stock', 'error');
    }
  };

  // Dish delete
  const handleDeleteDish = async (id) => {
    if (!confirm('Are you sure you want to delete this dish from the canteen menu?')) return;
    const res = await deleteMenuItem(authToken, id);
    if (res && res.success) {
      showToast('Dish deleted from menu', 'success');
      onRefreshMenu();
      loadAdminData();
    } else {
      showToast(res.message || 'Delete failed', 'error');
    }
  };

  // Open Dish Modal for Add
  const openAddModal = () => {
    setEditingDish(null);
    setDishFormData({
      name: '',
      category: 'Lunch',
      price: '',
      preparationTime: 10,
      isVeg: true,
      image: '',
      description: '',
      isAvailable: true
    });
    setIsDishModalOpen(true);
  };

  // Open Dish Modal for Edit
  const openEditModal = (dish) => {
    setEditingDish(dish);
    setDishFormData({
      name: dish.name,
      category: dish.category,
      price: dish.price,
      preparationTime: dish.preparationTime || 10,
      isVeg: dish.isVeg !== false,
      image: dish.image || '',
      description: dish.description || '',
      isAvailable: dish.isAvailable !== false
    });
    setIsDishModalOpen(true);
  };

  // Save Dish Submit
  const handleDishSubmit = async (e) => {
    e.preventDefault();
    if (!dishFormData.name || !dishFormData.price) {
      showToast('Name and price are required', 'warning');
      return;
    }

    let res;
    if (editingDish) {
      res = await updateMenuItem(authToken, editingDish._id, dishFormData);
    } else {
      res = await addMenuItem(authToken, dishFormData);
    }

    if (res && res.success) {
      showToast(editingDish ? 'Dish updated!' : 'New dish added!', 'success');
      setIsDishModalOpen(false);
      onRefreshMenu();
      loadAdminData();
    } else {
      showToast(res.message || 'Error saving dish', 'error');
    }
  };

  // If not logged in, show login prompt
  if (!authToken) {
    return (
      <main className="py-16 px-4 max-w-md mx-auto">
        <div className="bg-white p-8 rounded-3xl border border-forest-100 shadow-xl text-center">
          <div className="w-14 h-14 rounded-3xl bg-forest-900 text-mint-400 mx-auto flex items-center justify-center mb-4 shadow-sm">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-black text-forest-900">Canteen Staff Login</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Enter administrative passcode to manage kitchen queues & menu inventory.
          </p>

          {loginError && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-left font-bold text-slate-700 mb-1">
                Passcode (Default: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-forest-700">admin123</code>)
              </label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter admin passcode"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-center font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-mint-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isLoggingIn}
                className="flex-1 py-3 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-extrabold text-xs sm:text-sm shadow-md transition"
              >
                {isLoggingIn ? 'Verifying...' : 'Unlock Admin Portal'}
              </button>
              <button
                type="button"
                onClick={onExit}
                className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    const matchSearch =
      !orderSearch ||
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.student?.name || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.student?.studentId || '').toLowerCase().includes(orderSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <main className="pb-16 bg-slate-100/60 min-h-[calc(100vh-72px)]">
      
      {/* Top Banner */}
      <div className="bg-forest-900 text-white py-5 px-4 sm:px-8 border-b border-forest-800 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-mint-500 text-forest-950 flex items-center justify-center font-bold">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight">Canteen Operations & Kitchen Queue</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-mint-500 text-forest-950">
                  Staff Demo
                </span>
              </div>
              <p className="text-xs text-mint-200/80">Manage live kitchen progress, update dish availability & review orders</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1.5 rounded-full bg-forest-800 text-mint-200 border border-forest-700 font-semibold">
              {stats?.dbMode || 'DB Connected'}
            </span>
            <button
              onClick={onExit}
              className="px-3.5 py-2 rounded-xl bg-forest-800 hover:bg-forest-700 text-white text-xs font-bold transition flex items-center gap-1.5 border border-forest-700"
            >
              <span>Back to Student Portal</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Orders</p>
            <h3 className="text-3xl font-black text-forest-900 mt-1">{stats?.totalOrders || orders.length}</h3>
            <span className="text-[11px] text-mint-700 font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> Synchronized
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kitchen Queue</p>
            <h3 className="text-3xl font-black text-amber-600 mt-1">
              {stats?.activeOrders || orders.filter((o) => o.status !== 'Completed' && o.status !== 'Cancelled').length}
            </h3>
            <span className="text-[11px] text-amber-600 font-bold mt-1 block">Active Preparation</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-3xl font-black text-forest-900 mt-1">₹{stats?.totalRevenue || 0}</h3>
            <span className="text-[11px] text-slate-400 font-medium mt-1 block">Server-verified sales</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Crowd Vibe</p>
            <h3 className="text-3xl font-black text-forest-800 mt-1">{stats?.crowdLevel || 'Moderate'}</h3>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">Rating: {stats?.avgRating || '4.8'} ★</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-4 mb-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition ${
                activeTab === 'orders' ? 'bg-forest-800 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Kitchen Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition ${
                activeTab === 'menu' ? 'bg-forest-800 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Menu Items & Availability ({menuDishes.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'menu' && (
              <button
                onClick={openAddModal}
                className="px-4 py-2 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-extrabold text-xs transition flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-4 h-4 text-mint-400" />
                <span>Add New Dish</span>
              </button>
            )}
            <button
              onClick={loadAdminData}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingOrders ? 'animate-spin text-forest-700' : ''}`} />
            </button>
          </div>
        </div>

        {/* TAB 1: KITCHEN ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['All', 'Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      statusFilter === status
                        ? 'bg-forest-100 text-forest-900 border border-forest-300'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search token or student roll..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-forest-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Orders Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.length === 0 ? (
                <div className="col-span-3 py-14 text-center text-slate-400 text-xs">
                  No orders match this filter.
                </div>
              ) : (
                filteredOrders.map((o) => (
                  <div key={o.orderNumber} className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-lg text-forest-950">{o.orderNumber}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            o.status === 'Ready for Pickup'
                              ? 'bg-mint-100 text-forest-900 border border-mint-300'
                              : o.status === 'Preparing'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : o.status === 'Confirmed'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : o.status === 'Completed'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-purple-100 text-purple-900'
                          }`}>
                            {o.status}
                          </span>
                        </div>
                        <span className="text-xs font-black text-forest-700">₹{o.total}</span>
                      </div>

                      <div className="mt-3 text-xs text-slate-600 space-y-1">
                        <p><strong>Student:</strong> {o.student?.name} ({o.student?.studentId})</p>
                        <p><strong>Phone:</strong> {o.student?.phone}</p>
                        <p><strong>Pickup Slot:</strong> <span className="text-forest-800 font-bold">{o.pickupTime}</span></p>
                        <p><strong>Payment:</strong> {o.paymentMethod} ({o.paymentStatus})</p>
                      </div>

                      {/* Items */}
                      <div className="mt-3 bg-slate-50 p-3 rounded-2xl text-xs space-y-1.5 border border-slate-100">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Ordered Items:
                        </span>
                        {o.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-slate-800">
                            <span>{it.quantity}x {it.name}</span>
                            <span className="text-slate-400">₹{it.price * it.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Kitchen Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 text-xs">
                      {o.status === 'Pending' && (
                        <button
                          onClick={() => handleStatusChange(o.orderNumber, 'Confirmed')}
                          className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center justify-center gap-1 shadow-2xs"
                        >
                          <Check className="w-3.5 h-3.5" /> Confirm
                        </button>
                      )}

                      {o.status === 'Confirmed' && (
                        <button
                          onClick={() => handleStatusChange(o.orderNumber, 'Preparing')}
                          className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-black transition flex items-center justify-center gap-1 shadow-2xs"
                        >
                          <ChefHat className="w-3.5 h-3.5" /> Start Cooking
                        </button>
                      )}

                      {o.status === 'Preparing' && (
                        <button
                          onClick={() => handleStatusChange(o.orderNumber, 'Ready for Pickup')}
                          className="flex-1 py-2 rounded-xl bg-mint-600 hover:bg-mint-700 text-white font-black transition flex items-center justify-center gap-1 shadow-2xs"
                        >
                          <BellRing className="w-3.5 h-3.5" /> Mark Ready
                        </button>
                      )}

                      {o.status === 'Ready for Pickup' && (
                        <button
                          onClick={() => handleStatusChange(o.orderNumber, 'Completed')}
                          className="flex-1 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-black transition flex items-center justify-center gap-1 shadow-2xs"
                        >
                          <Check className="w-3.5 h-3.5 text-mint-400" /> Hand Over
                        </button>
                      )}

                      {o.status !== 'Completed' && o.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleStatusChange(o.orderNumber, 'Cancelled')}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-rose-600 font-bold transition text-[11px]"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* TAB 2: MENU MANAGEMENT & AVAILABILITY */}
        {activeTab === 'menu' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-forest-900 text-base">Canteen Menu Inventory</h3>
                <p className="text-xs text-slate-500">Toggle live availability (In Stock / Out of Stock) instantly</p>
              </div>
              <button
                onClick={openAddModal}
                className="px-3.5 py-2 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-4 h-4 text-mint-400" />
                <span>Add Dish</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F5] text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-200">
                    <th className="py-3 px-4">Dish Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Prep Time</th>
                    <th className="py-3 px-4">Diet</th>
                    <th className="py-3 px-4">Availability</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {menuDishes.map((dish) => {
                    const isAvailable = dish.isAvailable !== false;
                    return (
                      <tr key={dish._id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4 font-extrabold text-slate-900 flex items-center gap-2.5">
                          <img
                            src={dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=60'}
                            alt={dish.name}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-extrabold text-xs">{dish.name}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-xs">{dish.description}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold">{dish.category}</td>
                        <td className="py-3.5 px-4 font-black text-forest-700">₹{dish.price}</td>
                        <td className="py-3.5 px-4 font-medium">{dish.preparationTime || 10}m</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 font-bold ${dish.isVeg ? 'text-forest-700' : 'text-rose-700'}`}>
                            <span className={dish.isVeg ? 'veg-icon' : 'non-veg-icon'}></span>
                            <span>{dish.isVeg ? 'Veg' : 'Non-Veg'}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleAvailability(dish._id)}
                            className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition flex items-center gap-1.5 ${
                              isAvailable
                                ? 'bg-mint-100 text-forest-800 hover:bg-mint-200'
                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-mint-600' : 'bg-rose-600'}`}></span>
                            <span>{isAvailable ? 'In Stock' : 'Out of Stock'}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => openEditModal(dish)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-forest-800 hover:bg-slate-200 transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDish(dish._id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-100 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Dish Add/Edit Modal */}
      {isDishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-forest-900 text-base">
                {editingDish ? 'Edit Menu Dish' : 'Add New Menu Dish'}
              </h3>
              <button
                onClick={() => setIsDishModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDishSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masala Dosa"
                  value={dishFormData.name}
                  onChange={(e) => setDishFormData({ ...dishFormData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-forest-600 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={dishFormData.category}
                    onChange={(e) => setDishFormData({ ...dishFormData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                  >
                    {['Breakfast', 'Lunch', 'Snacks', 'Beverages', 'Dessert', 'Specials'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="60"
                    value={dishFormData.price}
                    onChange={(e) => setDishFormData({ ...dishFormData, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-forest-600 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prep Time (Mins)</label>
                  <input
                    type="number"
                    min="1"
                    value={dishFormData.preparationTime}
                    onChange={(e) => setDishFormData({ ...dishFormData, preparationTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-forest-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dietary Type</label>
                  <select
                    value={String(dishFormData.isVeg)}
                    onChange={(e) => setDishFormData({ ...dishFormData, isVeg: e.target.value === 'true' })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                  >
                    <option value="true">🟢 Vegetarian</option>
                    <option value="false">🔴 Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={dishFormData.image}
                  onChange={(e) => setDishFormData({ ...dishFormData, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-forest-600 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Freshly prepared with authentic ingredients..."
                  value={dishFormData.description}
                  onChange={(e) => setDishFormData({ ...dishFormData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-forest-600"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modal-available"
                  checked={dishFormData.isAvailable}
                  onChange={(e) => setDishFormData({ ...dishFormData, isAvailable: e.target.checked })}
                  className="w-4 h-4 rounded text-forest-700 accent-forest-700"
                />
                <label htmlFor="modal-available" className="font-bold text-slate-700">
                  Dish is In Stock & Available for Ordering
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white font-black text-xs sm:text-sm shadow-md transition mt-2"
              >
                Save Dish to Menu
              </button>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}

