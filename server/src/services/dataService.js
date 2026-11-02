const fs = require('fs').promises;
const path = require('path');
const { dbStatus } = require('../config/db');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const CrowdFeedback = require('../models/CrowdFeedback');
const FoodReview = require('../models/FoodReview');
const {
  initialMenuItems,
  initialCrowdFeedback,
  initialReviews,
  initialOrders
} = require('../data/initialData');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const MENU_FILE = path.join(DATA_DIR, 'menu.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const CROWD_FILE = path.join(DATA_DIR, 'crowd.json');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');

function generateId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const random = 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () =>
    Math.floor(Math.random() * 16).toString(16)
  );
  return timestamp + random;
}

async function readJsonFile(filePath, defaultValue = []) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await writeJsonFile(filePath, defaultValue);
      return defaultValue;
    }
    return defaultValue;
  }
}

async function writeJsonFile(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Initialization and seeding
async function initializeData() {
  if (dbStatus.isMongo) {
    try {
      const menuCount = await MenuItem.countDocuments();
      if (menuCount === 0) {
        console.log('🌱 Seeding initial data to MongoDB...');
        await MenuItem.insertMany(initialMenuItems);
        await CrowdFeedback.insertMany(initialCrowdFeedback);
        await FoodReview.insertMany(initialReviews);
        await Order.insertMany(initialOrders);
        console.log('✅ MongoDB collections initialized.');
      }
    } catch (err) {
      console.error('MongoDB initialization warning:', err.message);
    }
  } else {
    // Local JSON fail-safe fallback
    const existingMenu = await readJsonFile(MENU_FILE, []);
    if (existingMenu.length === 0) {
      const seeded = initialMenuItems.map((item) => ({
        _id: generateId(),
        ...item,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      await writeJsonFile(MENU_FILE, seeded);
    }

    const existingCrowd = await readJsonFile(CROWD_FILE, []);
    if (existingCrowd.length === 0) {
      const seeded = initialCrowdFeedback.map((item) => ({
        _id: generateId(),
        ...item,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.createdAt || new Date().toISOString()
      }));
      await writeJsonFile(CROWD_FILE, seeded);
    }

    const existingReviews = await readJsonFile(REVIEWS_FILE, []);
    if (existingReviews.length === 0) {
      const seeded = initialReviews.map((item) => ({
        _id: generateId(),
        ...item,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.createdAt || new Date().toISOString()
      }));
      await writeJsonFile(REVIEWS_FILE, seeded);
    }

    const existingOrders = await readJsonFile(ORDERS_FILE, []);
    if (existingOrders.length === 0) {
      const seeded = initialOrders.map((item) => ({
        _id: generateId(),
        ...item,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.createdAt || new Date().toISOString()
      }));
      await writeJsonFile(ORDERS_FILE, seeded);
    }
  }
}

// ================= MENU SERVICES =================
async function getAllMenuItems({ category, search, availableOnly } = {}) {
  if (dbStatus.isMongo) {
    const query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    if (availableOnly === 'true' || availableOnly === true) {
      query.isAvailable = true;
    }
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { tags: { $regex: search.trim(), $options: 'i' } }
      ];
    }
    return await MenuItem.find(query).sort({ category: 1, name: 1 });
  } else {
    let items = await readJsonFile(MENU_FILE, []);
    if (category && category !== 'All') {
      items = items.filter((i) => i.category.toLowerCase() === category.toLowerCase());
    }
    if (availableOnly === 'true' || availableOnly === true) {
      items = items.filter((i) => i.isAvailable === true);
    }
    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(s) ||
          (i.description && i.description.toLowerCase().includes(s)) ||
          (i.tags && i.tags.some((t) => t.toLowerCase().includes(s)))
      );
    }
    return items;
  }
}

async function getMenuItemById(id) {
  if (dbStatus.isMongo) {
    return await MenuItem.findById(id);
  } else {
    const items = await readJsonFile(MENU_FILE, []);
    return items.find((i) => i._id.toString() === id.toString()) || null;
  }
}

async function createMenuItem(itemData) {
  if (dbStatus.isMongo) {
    const item = new MenuItem(itemData);
    return await item.save();
  } else {
    const items = await readJsonFile(MENU_FILE, []);
    const newItem = {
      _id: generateId(),
      name: itemData.name,
      category: itemData.category || 'Lunch',
      price: Number(itemData.price),
      description: itemData.description || '',
      isAvailable: itemData.isAvailable !== undefined ? itemData.isAvailable : true,
      preparationTime: Number(itemData.preparationTime) || 10,
      isVeg: itemData.isVeg !== undefined ? itemData.isVeg : true,
      image:
        itemData.image ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
      rating: 4.5,
      ratingCount: 1,
      isPopular: !!itemData.isPopular,
      tags: itemData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.unshift(newItem);
    await writeJsonFile(MENU_FILE, items);
    return newItem;
  }
}

async function updateMenuItem(id, updates) {
  if (dbStatus.isMongo) {
    return await MenuItem.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  } else {
    const items = await readJsonFile(MENU_FILE, []);
    const idx = items.findIndex((i) => i._id.toString() === id.toString());
    if (idx === -1) return null;
    items[idx] = {
      ...items[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await writeJsonFile(MENU_FILE, items);
    return items[idx];
  }
}

async function deleteMenuItem(id) {
  if (dbStatus.isMongo) {
    return await MenuItem.findByIdAndDelete(id);
  } else {
    let items = await readJsonFile(MENU_FILE, []);
    const item = items.find((i) => i._id.toString() === id.toString());
    if (!item) return null;
    items = items.filter((i) => i._id.toString() !== id.toString());
    await writeJsonFile(MENU_FILE, items);
    return item;
  }
}

// ================= ORDER SERVICES =================
async function getAllOrders({ status, studentId, search } = {}) {
  if (dbStatus.isMongo) {
    const query = {};
    if (status && status !== 'All') {
      query.status = status;
    }
    if (studentId) {
      query['student.studentId'] = studentId;
    }
    if (search && search.trim()) {
      query.$or = [
        { orderNumber: { $regex: search.trim(), $options: 'i' } },
        { 'student.name': { $regex: search.trim(), $options: 'i' } },
        { 'student.studentId': { $regex: search.trim(), $options: 'i' } },
        { 'student.phone': { $regex: search.trim(), $options: 'i' } }
      ];
    }
    return await Order.find(query).sort({ createdAt: -1 });
  } else {
    let orders = await readJsonFile(ORDERS_FILE, []);
    if (status && status !== 'All') {
      orders = orders.filter((o) => o.status === status);
    }
    if (studentId) {
      orders = orders.filter(
        (o) => (o.student?.studentId || o.studentId)?.toLowerCase() === studentId.toLowerCase()
      );
    }
    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      orders = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(s) ||
          (o.student?.name || o.studentName || '').toLowerCase().includes(s) ||
          (o.student?.studentId || o.studentId || '').toLowerCase().includes(s) ||
          (o.student?.phone || o.phone || '').includes(s)
      );
    }
    return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

async function getOrderByNumber(orderNumber) {
  const normalized = orderNumber.trim().toUpperCase();
  if (dbStatus.isMongo) {
    return await Order.findOne({ orderNumber: normalized });
  } else {
    const orders = await readJsonFile(ORDERS_FILE, []);
    return orders.find((o) => o.orderNumber.toUpperCase() === normalized) || null;
  }
}

// Strict Server-Side Order Price Calculation
async function createOrderWithServerValidation({
  student,
  items,
  pickupTime,
  pickupCounter,
  paymentMethod,
  notes
}) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  // Fetch all menu items from database to compute authorized prices
  let verifiedItems = [];
  let calculatedSubtotal = 0;

  for (const requestedItem of items) {
    const qty = parseInt(requestedItem.quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      throw new Error(`Invalid quantity for item: ${requestedItem.name || 'unnamed'}`);
    }

    const menuItemId = requestedItem.menuItemId || requestedItem._id;
    const dbDish = await getMenuItemById(menuItemId);

    if (!dbDish) {
      throw new Error(`Dish not found in canteen menu: ${requestedItem.name}`);
    }

    if (dbDish.isAvailable === false) {
      throw new Error(`Dish "${dbDish.name}" is currently sold out and cannot be ordered.`);
    }

    // SERVER-SIDE AUTHORIZED PRICE FROM DATABASE
    const unitPrice = Number(dbDish.price);
    const itemTotal = unitPrice * qty;
    calculatedSubtotal += itemTotal;

    verifiedItems.push({
      menuItemId: dbDish._id.toString(),
      name: dbDish.name,
      price: unitPrice,
      quantity: qty,
      specialInstructions: requestedItem.specialInstructions || ''
    });
  }

  // Generate unique readable order number (e.g. CP-103)
  let count = 100;
  if (dbStatus.isMongo) {
    count += (await Order.countDocuments()) + 1;
  } else {
    const existing = await readJsonFile(ORDERS_FILE, []);
    count += existing.length + 1;
  }
  const orderNumber = `CP-${count}`;

  const payload = {
    orderNumber,
    student: {
      name: student.name.trim(),
      studentId: student.studentId.trim(),
      phone: student.phone.trim()
    },
    items: verifiedItems,
    subtotal: calculatedSubtotal,
    total: calculatedSubtotal, // packaging is free for students!
    pickupTime: pickupTime || 'Immediate (~15 mins)',
    pickupCounter: pickupCounter || 'Counter #1 (Express Pickup)',
    status: 'Pending',
    paymentMethod: paymentMethod || 'Pay at Counter',
    paymentStatus: paymentMethod === 'UPI / Online' ? 'Paid' : 'Pending',
    notes: notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (dbStatus.isMongo) {
    const order = new Order(payload);
    return await order.save();
  } else {
    const orders = await readJsonFile(ORDERS_FILE, []);
    const newOrder = {
      _id: generateId(),
      ...payload
    };
    orders.unshift(newOrder);
    await writeJsonFile(ORDERS_FILE, orders);
    return newOrder;
  }
}

async function updateOrderStatus(orderNumber, status, paymentStatus) {
  const allowed = ['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'];
  if (!allowed.includes(status)) {
    throw new Error(`Invalid status: ${status}. Must be one of: ${allowed.join(', ')}`);
  }

  const normalized = orderNumber.trim().toUpperCase();

  if (dbStatus.isMongo) {
    const update = { status };
    if (paymentStatus) update.paymentStatus = paymentStatus;
    return await Order.findOneAndUpdate({ orderNumber: normalized }, update, { new: true });
  } else {
    const orders = await readJsonFile(ORDERS_FILE, []);
    const idx = orders.findIndex((o) => o.orderNumber.toUpperCase() === normalized);
    if (idx === -1) return null;
    orders[idx].status = status;
    if (paymentStatus) orders[idx].paymentStatus = paymentStatus;
    orders[idx].updatedAt = new Date().toISOString();
    await writeJsonFile(ORDERS_FILE, orders);
    return orders[idx];
  }
}

// ================= CROWD FEEDBACK SERVICES =================
async function getCrowdFeedback(limit = 30) {
  if (dbStatus.isMongo) {
    return await CrowdFeedback.find().sort({ createdAt: -1 }).limit(limit);
  } else {
    const list = await readJsonFile(CROWD_FILE, []);
    return list
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }
}

async function submitCrowdFeedback({ crowdLevel, comment, estimatedWait, studentName, studentIdentifier }) {
  const allowed = ['Quiet', 'Moderate', 'Busy'];
  if (!allowed.includes(crowdLevel)) {
    throw new Error('Crowd level must be Quiet, Moderate, or Busy');
  }

  // Rate-limiting / Duplicate Protection (within 3 minutes)
  const identifier = studentIdentifier || studentName || 'anonymous';
  const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);

  if (dbStatus.isMongo) {
    const recentDuplicate = await CrowdFeedback.findOne({
      studentIdentifier: identifier,
      createdAt: { $gte: threeMinutesAgo }
    });
    if (recentDuplicate) {
      throw new Error('Please wait 3 minutes before submitting another crowd feedback report.');
    }

    const feedback = new CrowdFeedback({
      crowdLevel,
      comment: comment || '',
      estimatedWait: estimatedWait || (crowdLevel === 'Quiet' ? '< 5 mins' : crowdLevel === 'Busy' ? '15+ mins' : '5-10 mins'),
      studentName: studentName || 'Anonymous Student',
      studentIdentifier: identifier
    });
    return await feedback.save();
  } else {
    const list = await readJsonFile(CROWD_FILE, []);
    const recentDuplicate = list.find(
      (item) =>
        item.studentIdentifier === identifier &&
        new Date(item.createdAt) >= threeMinutesAgo
    );
    if (recentDuplicate) {
      throw new Error('Please wait 3 minutes before submitting another crowd feedback report.');
    }

    const newFeedback = {
      _id: generateId(),
      crowdLevel,
      comment: comment || '',
      estimatedWait: estimatedWait || (crowdLevel === 'Quiet' ? '< 5 mins' : crowdLevel === 'Busy' ? '15+ mins' : '5-10 mins'),
      studentName: studentName || 'Anonymous Student',
      studentIdentifier: identifier,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.unshift(newFeedback);
    await writeJsonFile(CROWD_FILE, list);
    return newFeedback;
  }
}

async function getCrowdSummary() {
  const reports = await getCrowdFeedback(30);

  const baseSchedule = [
    { time: '09:00 AM', label: 'Breakfast Open', crowdLevel: 'Quiet', score: 25 },
    { time: '10:30 AM', label: 'Morning Tea Break', crowdLevel: 'Moderate', score: 60 },
    { time: '12:00 PM', label: 'Lunch Starts', crowdLevel: 'Moderate', score: 65 },
    { time: '01:00 PM', label: 'Peak Lunch Rush', crowdLevel: 'Busy', score: 90 },
    { time: '02:00 PM', label: 'Late Lunch', crowdLevel: 'Moderate', score: 50 },
    { time: '03:30 PM', label: 'Snacks Break', crowdLevel: 'Busy', score: 75 },
    { time: '05:00 PM', label: 'Closing Soon', crowdLevel: 'Quiet', score: 20 }
  ];

  // Reports within last 90 minutes
  const now = Date.now();
  const recent = reports.filter((r) => now - new Date(r.createdAt).getTime() <= 90 * 60 * 1000);

  let currentLevel = 'Moderate';
  let avgWait = '5-10 mins';

  if (recent.length > 0) {
    const scores = { Quiet: 1, Moderate: 2, Busy: 3 };
    const avgScore = recent.reduce((sum, r) => sum + (scores[r.crowdLevel] || 2), 0) / recent.length;
    if (avgScore <= 1.4) {
      currentLevel = 'Quiet';
      avgWait = '< 5 mins';
    } else if (avgScore >= 2.4) {
      currentLevel = 'Busy';
      avgWait = '15+ mins';
    } else {
      currentLevel = 'Moderate';
      avgWait = '5-10 mins';
    }
  } else if (reports.length > 0) {
    currentLevel = reports[0].crowdLevel;
    avgWait = reports[0].estimatedWait || '5-10 mins';
  }

  return {
    currentLevel,
    avgWait,
    recentCount: recent.length,
    totalCount: reports.length,
    recentReports: reports.slice(0, 6),
    scheduleTrends: baseSchedule,
    disclaimer:
      'Estimates based on voluntary student check-ins and typical campus peak hours. Not an exact sensor occupancy count.'
  };
}

// ================= REVIEW SERVICES =================
async function getAllReviews({ menuItemId, limit = 30 } = {}) {
  if (dbStatus.isMongo) {
    const query = {};
    if (menuItemId) query.menuItemId = menuItemId;
    return await FoodReview.find(query).sort({ createdAt: -1 }).limit(limit);
  } else {
    let reviews = await readJsonFile(REVIEWS_FILE, []);
    if (menuItemId) {
      reviews = reviews.filter((r) => r.menuItemId === menuItemId);
    }
    return reviews
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }
}

async function createReview(data) {
  if (dbStatus.isMongo) {
    const review = new FoodReview(data);
    const saved = await review.save();

    if (data.menuItemId) {
      const all = await FoodReview.find({ menuItemId: data.menuItemId });
      const avg = all.reduce((sum, r) => sum + r.rating, 0) / all.length;
      await MenuItem.findByIdAndUpdate(data.menuItemId, {
        rating: Math.round(avg * 10) / 10,
        ratingCount: all.length
      });
    }

    return saved;
  } else {
    const reviews = await readJsonFile(REVIEWS_FILE, []);
    const newRev = {
      _id: generateId(),
      menuItemId: data.menuItemId || null,
      dishName: data.dishName || 'General Canteen Service',
      studentName: data.studentName,
      rating: Number(data.rating),
      comment: data.comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    reviews.unshift(newRev);
    await writeJsonFile(REVIEWS_FILE, reviews);

    if (data.menuItemId) {
      const items = await readJsonFile(MENU_FILE, []);
      const idx = items.findIndex((i) => i._id.toString() === data.menuItemId.toString());
      if (idx !== -1) {
        const itemRevs = reviews.filter((r) => r.menuItemId === data.menuItemId);
        const avg = itemRevs.reduce((sum, r) => sum + r.rating, 0) / itemRevs.length;
        items[idx].rating = Math.round(avg * 10) / 10;
        items[idx].ratingCount = itemRevs.length;
        await writeJsonFile(MENU_FILE, items);
      }
    }

    return newRev;
  }
}

// ================= ADMIN STATS =================
async function getAdminDashboardStats() {
  const orders = await getAllOrders();
  const menuItems = await getAllMenuItems();
  const crowdSummary = await getCrowdSummary();
  const reviews = await getAllReviews();

  const totalOrders = orders.length;
  const activeOrders = orders.filter(
    (o) => o.status === 'Pending' || o.status === 'Confirmed' || o.status === 'Preparing' || o.status === 'Ready for Pickup'
  ).length;
  const completedOrders = orders.filter((o) => o.status === 'Completed').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || o.totalAmount || 0), 0);
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '4.8';

  return {
    totalOrders,
    activeOrders,
    completedOrders,
    totalRevenue,
    avgRating,
    menuItemsCount: menuItems.length,
    crowdLevel: crowdSummary.currentLevel,
    dbMode: dbStatus.isMongo ? 'MongoDB Connected' : 'Demo Local Mode (Atlas Not Configured)'
  };
}

module.exports = {
  initializeData,
  // Menu
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  // Orders
  getAllOrders,
  getOrderByNumber,
  createOrderWithServerValidation,
  updateOrderStatus,
  // Crowd
  getCrowdFeedback,
  submitCrowdFeedback,
  getCrowdSummary,
  // Reviews
  getAllReviews,
  createReview,
  // Stats
  getAdminDashboardStats
};

