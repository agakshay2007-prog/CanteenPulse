# 🌿 CanteenPulse — Smart College Canteen Food Ordering & Crowd Pulse Hub

> **Backend Development CIA-2 Project**  
> **Tech Stack:** Node.js, Express.js (v5), MongoDB Atlas / Mongoose ODM, React 18, Vite, Tailwind CSS

[![Backend Test Suite](https://img.shields.io/badge/Test%20Suite-29%2F29%20Passed%20(100%25)-success?style=for-the-badge&logo=node.js)](https://github.com/agakshay2007-prog/CanteenPulse)
[![Vite Build](https://img.shields.io/badge/React%20Build-Passing-brightgreen?style=for-the-badge&logo=react)](https://github.com/agakshay2007-prog/CanteenPulse)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas%20%7C%20Mongoose-emerald?style=for-the-badge&logo=mongodb)](https://github.com/agakshay2007-prog/CanteenPulse)
[![Security](https://img.shields.io/badge/Security-HMAC--SHA256%20Tokens%20%7C%20Timing--Safe-blue?style=for-the-badge&logo=auth0)](https://github.com/agakshay2007-prog/CanteenPulse)

---

## 📖 1. Project Overview

**CanteenPulse** is a full-stack campus web application engineered to solve the long wait times, congested ordering queues, and peak-hour rushes in college canteens.

Students can browse the live digital menu before arriving, verify dish availability and prices, pre-order meals for an exact pickup window, track kitchen preparation progress, and check community-reported crowd levels. Canteen staff have a protected administrative portal to manage kitchen orders, update dish availability, and monitor real-time business metrics.

### 🎨 Visual & UI Design (CampusBites Reference)
* **Color Palette:** Warm cream (`#FAF9F5`) and soft mint-green gradient background with dark forest-green accents (`#166534`, `#0F5132`).
* **Visual Polish:** Subtle animated corner food doodle stickers matching CampusBites aesthetic.
* **Hero Headline:** **"Good Food. Less Waiting."**
* **Food Cards:** Rounded cards with soft shadows, crisp food imagery, green price badges, dietary tags (Veg 🟢 / Non-Veg 🔴), preparation times, and star ratings.
* **Express Collection:** Clear designation for **Express Counter #1** to bypass lines.

---

## 🏗️ 2. System Architecture & Backend Stack

```
                                  ┌─────────────────────────────┐
                                  │   React 18 + Vite Frontend  │
                                  │ (CampusBites Mint/Cream UI) │
                                  └──────────────┬──────────────┘
                                                 │ HTTP / JSON
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 Express.js Backend (Port 5000)                          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Security Headers   │  Rate Limiters (Sliding Window)  │  HMAC-SHA256 Auth Middleware   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  /api/health        │  /api/menu       │  /api/orders  │  /api/crowd   │  /api/reviews  │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                     Data Service & Business Logic (Server Pricing & State Machine)       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                     Mongoose ODM Models (Schema Validation, Indexes, Virtuals)          │
│        [MenuItem]        [Order]             [CrowdFeedback]          [FoodReview]      │
└────────────────────────────────────────┬────────────────────────────────────────────────┘
                                         │ Mongoose Driver (TLS/SSL)
                                         ▼
                 ┌───────────────────────────────────────────────┐
                 │       MongoDB Atlas Cloud Database Cluster    │
                 │          (canteenpulse production DB)         │
                 └───────────────────────────────────────────────┘
```

---

## ✨ 3. Core Modules & Backend Capabilities

### 🎓 Student Features
1. **Interactive Menu Exploration (`GET /api/menu`):**
   - Filter dishes by category (*Breakfast, Lunch, Snacks, Beverages, Dessert, Specials*).
   - Instant text search across dish names, descriptions, and tags.
   - Dietary indicator (Veg / Non-Veg) and stock availability flags.
2. **Strict Server-Side Price Calculation (`POST /api/orders`):**
   - Cart subtotal and totalAmount are computed **strictly on the backend** by fetching authentic unit prices from MongoDB.
   - Any client-submitted or tampered unit prices are rejected and ignored.
   - Prevents ordering of out-of-stock dishes.
   - Unique order numbers generated automatically (e.g. `CP-101`, `CP-102`).
3. **Live Order Tracking & Privacy Protection (`GET /api/orders/:orderNumber`):**
   - Look up order status: `PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED`.
   - Optional student verification check (`verifyPhone`, `verifyRoll`) to prevent students from viewing another student's order details.
4. **Community Crowd Pulse (`GET /api/crowd`, `POST /api/crowd`):**
   - Voluntary student check-in rating: `QUIET`, `MODERATE`, `BUSY`.
   - **Duplicate Spam Protection:** Rejects repeat submissions from the same student within 3 minutes.
   - Historical schedule trends (9:00 AM – 5:00 PM peak rush curve).
   - **Transparency Disclaimer:** Clear notice explaining that values are estimates based on voluntary student check-ins, not live sensor occupancy counts.
5. **Food Reviews & Auto-Recalculation (`POST /api/reviews`):**
   - 1-to-5 star ratings with student reviews.
   - Automatically recalculates `averageRating` and `totalReviews` on the corresponding `MenuItem` model.

### 🛡️ Administrative Capabilities & Security Architecture
1. **Cryptographic Admin Authentication (`POST /api/admin/login`):**
   - Passcode verification uses `crypto.timingSafeEqual` to eliminate timing side-channel attacks.
   - Generates tamper-proof **HMAC-SHA256 signed bearer tokens** with 24-hour expiration.
2. **Order Status State Machine:**
   - Enforces valid operational flow: `PENDING` ➔ `CONFIRMED` ➔ `PREPARING` ➔ `READY` ➔ `COMPLETED`.
   - Any active order can transition to `CANCELLED`.
   - Terminal states (`COMPLETED`, `CANCELLED`) cannot be changed.
3. **Menu Management:**
   - Add new dishes, edit prices, delete items, and instant 1-click availability toggling.
4. **Security Hardening:**
   - **Security Headers:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`.
   - **Rate Limiting:** Sliding-window rate limiters on API requests, login attempts, orders, and crowd feedback.
   - **Body Size Guard:** Payloads restricted to 1MB (`express.json({ limit: '1mb' })`).
   - **Safe Error Handler:** No stack traces or environment secrets leaked to client responses.

---

## 🗄️ 4. Database Models & Schema Design

### `MenuItem`
| Field | Type | Rules & Validation | Description |
|---|---|---|---|
| `name` | String | Required, Trimmed, Max 100 chars | Dish name |
| `description` | String | Trimmed | Dish description and ingredients |
| `category` | String | Enum: Breakfast, Lunch, Snacks, Beverages, Dessert, Specials | Food category |
| `price` | Number | Required, Min: 0.01 | Dish unit price in ₹ |
| `image` | String | URL String | Food photograph URL |
| `isAvailable` | Boolean | Default: `true`, Indexed | In Stock vs Sold Out |
| `preparationTime` | Number | Min: 1 minute, Default: 10 | Estimated cooking minutes |
| `isVeg` | Boolean | Default: `true` | Vegetarian flag |
| `averageRating` | Number | Min: 1, Max: 5, Default: 4.5 | Dynamically computed average rating |
| `totalReviews` | Number | Min: 0, Default: 1 | Count of verified student reviews |

### `Order`
| Field | Type | Rules & Validation | Description |
|---|---|---|---|
| `orderNumber` | String | Required, Unique, Uppercase, Indexed | E.g. `CP-101` |
| `studentName` | String | Required, Trimmed | Student full name |
| `rollNumber` | String | Required, Uppercase, Indexed | College Roll / Student ID |
| `phoneNumber` | String | Required, Regex validation (10–15 digits) | Contact phone number |
| `items` | Array | Non-empty array of `{ menuItemId, name, price, quantity, specialInstructions }` | Ordered dish items |
| `subtotal` | Number | Server-calculated, Min: 0 | Sum of item unit prices * quantities |
| `totalAmount` | Number | Server-calculated, Min: 0 | Grand total payable |
| `pickupTime` | String | Required | Chosen collection window |
| `pickupCounter` | String | Default: `Counter #1 (Express Pickup)` | Dedicated counter |
| `status` | String | Enum: `PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED` | Kitchen progression state |
| `paymentMethod` | String | `Pay at Counter` or `UPI / Online` | Payment type |
| `paymentStatus` | String | `Pending` or `Paid` | Payment reconciliation |

### `CrowdFeedback`
| Field | Type | Rules & Validation | Description |
|---|---|---|---|
| `crowdLevel` | String | Enum: `QUIET`, `MODERATE`, `BUSY` | Student perception of rush |
| `comment` | String | Optional, Max 300 chars | Brief comment on queue |
| `estimatedWait` | String | E.g. `< 5 mins`, `5-10 mins`, `15+ mins` | Estimated queue wait time |
| `studentIdentifier`| String | Indexed | Student ID/IP for 3-minute rate limiting |

### `FoodReview`
| Field | Type | Rules & Validation | Description |
|---|---|---|---|
| `menuItem` | Mixed / ObjectId | Ref to `MenuItem` | Associated dish ID |
| `dishName` | String | Required, Trimmed | Name of dish reviewed |
| `studentName` | String | Required, Trimmed | Reviewer name |
| `rating` | Number | Required, Min: 1, Max: 5 | Star score |
| `comment` | String | Required, Min 3, Max 500 chars | Student feedback |

---

## 🔌 5. Complete REST API Reference

### Public Endpoints
| Method | Endpoint | Query / Body Params | Description |
|---|---|---|---|
| `GET` | `/api/health` | None | Returns uptime, memory usage, and database connection state |
| `GET` | `/api/menu` | `?category=&search=&availableOnly=` | Lists menu items with filtering and search |
| `GET` | `/api/menu/:id` | None | Fetches single dish profile |
| `POST` | `/api/orders` | `{ studentName, rollNumber, phoneNumber, pickupTime, items }` | Places order with server pricing |
| `GET` | `/api/orders/:orderNumber` | `?verifyPhone=&verifyRoll=` | Tracks order status with optional privacy check |
| `GET` | `/api/crowd` | None | Returns crowd pulse level, schedule trends, and disclaimer |
| `POST` | `/api/crowd` | `{ crowdLevel, comment, studentIdentifier }` | Submits crowd check-in (3-min duplicate cooldown) |
| `GET` | `/api/reviews` | `?menuItemId=` | Retrieves dish reviews |
| `POST` | `/api/reviews` | `{ menuItemId, dishName, studentName, rating, comment }` | Publishes review & updates dish average |

### Protected Administrative Endpoints (`x-admin-token` or `Authorization: Bearer <token>` required)
| Method | Endpoint | Request Body | Description |
|---|---|---|---|
| `POST` | `/api/admin/login` | `{ passcode: "admin123" }` | Authenticates and returns 24h HMAC signed token |
| `GET` | `/api/admin/stats` | None | Returns KPI metrics, active orders, and revenue |
| `GET` | `/api/admin/orders` | `?status=&rollNumber=&search=` | Retrieves all orders with filtering |
| `PATCH` | `/api/admin/orders/:orderNumber/status` | `{ status: "PREPARING" }` | Updates order state via state machine |
| `POST` | `/api/admin/menu` | Dish creation payload | Adds new dish to canteen catalog |
| `PUT` | `/api/admin/menu/:id` | Dish update payload | Updates dish details or price |
| `PATCH` | `/api/admin/menu/:id/toggle-availability` | None | 1-Click toggle between In Stock & Out of Stock |
| `DELETE` | `/api/admin/menu/:id` | None | Removes dish from menu |

---

## 🚀 6. Installation & Quick Start

### Prerequisites
* **Node.js** v18+ (tested on Node v24)
* **npm** v9+
* **MongoDB Atlas account** (or local MongoDB)

### 1. Setup Environment
```bash
git clone https://github.com/agakshay2007-prog/CanteenPulse.git
cd Canteenplus

# Copy sample configuration
copy .env.example .env
```

### 2. Configure MongoDB Atlas in `.env`
Edit `.env` with your MongoDB Atlas connection string:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/canteenpulse?retryWrites=true&w=majority
ADMIN_PASSCODE=admin123
ADMIN_SECRET=canteenpulse_secret_key_2026
```
*(CanteenPulse also features a resilient offline storage mode if Atlas is temporarily unreachable).*

### 3. Start the Server
```bash
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser!

### 4. Run Frontend in Development Mode
```bash
# Terminal 1: Backend Server (Port 5000)
npm run server

# Terminal 2: Vite React Client (Port 3000)
npm run client
```

---

## 🧪 7. Automated Test Suite (29 Comprehensive Tests)

Run the automated backend verification suite:
```bash
npm test
```

### Test Results Summary:
```
================================================================
🧪 CANTEENPULSE BACKEND CIA-2 AUTOMATED VERIFICATION SUITE
================================================================

✅ [TEST 01] PASS: Security Headers Middleware (nosniff, DENY, XSS-Protection active)
✅ [TEST 02] PASS: Database Health & Connection Status (Type: MongoDB Atlas / Resilient Demo Mode)
✅ [TEST 03] PASS: GET /api/menu (Full Menu Retrieval) (Retrieved 14 dishes)
✅ [TEST 04] PASS: GET /api/menu?category=Lunch (Category Filter) (Matches: 3)
✅ [TEST 05] PASS: GET /api/menu?search=Dosa (Text Search) (Found 1 matching dish(es))
✅ [TEST 06] PASS: GET /api/menu/:id (Lookup Dish by ID) (Fetched: Crispy Masala Dosa)
✅ [TEST 07] PASS: GET /api/menu/:id (Lookup Nonexistent Dish) (Returns 404 Not Found)
✅ [TEST 08] PASS: Strict Server-Side Price Calculation (Client ₹1 price overridden by DB ₹60 -> Total: ₹120)
✅ [TEST 09] PASS: Reject Negative Item Quantity (Blocked negative quantity)
✅ [TEST 10] PASS: Reject Empty Order Items Array (Cart cannot be empty error)
✅ [TEST 11] PASS: Reject Missing Student Roll Number (Roll number required validation)
✅ [TEST 12] PASS: Validate 10-Digit Phone Number Format (Invalid phone number rejected)
✅ [TEST 13] PASS: GET /api/orders/:orderNumber (Live Order Tracking) (Tracking CP-113 -> Status: PENDING)
✅ [TEST 14] PASS: GET /api/orders/:orderNumber (Nonexistent Order) (Returns 404 Not Found)
✅ [TEST 15] PASS: Order Privacy Protection (Mismatched Phone) (Unauthorized access blocked (403))
✅ [TEST 16] PASS: POST /api/crowd (Voluntary Crowd Check-in) (Check-in recorded)
✅ [TEST 17] PASS: Crowd Feedback 3-Minute Rate-Limit Protection (Duplicate submission blocked within cooldown)
✅ [TEST 18] PASS: GET /api/crowd (Crowd Pulse & Trends with Disclaimer) (Current: BUSY, Has Disclaimer: Yes)
✅ [TEST 19] PASS: POST /api/reviews (Submit Food Review) (Review published)
✅ [TEST 20] PASS: Food Review Rating Boundary Validation (1-5) (Rating 6 rejected)
✅ [TEST 21] PASS: POST /api/admin/login (Signed HMAC Token Generation) (Issued 24h HMAC-SHA256 Token)
✅ [TEST 22] PASS: POST /api/admin/login (Timing-Safe Rejection of Invalid Passcode) (401 Unauthorized)
✅ [TEST 23] PASS: HMAC Token Verification & Expiry Check (Verified Role: ADMIN)
✅ [TEST 24] PASS: Cryptographic Tamper Detection (Tampered signature rejected)
✅ [TEST 25] PASS: Valid Order Status Transition: PENDING -> CONFIRMED (Status: CONFIRMED)
✅ [TEST 26] PASS: Valid Order Status Transition: CONFIRMED -> PREPARING (Status: PREPARING)
✅ [TEST 27] PASS: State Machine Rejection: PREPARING -> PENDING (Invalid transition blocked)
✅ [TEST 28] PASS: GET /api/admin/stats (Admin Dashboard Metrics) (Orders: 13, Rev: ₹1410)
✅ [TEST 29] PASS: PATCH /api/admin/menu/:id/toggle-availability (New status: Out of Stock)

================================================================
🏁 VERIFICATION COMPLETE: 29/29 TESTS PASSED (100%)
================================================================
```

---

## 📮 8. Postman API Collection

A ready-to-import Postman collection is included in the project root:
* **File:** `CanteenPulse.postman_collection.json`
* **Features:**
  * Pre-configured environment variables (`baseUrl = http://localhost:5000/api`, `adminToken = admin123`).
  * All 16 REST endpoints with example payloads, query filters, and test descriptions.

---

## 🎓 9. CIA-2 Evaluation Viva Voce Preparation Guide

### Q1: Why do you calculate order prices on the backend rather than using the frontend cart total?
**Answer:** A malicious student could intercept the HTTP request and tamper with prices (e.g., sending `price: 1` for a ₹100 meal). In CanteenPulse, the client only sends item IDs and quantities. The backend fetches authentic unit prices directly from the database and calculates the subtotal and totalAmount securely on the server.

### Q2: How does your administrative authentication prevent timing attacks?
**Answer:** Standard string comparison (`===`) terminates as soon as the first mismatched character is detected, allowing attackers to measure execution time and guess characters. CanteenPulse uses Node.js `crypto.timingSafeEqual`, which takes constant time regardless of where mismatches occur, preventing timing side-channel attacks.

### Q3: How do you prevent crowd pulse rating manipulation?
**Answer:** CanteenPulse applies dual-layer defense:
1. An in-memory sliding-window rate limiter blocks rapid bursts.
2. A database-level timestamp check prevents any student identifier from submitting more than one crowd report every 3 minutes.
3. Every response includes an explicit transparency disclaimer stating that the pulse is based on voluntary student check-ins, not exact physical occupancy sensors.

### Q4: How is order status managed to prevent invalid transitions?
**Answer:** An order status state machine (`ALLOWED_TRANSITIONS`) strictly validates every status change. An order in `PENDING` can only move to `CONFIRMED` or `CANCELLED`. Backward moves (e.g. `PREPARING` back to `PENDING`) and edits to terminal states (`COMPLETED`, `CANCELLED`) are rejected with `400 Bad Request`.

### Q5: What database indexes did you create and why?
**Answer:**
- `MenuItem`: Compound index `{ category: 1, isAvailable: 1 }` for rapid filtering, and text index `{ name: 'text', description: 'text' }` for search.
- `Order`: Unique index on `orderNumber`, compound index `{ rollNumber: 1, status: 1 }` for student tracking, and `{ createdAt: -1 }` for chronological admin ordering.
- `CrowdFeedback`: Compound index `{ studentIdentifier: 1, createdAt: -1 }` for instant 3-minute duplicate check.
- `FoodReview`: Index on `{ menuItem: 1, createdAt: -1 }` for fast review retrieval and rating recalculation.

---

## 📄 License
Academic Project under ISC License. Developed for Backend Development CIA-2 Assessment.
