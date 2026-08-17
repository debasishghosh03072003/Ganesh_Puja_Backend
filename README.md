# Shree Ganesh Puja Committee Management System - Admin Panel & Backend API

A private, production-ready Admin Panel and API backend built with Next.js App Router, TypeScript, Tailwind CSS, MongoDB, Mongoose, and Cloudinary to digitally manage Ganesh Puja finances, 13 committee members, chanda collection, vendor expenses, home banners, gallery archives, announcements, tasks, private committee group chat, and financial reports.

---

## Key Features

- **Festive & Professional Design System**: Maroon & Gold theme tailored for Ganesh Puja.
- **Financial Dashboard**: Auto-calculates `Current Balance = Total Contributions - Total Expenses`, Cash reserves vs UPI/Bank balances, Paid vs Pending member count, Recharts income & expense visual charts, and recent activity logs.
- **13 Committee Members Directory**: CRUD management for exactly 13 committee members with profile views, contribution histories, and out-of-pocket expense tracking.
- **Chanda / Contribution Ledger**: Collection records with Cash, UPI, Bank Transfer methods.
- **Expense Tracking**: Vendor bill logging with "Paid By" member tracking and receipt image uploads.
- **Unified Transactions**: Full search & filterable ledger for all income and expense items with CSV export.
- **Banners & Gallery**: Cloudinary image upload for home screen banners & photo gallery categories.
- **Announcements & Task Assignments**: Priority-based notice board and task assignments for festival duties.
- **Private Committee Chat**: Encrypted group chat for the 13 members with message pinning, replies, and Server-Sent Events (SSE) real-time streaming.
- **Flutter Mobile API Ready**: REST APIs with standardized JSON envelopes (`{ success, message, data }`).

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB Atlas + Mongoose ORM
- **Auth**: JWT stored in secure HTTP-Only Cookies + bcryptjs
- **Media Upload**: Cloudinary SDK (with resilient base64 fallback)
- **Charts**: Recharts
- **Icons**: Lucide React

---

## Quick Start (Local Setup)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

3. **Seed Database**:
   Populate 13 committee members and sample demo data:
   ```bash
   npm run seed
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Login Credentials**:
   - **Email**: `admin@ganeshpuja.org`
   - **Password**: `password123`

---

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── (auth)/login/                # Login page
│   │   ├── (dashboard)/                 # Protected Admin pages
│   │   └── api/                         # Backend REST Route Handlers
│   ├── components/                      # Reusable UI & Layout components
│   ├── lib/                             # DB, Auth, Cloudinary, API helpers
│   └── models/                          # Mongoose Schemas
├── scripts/seed.ts                      # Database seed script
├── API_DOCUMENTATION.md                 # Flutter Mobile API specification
├── DEPLOYMENT.md                        # Vercel & MongoDB deployment guide
```
