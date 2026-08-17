# Shree Ganesh Puja Committee - Flutter REST API Documentation

This document describes the REST APIs exposed by the Admin Backend for consumption by the Flutter Mobile Application.

## Base URL
- **Production URL**: `https://ganesh-puja-admin.vercel.app/api`
- **Development URL**: `http://localhost:3000/api`

---

## Standard Response Format

All APIs return consistent JSON payloads wrapped in a standard structure:

### Success Response (`HTTP 200 / 201`)
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

### Error Response (`HTTP 400 / 401 / 403 / 404 / 500`)
```json
{
  "success": false,
  "message": "Validation or error message",
  "errors": null
}
```

---

## Authentication

All protected endpoints accept JWT tokens either in an `Authorization: Bearer <token>` header or an HTTP-Only `auth_token` cookie.

### 1. Login
- **Endpoint**: `POST /api/auth/login`
- **Authentication**: None (Public)
- **Request Body**:
```json
{
  "identifier": "admin@ganeshpuja.org",
  "password": "password123"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "66bc11a2f9...",
      "name": "Debasish Ghosh",
      "email": "admin@ganeshpuja.org",
      "mobile": "9876543210",
      "role": "admin",
      "status": "active",
      "profileImage": "https://images.unsplash.com/..."
    },
    "token": "eyJhbGciOiJIUzI1Ni..."
  }
}
```

### 2. Check Session (`Me`)
- **Endpoint**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Returns logged-in user profile.

### 3. Logout
- **Endpoint**: `POST /api/auth/logout`

---

## Banners API (Flutter Home Screen)

### Get Active Home Banners
- **Endpoint**: `GET /api/banners`
- **Authentication**: None
- **Response**:
```json
{
  "success": true,
  "message": "Banners fetched successfully",
  "data": [
    {
      "_id": "66bc11a2f9...",
      "title": "Shree Ganesh Puja 2026",
      "subtitle": "Jai Shree Ganesh - Annual Grand Celebration",
      "buttonText": "View Schedule",
      "buttonAction": "/announcements",
      "imageUrl": "https://res.cloudinary.com/...",
      "displayOrder": 1,
      "status": "active"
    }
  ]
}
```

---

## Gallery API (Flutter Photos Screen)

### Get Gallery Photos
- **Endpoint**: `GET /api/gallery?category=Puja&page=1&limit=20`
- **Authentication**: Optional
- **Query Params**:
  - `category` (optional): `Ganesh Idol`, `Pandal`, `Decoration`, `Puja`, `Aarti`, `Cultural Program`, `Committee`, `Previous Years`, `Other`
  - `search` (optional): Search query
- **Response**:
```json
{
  "success": true,
  "message": "Gallery photos fetched successfully",
  "data": {
    "gallery": [
      {
        "_id": "66bc...",
        "title": "Pratima Preparation 2026",
        "description": "Artisan hand-crafting idol",
        "category": "Ganesh Idol",
        "imageUrl": "https://res.cloudinary.com/...",
        "uploadedBy": { "name": "Debasish Ghosh" }
      }
    ],
    "pagination": { "total": 1, "page": 1, "totalPages": 1 }
  }
}
```

---

## Announcements API (Flutter Notice Board)

### Get Published Announcements
- **Endpoint**: `GET /api/announcements`
- **Authentication**: Optional
- **Response**:
```json
{
  "success": true,
  "message": "Announcements fetched successfully",
  "data": [
    {
      "_id": "66bc...",
      "title": "Idol Bringing & Shobhajatra Timing",
      "message": "All committee members to gather at 4:00 PM...",
      "priority": "Urgent",
      "publishDate": "2026-08-10T00:00:00.000Z",
      "status": "Published"
    }
  ]
}
```

---

## Financial Dashboard & Chanda APIs

### Get Dashboard Totals
- **Endpoint**: `GET /api/dashboard`
- **Response**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalChanda": 75000,
      "totalExpenses": 48000,
      "currentBalance": 27000,
      "totalMembers": 13,
      "paidMembers": 7,
      "pendingMembers": 6,
      "cashBalance": 15000,
      "upiBankBalance": 12000
    }
  }
}
```

### Get Transactions Ledger
- **Endpoint**: `GET /api/transactions?type=Contribution&page=1&limit=20`

---

## Private Group Chat APIs

### 1. Fetch Chat Messages
- **Endpoint**: `GET /api/chat/messages`

### 2. Send Message
- **Endpoint**: `POST /api/chat/messages`
- **Request Body**:
```json
{
  "content": "Pandal lighting installation complete!",
  "attachmentUrl": "",
  "replyTo": "66bc..."
}
```

### 3. Server-Sent Events (SSE Realtime Stream)
- **Endpoint**: `GET /api/chat/sse`
- **Header**: `Accept: text/event-stream`
