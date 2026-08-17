# Deployment Guide - Vercel & MongoDB Atlas

This document walks through setting up MongoDB Atlas, Cloudinary, and deploying the Shree Ganesh Puja Admin Panel to Vercel.

---

## 1. MongoDB Atlas Database Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in / create an account.
2. Create a new **M0 Free Cluster**.
3. Under **Database Access**, create a database user (e.g. `puja_admin`) and generate a password.
4. Under **Network Access**, add IP address `0.0.0.0/0` to allow Vercel serverless functions to connect.
5. Click **Connect** -> **Drivers** and copy your connection string:
   ```
   mongodb+srv://puja_admin:<password>@cluster0.mongodb.net/ganesh_puja_db?retryWrites=true&w=majority
   ```

---

## 2. Cloudinary Media Upload Setup
1. Go to [Cloudinary Console](https://cloudinary.com/) and create a free account.
2. Note down your credentials from the Dashboard:
   - **Cloud Name** (`CLOUDINARY_CLOUD_NAME`)
   - **API Key** (`CLOUDINARY_API_KEY`)
   - **API Secret** (`CLOUDINARY_API_SECRET`)

---

## 3. Local Database Seeding
To initialize the 13 committee member accounts and demo data:
1. Edit `.env.local` and add your `MONGODB_URI`.
2. Run the seed script:
   ```bash
   npm run seed
   ```
3. Default admin credentials:
   - **Email**: `admin@ganeshpuja.org`
   - **Password**: `password123`

---

## 4. Deploying to Vercel
1. Push your repository to **GitHub**.
2. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. Expand **Environment Variables** and add:
   - `MONGODB_URI`: `mongodb+srv://puja_admin:<password>@cluster0.mongodb.net/ganesh_puja_db?retryWrites=true&w=majority`
   - `JWT_SECRET`: `your_secure_random_production_jwt_secret_key_2026`
   - `CLOUDINARY_CLOUD_NAME`: `your_cloudinary_cloud_name`
   - `CLOUDINARY_API_KEY`: `your_cloudinary_api_key`
   - `CLOUDINARY_API_SECRET`: `your_cloudinary_api_secret`
   - `NEXT_PUBLIC_API_BASE_URL`: `https://ganesh-puja-admin.vercel.app`
5. Click **Deploy**.

---

## 5. Flutter Mobile App Configuration
In your Flutter app, set the Base API URL:
```dart
const String apiBaseUrl = "https://ganesh-puja-admin.vercel.app/api";
```
