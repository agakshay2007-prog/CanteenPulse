/**
 * CanteenPulse Frontend API Client
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`API Error on ${options.method || 'GET'} ${endpoint}:`, err);
    return {
      success: false,
      message: err.message || 'Network connection failed'
    };
  }
}

// Menu APIs
export const getMenu = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/menu${query ? `?${query}` : ''}`);
};

export const getMenuItem = (id) => request(`/menu/${id}`);

// Order APIs
export const submitOrder = (orderData) =>
  request('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });

export const getOrder = (orderNumber, verifyPhone = '', verifyId = '') => {
  const query = new URLSearchParams();
  if (verifyPhone) query.append('verifyPhone', verifyPhone);
  if (verifyId) query.append('verifyId', verifyId);
  const qStr = query.toString();
  return request(`/orders/${orderNumber}${qStr ? `?${qStr}` : ''}`);
};

// Crowd APIs
export const getCrowdSummary = () => request('/crowd');

export const submitCrowdFeedback = (data) =>
  request('/crowd', {
    method: 'POST',
    body: JSON.stringify(data)
  });

// Review APIs
export const getReviews = (menuItemId = '') => {
  const q = menuItemId ? `?menuItemId=${menuItemId}` : '';
  return request(`/reviews${q}`);
};

export const submitReview = (data) =>
  request('/reviews', {
    method: 'POST',
    body: JSON.stringify(data)
  });

// Admin APIs
export const adminLogin = (passcode) =>
  request('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ passcode })
  });

export const getAdminStats = (token) =>
  request('/admin/stats', {
    headers: { 'x-admin-token': token }
  });

export const getAdminOrders = (token, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/admin/orders${query ? `?${query}` : ''}`, {
    headers: { 'x-admin-token': token }
  });
};

export const updateOrderStatus = (token, orderNumber, status, paymentStatus) =>
  request(`/admin/orders/${orderNumber}/status`, {
    method: 'PATCH',
    headers: { 'x-admin-token': token },
    body: JSON.stringify({ status, paymentStatus })
  });

export const addMenuItem = (token, data) =>
  request('/admin/menu', {
    method: 'POST',
    headers: { 'x-admin-token': token },
    body: JSON.stringify(data)
  });

export const updateMenuItem = (token, id, data) =>
  request(`/admin/menu/${id}`, {
    method: 'PUT',
    headers: { 'x-admin-token': token },
    body: JSON.stringify(data)
  });

export const toggleItemAvailability = (token, id) =>
  request(`/admin/menu/${id}/toggle-availability`, {
    method: 'PATCH',
    headers: { 'x-admin-token': token }
  });

export const deleteMenuItem = (token, id) =>
  request(`/admin/menu/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-token': token }
  });
