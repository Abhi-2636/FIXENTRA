# Fixentra Backend

<div align="center">

**"Your Home, Our Expertise"**

A Node.js + Express + MongoDB (Mongoose) backend for a home-services platform, tailored for the Indian market.

</div>

---

## Quick links

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API overview](#api-overview)
- [Sample requests](#sample-requests)
- [Contributing](#contributing)

---

## Features

| Area | What you get |
|---|---|
| Architecture | MVC folder structure for clean separation of concerns |
| Auth | JWT-based auth with role-based access (Admin / Provider / User) |
| Services | CRUD for service categories (Maid, Electrician, Plumber, Carpenter, etc.) |
| Bookings | Book by date + time slot with basic slot validation |
| Provider dashboard | View assigned jobs, accept/reject, update job status |
| Admin panel | Manage users/services/bookings + assign providers |
| Safety | Double-booking prevention for the same provider + time slot |

---

## Tech stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Security:** JWT, bcrypt
- **Middleware / tooling:** Morgan, CORS

---

## Project structure

```text
FIXENTRA/
├── config/             # Database & configuration
├── controllers/        # Business logic
├── middleware/         # Auth & validation
├── models/             # Database schemas
├── routes/             # API endpoints
├── .env.example        # Environment template
├── server.js           # Entry point
└── package.json        # Dependencies
```

---

## Getting started

### 1) Prerequisites

- [Node.js](https://nodejs.org/) (v14+)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or local MongoDB)

### 2) Install

```bash
cd FIXENTRA
npm install
```

### 3) Run

```bash
npm start
```

---

## Environment variables

Create a `.env` file in the project root and copy values from `.env.example`.

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d
```

---

## API overview

### Auth (`/api/auth`)

- `POST /register` — Register a new user/provider/admin
- `POST /login` — Login and receive a JWT

### Services (`/api/services`)

- `GET /` — List all available services (public)
- `POST /` — Create a new service (admin only)
- `PATCH /:id` — Update service details (admin only)
- `DELETE /:id` — Delete service (admin only)

### Bookings (`/api/bookings`)

- `POST /` — Book a service (user)
- `GET /history` — User booking history (user)
- `GET /jobs` — Assigned jobs (provider)
- `PATCH /jobs/:id` — Update job status (provider)
- `GET /` — View all bookings (admin)
- `PATCH /:id/assign` — Assign provider to booking (admin)

### Reviews (`/api/reviews`)

- `POST /` — Submit provider feedback (user)
- `GET /providers/:providerId` — Provider reviews (public)

---

## Sample requests

### Register (User)

**POST** `{{BASE_URL}}/api/auth/register`

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "phone": "1234567890",
  "address": "123 Main St, New York",
  "role": "user"
}
```

### Login

**POST** `{{BASE_URL}}/api/auth/login`

```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

### Create service (Admin)

**POST** `{{BASE_URL}}/api/services`

Header: `Authorization: Bearer <ADMIN_TOKEN>`

```json
{
  "name": "Deep Apartment Cleaning",
  "category": "cleaning",
  "price": 3499,
  "description": "Full apartment deep cleaning including bathrooms and kitchen."
}
```

### Create booking

**POST** `{{BASE_URL}}/api/bookings`

Header: `Authorization: Bearer <USER_TOKEN>`

```json
{
  "serviceId": "<SERVICE_ID>",
  "address": "456 Side St, Queens",
  "date": "2026-03-28",
  "timeSlot": "10:00 AM - 12:00 PM"
}
```

---

## Contributing

Contributions are welcome.

- Fork the repo
- Create a feature branch: `git checkout -b feature/my-change`
- Commit: `git commit -m "Add my change"`
- Push: `git push origin feature/my-change`
- Open a Pull Request