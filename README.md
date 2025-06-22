# Product Management API Server

A RESTful API for managing products, categories, subcategories, and user wishlists. Built with Node.js, Express, and MongoDB, with secure authentication and image upload support.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Key Packages & Why They're Used](#key-packages--why-theyre-used)
- [Error Handling & Security](#error-handling--security)

---

## Features

- User authentication (JWT-based)
- Product, category, and subcategory CRUD
- Wishlist management for users
- Image upload and storage via Cloudinary
- Secure, rate-limited, and CORS-enabled API
- Robust error handling and logging

---

## Project Structure

```
.
├── config/           # Configuration files (e.g., Cloudinary)
├── controller/       # Route controllers (business logic)
├── middleware/       # Custom middleware (auth, error handling)
├── model/            # Mongoose models (MongoDB schemas)
├── route/            # Express route definitions
├── index.js          # Main server entry point
├── package.json      # Project metadata and dependencies
```

---

## Installation

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd product-server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

---

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development
PORT=5000
```

---

## Running the Application

Start the server with:

```bash
npm start
```

The server will run on `http://localhost:5000` by default.

---

## API Endpoints

- **Auth:** `/api/auth` (signup, login, logout, get current user)
- **Categories:** `/api/categories` (CRUD, get products by category)
- **Subcategories:** `/api/subcategories` (CRUD, get products by subcategory)
- **Products:** `/api/products` (CRUD, search, image upload)
- **Wishlist:** `/api/wishlist` (add/remove/clear/check products)
- **Health Check:** `/api/health`

See each route file in `route/` for detailed endpoint info.

---

## Key Packages & Why They're Used

- **express**: Web framework for building the API.
- **mongoose**: ODM for MongoDB, handles schema and data validation.
- **dotenv**: Loads environment variables from `.env`.
- **cors**: Enables Cross-Origin Resource Sharing for frontend-backend communication.
- **helmet**: Sets secure HTTP headers to protect against common vulnerabilities.
- **morgan**: HTTP request logger for development/debugging.
- **jsonwebtoken**: Implements JWT-based authentication.
- **bcryptjs**: Secure password hashing for user credentials.
- **multer**: Handles multipart/form-data for file uploads.
- **cloudinary** & **multer-storage-cloudinary**: Store and manage images in the cloud.
- **form-data**: Handles form data, especially for file uploads.

---

## Error Handling & Security

- **Custom error handler**: Centralized error responses for validation, authentication, and server errors.
- **Rate limiting**: Prevents brute-force attacks on authentication endpoints.
- **CORS policy**: Restricts API access to allowed origins.
- **Helmet**: Adds security headers.
- **JWT authentication**: Protects private routes and ensures only authorized users can access sensitive endpoints.

---

## Additional Notes

- All image uploads are stored in Cloudinary under the `product-images` folder.
- The API is modular and easy to extend with new features or endpoints.
- For production, ensure all environment variables are set securely.

---

**For more details, see the code in each directory and the comments in the route files.**
