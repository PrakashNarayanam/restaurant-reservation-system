# Restaurant Reservation Management System (TableEase)

A full-stack, responsive Restaurant Reservation Management System featuring custom role-based access control (RBAC) and intelligent best-fit auto-table assignment.

## Tech Stack
- **Frontend:** React (Vite)
- **Backend:** Node.js with Express
- **Database:** MongoDB (using Mongoose, with auto-spinning `mongodb-memory-server` in-memory fallback for a zero-dependency setup)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs password hashing
- **Styling:** Premium Vanilla CSS (dark-mode glassmorphism)

---

## Availability & Conflict Prevention Logic

The core logic of the system ensures zero overlapping double-bookings and optimal restaurant capacity utilization:

1. **Guest Capacity Validation:**
   The system queries all configured tables and filters out any table whose `capacity` is less than the requested number of `guests` (i.e. `table.capacity >= guests`).

2. **Double-Booking Check:**
   The backend retrieves all confirmed active bookings (`status: 'confirmed'`) matching the requested reservation `date` and `timeSlot`. The tables assigned to these active bookings are marked as occupied.

3. **Optimal Best-Fit Table Selection:**
   - From the remaining available and eligible tables, the system sorts them by seating capacity in ascending order.
   - It automatically assigns the table with the **smallest capacity** that satisfies the guest count. For example, if a party of 2 requests a booking, and Table A (capacity 2) and Table B (capacity 4) are both available, it assigns Table A. This leaves Table B open for larger groups, maximizing restaurant seating efficiency.
   - If no tables fit the capacity or if all matching tables are booked, it rejects the booking with a clear `400 Bad Request` code and a friendly error message.

---

## Role-Based Access Control (RBAC)

Two distinct roles are supported:
- **Customer:**
  - Can create reservations (tables are auto-assigned).
  - Can view a list of their own past and upcoming reservations.
  - Can cancel their own bookings (updates status to `'cancelled'`).
- **Administrator (Admin):**
  - Full visibility: view all bookings made by any user.
  - Query reservations dynamically by date.
  - Modify, update, or cancel any booking.
  - Table Manager: Seed, configure, view, and delete dining tables.

---

## Quick Start & Local Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### 1. Configure Environment
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=
JWT_SECRET=supersecretkeyrestaurant123!@#
NODE_ENV=development
```
*Note: Leave `MONGODB_URI` blank to automatically spin up a self-contained in-memory MongoDB instance on server start.*

### 2. Install & Start Backend
```bash
cd backend
npm install
npm run dev
```

### 3. Install & Start Frontend
Open a new terminal window:
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
The React frontend will be available at `http://localhost:5173`.

---

## Demo Accounts

For ease of testing, the system auto-seeds the following credentials on startup:

- **Customer:**
  - Username: `customer`
  - Password: `customerpassword123`
- **Admin:**
  - Username: `admin`
  - Password: `adminpassword123`

---

## Known Limitations & Future Improvements
1. **Dynamic Seating Merging:** The current version assigns parties to single tables. In a future iteration, the system could dynamically merge adjacent tables (e.g., combining two 2-seaters to form a 4-seater) if single larger tables are unavailable.
2. **Real-time Synchronization:** Adding WebSockets (socket.io) would allow real-time dashboard updates for both customers and admins when a table is occupied or freed.
