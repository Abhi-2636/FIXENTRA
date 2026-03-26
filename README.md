# Fixentra Backend - "Your Home, Our Expertise" 🏠🔧

Fixentra is a complete home services platform backend built on the Node.js, Express, and MongoDB (Mongoose) stack, tailored for the Indian market. It handles authentication, service categorization, booking management, and provider reviews.

## Features ✨

- **MVC Architecture:** Clean, scalable, and industry-standard folder structure.
- **JWT Authentication:** Secure login & registration with role-based access control (Admin, Provider, User).
- **Service Management:** Full CRUD for service categories like Maid, Electrician, Plumber, Carpenter, etc.
- **Booking Engine:** Users can book services with specific dates and time slots.
- **Provider Dashboard:** Providers can see assigned jobs, accept/reject bookings, and update job status.
- **Admin Panel:** Complete overview of all users, services, and bookings with provider assignment capabilities.
- **Double Booking Prevention:** Logical checks to ensure a provider isn't booked twice for the same slot.

## Project Structure 📂

```
FIXENTRA/
├── config/             # Database & Config
├── controllers/        # Business Logic
├── middleware/         # Auth & Validation
├── models/             # Database Schemas
├── routes/             # API Endpoints
├── .env.example        # Env Template
├── server.js           # Entry Point
└── package.json        # Dependencies
```

## Getting Started 🚀

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v14+)
- [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas)

### 2. Installation
Clone the repository and install dependencies:

```bash
cd FIXENTRA
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and copy the contents from `.env.example`. Fill in your MongoDB connection string and JWT secret.

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d
```

### 4. Run the Server
```bash
# Start in development mode
npm start
```

## API Documentation 📝

### Auth Routes (`/api/auth`)
- `POST /register`: Register a new user/provider/admin.
- `POST /login`: Login to receive a JWT token.

### Service Routes (`/api/services`)
- `GET /`: List all available services (Public).
- `POST /`: Create a new service (Admin only).
- `PATCH /:id`: Update service details (Admin only).
- `DELETE /:id`: Delete a service (Admin only).

### Booking Routes (`/api/bookings`)
- `POST /`: Book a service (User).
- `GET /history`: View user's past and upcoming bookings (User).
- `GET /jobs`: View assigned jobs (Provider).
- `PATCH /jobs/:id`: Update job status (Provider - accepted, completed).
- `GET /`: View all bookings in the system (Admin).
- `PATCH /:id/assign`: Assign a provider to a booking (Admin).

### Review Routes (`/api/reviews`)
- `POST /`: Submit feedback for a provider (User).
- `GET /providers/:providerId`: View reviews for a specific provider (Public).

## Sample Postman Requests 📬

### 1. Register User
**Method:** `POST`
**URL:** `{{BASE_URL}}/api/auth/register`
**Body:**
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

### 2. Login
**Method:** `POST`
**URL:** `{{BASE_URL}}/api/auth/login`
**Body:**
```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

### 3. Create Service (Admin)
**Method:** `POST`
**URL:** `{{BASE_URL}}/api/services`
**Header:** `Authorization: Bearer <ADMIN_TOKEN>`
**Body:**
```json
{
  "name": "Deep Apartment Cleaning",
  "category": "cleaning",
  "price": 3499,
  "description": "Full apartment deep cleaning including bathrooms and kitchen."
}
```

### 4. Create Booking
**Method:** `POST`
**URL:** `{{BASE_URL}}/api/bookings`
**Header:** `Authorization: Bearer <USER_TOKEN>`
**Body:**
```json
{
  "serviceId": "<SERVICE_ID>",
  "address": "456 Side St, Queens",
  "date": "2023-11-25",
  "timeSlot": "10:00 AM - 12:00 PM"
}
```

## Technologies Used 🛠️
- **Node.js**
- **Express.js**
- **MongoDB & Mongoose**
- **JWT (JsonWebToken)**
- **Bcrypt.js**
- **Morgan & CORS**
