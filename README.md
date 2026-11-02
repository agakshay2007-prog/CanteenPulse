# 🌿 CanteenPulse — Smart College Canteen Food Ordering & Crowd Pulse Hub

> **Backend Development CIA-2 Project**  
> **Tech Stack:** Node.js, Express.js, MongoDB (Mongoose ODM), React, Vite, Tailwind CSS

[![Backend Test Suite](https://img.shields.io/badge/Test%20Suite-16%2F16%20Passed%20(100%25)-success?style=for-the-badge&logo=node.js)](https://github.com/agakshay2007-prog/CanteenPulse)
[![Vite Build](https://img.shields.io/badge/React%20Build-Passing-brightgreen?style=for-the-badge&logo=react)](https://github.com/agakshay2007-prog/CanteenPulse)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20%7C%20Mongoose-emerald?style=for-the-badge&logo=mongodb)](https://github.com/agakshay2007-prog/CanteenPulse)

---

## 📖 1. Project Overview

**CanteenPulse** is a full-stack campus web application designed to solve the long wait times, congested ordering counters, and peak-hour rushes in college canteens.

Students can browse the live digital menu before arriving, check real-time dish availability and prices, pre-order meals for an exact pickup window, track kitchen preparation progress, and check community-reported crowd vibes. Canteen staff have a dedicated, protected dashboard to manage the kitchen queue and update food availability in real-time.

### 🎨 Visual & UI Design (CampusBites Inspiration)
* **Color Palette:** Warm cream (`#FAF9F5`) and soft mint-green gradient background with dark forest-green accents (`#166534`, `#0F5132`).
* **Hero Headline:** **"Good Food. Less Waiting."**
* **Food Cards:** Rounded cards with subtle shadows, crisp food imagery, green price badges, dietary tags (Veg 🟢 / Non-Veg 🔴), preparation times, and star ratings.
* **Express Collection:** Clear designation for **Express Counter #1** to bypass ordering lines.

---

## ✨ 2. Key Features

### 🎓 Student Portal
1. **Interactive Menu Exploration:**
   - Filter dishes by category (*Breakfast, Lunch, Snacks, Beverages, Dessert, Specials*).
   - Instant search by dish name or ingredients.
   - Dietary toggle (*Veg Only*) and *In-Stock Only* filter.
   - Live availability badge: `In Stock` (Green) or `Sold Out` (Red).
2. **Cart & Tamper-Proof Online Booking:**
   - Add/remove items with quantity controls and special cooking instructions.
   - Select specific pickup time slots (*Immediate ~15m, 12:45–1:00 PM, 1:00–1:15 PM, 1:15–1:30 PM, 3:30–3:45 PM*).
   - **Server-Side Price Calculation:** Server calculates subtotals from database menu prices, completely ignoring any tampered frontend prices.
   - Blocks ordering of unavailable or sold-out dishes.
   - Generates unique order number (e.g. `CP-101`) upon submission.
3. **Live Order Tracking:**
   - Look up any order by Order Number (with optional phone/ID verification).
   - Visual step progress: **Pending ➔ Confirmed ➔ Preparing ➔ Ready for Pickup ➔ Completed**.
   - Pickup counter instructions (*Express Counter #1*).
4. **Community Crowd Pulse:**
   - Voluntary student check-in rating: **Quiet 🟢, Moderate 🟡, Busy 🔴**.
   - Estimated wait times and seating availability tips.
   - **Duplicate Protection:** Prevents repeated submissions within 3 minutes to stop trend inflation.
   - Peak rush trend chart (*09:00 AM – 05:00 PM*).
   - **Transparency Disclaimer:** Explicit notice explaining results are voluntary estimates, not live sensor occupancy counts.
5. **Food Ratings & Reviews:**
   - 1-to-5 star ratings with student reviews and dish feedback.
   - Automatic calculation of dish average ratings.

### 🛠️ Canteen Administrator Portal (Protected)
1. **Secure Admin Authentication:**
   - Protected endpoints requiring `x-admin-token` header or passcode (`admin123`).
2. **Kitchen Queue Kanban:**
   - View incoming orders in real-time.
   - One-click status progression: `Confirm` ➔ `Start Cooking` ➔ `Mark Ready` ➔ `Hand Over`.
3. **Menu & Stock Management:**
   - Add new dishes, edit descriptions/prices/prep times, or remove dishes.
   - **1-Click Availability Toggle:** Instantly mark items as `In Stock` or `Out of Stock` (immediately reflects on student UI).
4. **Operational Analytics:**
   - Live KPIs: Today's Orders, Total Sales Revenue, Active Kitchen Queue, and Average Food Rating.

---

## 🏗️ 3. Architecture & Project Structure

```
Canteenplus/
├── client/                     # Frontend (React 18 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Modular UI Components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── CategoryFilters.jsx
│   │   │   ├── FoodCard.jsx
│   │   │   ├── CartDrawer.jsx
│   │   │   ├── OrderSuccessModal.jsx
│   │   │   ├── OrderTracker.jsx
│   │   │   ├── CrowdPulse.jsx
│   │   │   ├── CrowdFeedbackModal.jsx
│   │   │   ├── ReviewsSection.jsx
│   │   │   ├── ReviewModal.jsx
│   │   │   └── AdminPortal.jsx
│   │   ├── services/
│   │   │   └── api.js          # Centralized fetch API wrapper
│   │   ├── styles/
│   │   │   └── index.css       # Custom design system styles
│   │   ├── App.jsx             # Top-level client state & routing
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Backend (Node.js + Express.js + Mongoose)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # Database connector with resilient fallback
│   │   ├── controllers/        # Route controllers
│   │   │   ├── menuController.js
│   │   │   ├── orderController.js
│   │   │   ├── crowdController.js
│   │   │   ├── reviewController.js
│   │   │   └── adminController.js
│   │   ├── data/
│   │   │   └── initialData.js  # Rich realistic seed data
│   │   ├── middleware/
│   │   │   ├── auth.js         # Administrative authorization middleware
│   │   │   └── errorHandler.js # Centralized error handler
│   │   ├── models/             # Mongoose Schemas & ODM Models
│   │   │   ├── MenuItem.js
│   │   │   ├── Order.js
│   │   │   ├── CrowdFeedback.js
│   │   │   └── FoodReview.js
│   │   ├── routes/             # REST Route definitions
│   │   │   ├── menuRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   ├── crowdRoutes.js
│   │   │   ├── reviewRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── services/
│   │   │   └── dataService.js  # Unified MongoDB & fail-safe persistence
│   │   └── server.js           # Server entry point
│   ├── test/
│   │   └── api.test.js         # Automated 16-point verification test suite
│   └── package.json
│
├── .env.example                # Template for environment variables
├── .gitignore                  # Git exclusions (.env, node_modules, etc.)
├── package.json                # Root automation scripts
└── README.md                   # Project documentation
```

---

## 🗄️ 4. Database Models (Mongoose Schemas)

### `MenuItem`
| Field | Type | Description |
|---|---|---|
| `name` | String | Dish name (Required, Trimmed) |
| `description` | String | Description of dish |
| `category` | String | `Breakfast`, `Lunch`, `Snacks`, `Beverages`, `Dessert`, `Specials` |
| `price` | Number | Dish price in ₹ (Required, Min: 0) |
| `image` | String | High-resolution dish photo URL |
| `isAvailable` | Boolean | In Stock (`true`) or Sold Out (`false`) |
| `preparationTime`| Number | Estimated preparation time in minutes |
| `isVeg` | Boolean | `true` for Veg, `false` for Non-Veg |
| `rating` | Number | Average user rating (1.0 to 5.0) |
| `ratingCount` | Number | Total verified ratings count |
| `isPopular` | Boolean | Highlight badge flag |

### `Order`
| Field | Type | Description |
|---|---|---|
| `orderNumber` | String | Unique order token (e.g. `CP-101`) |
| `student` | Object | `{ name, studentId, phone }` |
| `items` | Array | Array of `{ menuItemId, name, price, quantity, specialInstructions }` |
| `subtotal` | Number | Server-calculated item total |
| `total` | Number | Grand total payable |
| `pickupTime` | String | Selected collection slot (e.g. `1:00 PM - 1:15 PM`) |
| `pickupCounter` | String | Designated pickup counter (Default: `Counter #1`) |
| `status` | String | `Pending`, `Confirmed`, `Preparing`, `Ready for Pickup`, `Completed`, `Cancelled` |
| `paymentMethod`| String | `Pay at Counter` or `UPI / Online` |
| `paymentStatus`| String | `Pending` or `Paid` |

### `CrowdFeedback`
| Field | Type | Description |
|---|---|---|
| `crowdLevel` | String | `Quiet`, `Moderate`, or `Busy` |
| `comment` | String | Optional student note (Max: 200 chars) |
| `estimatedWait` | String | E.g. `< 5 mins`, `5-10 mins`, `15+ mins` |
| `studentName` | String | Optional student name / branch |
| `studentIdentifier`| String | Identifier for duplicate-rate-limit protection |

### `FoodReview`
| Field | Type | Description |
|---|---|---|
| `menuItemId` | String | Referenced menu item ID (Optional for general service) |
| `dishName` | String | Dish name reviewed |
| `studentName` | String | Name of student |
| `rating` | Number | 1 to 5 Stars |
| `comment` | String | Review feedback |

---

## 🔌 5. REST API Documentation

### Public Endpoints
| Method | Endpoint | Description | Status |
|---|---|---|---|
| `GET` | `/api/health` | System health and database status | `200` |
| `GET` | `/api/menu` | List all menu dishes with optional `?category=&search=&availableOnly=` | `200` |
| `GET` | `/api/menu/:id` | Fetch details of a specific dish | `200` / `404` |
| `POST` | `/api/orders` | Place order (Server calculates prices & verifies stock) | `201` / `400` |
| `GET` | `/api/orders/:orderNumber` | Track live order status with optional verification | `200` / `404` |
| `GET` | `/api/crowd` | Get crowd pulse summary, vibe score & hourly trends | `200` |
| `POST` | `/api/crowd` | Submit voluntary crowd report (3-min duplicate protection) | `201` / `400` |
| `GET` | `/api/reviews` | Get verified student reviews | `200` |
| `POST` | `/api/reviews` | Submit star rating and comment for a dish | `201` / `400` |

### Protected Admin Endpoints (`x-admin-token` header required)
| Method | Endpoint | Description | Status |
|---|---|---|---|
| `POST` | `/api/admin/login` | Authenticate with admin passcode (`admin123`) | `200` / `401` |
| `GET` | `/api/admin/stats` | Retrieve overall analytics, revenue & order counts | `200` / `403` |
| `GET` | `/api/admin/orders` | View live kitchen queue with filters | `200` / `403` |
| `PATCH`| `/api/admin/orders/:orderNumber/status` | Update kitchen status (`Preparing`, `Ready`, etc.) | `200` / `400` |
| `POST` | `/api/admin/menu` | Add a new dish to the canteen menu | `201` / `400` |
| `PUT` | `/api/admin/menu/:id` | Update dish details or price | `200` / `404` |
| `PATCH`| `/api/admin/menu/:id/toggle-availability` | Toggle In Stock / Out of Stock | `200` / `404` |
| `DELETE`| `/api/admin/menu/:id` | Remove a dish from the menu | `200` / `404` |

---

## 🚀 6. Installation & Quick Start

### Prerequisites
* **Node.js** v18+ (tested on Node v24)
* **npm** v9+

### 1. Clone & Configure Environment
```bash
git clone https://github.com/agakshay2007-prog/CanteenPulse.git
cd Canteenplus

# Copy environment template
copy .env.example .env
```

### 2. Configure MongoDB (Local or Atlas)
Open `.env` and set your MongoDB URI:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/canteenpulse
ADMIN_PASSCODE=admin123
ADMIN_SECRET=canteenpulse_secret_key_2026
```
> **Resilient Fail-Safe Feature:** If MongoDB is not active on your machine during grading/demo, CanteenPulse automatically uses a persistent local storage fallback in `server/data/`. All REST APIs, CRUD, ordering, and crowd tracking remain 100% operational without crashing!

### 3. Run Application
```bash
# Start unified server (serves REST API + React UI)
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser!

### 4. Development Mode (Frontend Hot-Reloading)
To run frontend and backend simultaneously with live hot-reloading:
```bash
# Terminal 1: Backend Server (Port 5000)
npm run server

# Terminal 2: Vite React Frontend (Port 3000)
npm run client
```

---

## 🧪 7. Automated Test Suite

CanteenPulse includes an automated 16-point backend test suite covering the entire API lifecycle.

To execute the test suite:
```bash
npm test
```

### Test Verification Output:
```
🧪 Starting CanteenPulse Backend Verification Suite...

✅ [PASS] 1. GET /api/menu (14 verified dishes)
✅ [PASS] 2. GET /api/menu/:id (Fetched: Crispy Masala Dosa)
✅ [PASS] 3. Server-Side Price Calculation (Tampered ₹1 price rejected, DB ₹60 enforced -> Total: ₹120)
✅ [PASS] 4. Reject Invalid Item Quantity (Negative quantity blocked)
✅ [PASS] 5. GET /api/orders/:orderNumber (Live Status: Pending)
✅ [PASS] 6. POST /api/crowd (Voluntary Crowd Feedback Registered)
✅ [PASS] 7. Duplicate Crowd Protection (Repeated submissions within 3 mins blocked)
✅ [PASS] 8. GET /api/crowd (Vibe trends and transparency disclaimer verified)
✅ [PASS] 9. POST /api/reviews (Food rating & review saved)
✅ [PASS] 10. POST /api/admin/login (Verified demo admin credentials)
✅ [PASS] 11. PATCH /api/admin/orders/:id/status (Progressed to 'Preparing')
✅ [PASS] 12. PATCH /api/admin/menu/:id/toggle-availability (Marked Sold Out)
✅ [PASS] 13. Sold-out Prevention (Orders for out-of-stock items blocked)
✅ [PASS] 14. POST /api/admin/menu (Admin added new dish)
✅ [PASS] 15. PUT /api/admin/menu/:id (Admin updated dish price)
✅ [PASS] 16. DELETE /api/admin/menu/:id (Admin deleted dish)

========================================
📊 Total Tests: 16/16 Passed (100%)
========================================
```

---

## 🎓 8. CIA-2 Evaluation & Viva Defense Points

1. **How do you prevent price manipulation by clients?**
   - The client only submits dish IDs and quantities. In `orderController.js` and `dataService.js`, the server looks up each item in the database, retrieves the authentic price, and computes `subtotal` and `total` server-side.
2. **How does crowd tracking work without sensors?**
   - It utilizes voluntary community check-ins with duplicate prevention (3-minute rate limiting per student). Reports are aggregated with recent-weight scoring and mapped against historical campus break schedules with a clear transparency disclaimer.
3. **How does admin authorization work?**
   - Protected routes use the `verifyAdmin` middleware to check the `x-admin-token` header against the server's environment secret (`ADMIN_PASSCODE`), returning `401 Unauthorized` or `403 Forbidden` if missing or invalid.
4. **How are out-of-stock items handled?**
   - The administrator can toggle dish availability with one click. When an item is marked `isAvailable: false`, the student UI immediately shows a "Sold Out" badge, disables the add button, and server-side order validation blocks order creation.

---

## 📄 License
Academic Project under ISC License. Created for Backend Development CIA-2 Evaluation.
