# Product Management API with File Upload

This is a Node.js/Express API for product management with Cloudinary file upload functionality.

## Features

- Product CRUD operations
- File upload support using Cloudinary
- Image optimization and transformation
- Authentication and authorization
- Category and subcategory management
- Search and filtering capabilities

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/product-management

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d

# Server Configuration
PORT=5000
NODE_ENV=development

# Client URL for CORS
CLIENT_URL=http://localhost:3000

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Cloudinary Setup

1. Sign up for a free account at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name, API key, and API secret from your dashboard
3. Add them to your `.env` file

### 4. Start the Server

```bash
npm start
```

## API Endpoints

### Products

- `POST /api/products` - Create a new product (with file upload)
- `GET /api/products` - Get all products with filtering
- `GET /api/products/:id` - Get a single product
- `PUT /api/products/:id` - Update a product (with file upload)
- `DELETE /api/products/:id` - Delete a product
- `GET /api/products/search` - Search products

### File Upload

The API now supports file uploads for product images:

- **File Types**: JPG, JPEG, PNG, GIF, WEBP
- **File Size**: Maximum 5MB per file
- **File Count**: Maximum 5 images per product
- **Storage**: Images are stored on Cloudinary with automatic optimization

### Request Format

For creating/updating products with images, use `multipart/form-data`:

```
POST /api/products
Content-Type: multipart/form-data

Fields:
- title: string
- description: string
- subCategory: ObjectId
- variants: JSON string (array of variant objects)
- images: file(s) (optional)
- replaceImages: boolean (for updates, optional)
```

### Example Request

```javascript
const formData = new FormData();
formData.append("title", "iPhone 15 Pro");
formData.append("description", "Latest iPhone with advanced features");
formData.append("subCategory", "64f8a1b2c3d4e5f6a7b8c9d0");
formData.append(
  "variants",
  JSON.stringify([
    {
      ram: "8GB",
      price: 999,
      quantity: 50,
    },
  ])
);
formData.append("images", file1);
formData.append("images", file2);

fetch("/api/products", {
  method: "POST",
  headers: {
    Authorization: "Bearer your_jwt_token",
  },
  body: formData,
});
```

## Image Processing

Images uploaded through the API are automatically:

- Resized to maximum 800x600 pixels
- Optimized for quality and file size
- Converted to the best format (auto)
- Stored in the 'product-images' folder on Cloudinary

## Error Handling

The API includes comprehensive error handling for:

- File size limits
- File type validation
- Upload failures
- Cloudinary errors
- Database validation errors

## Security Features

- File type validation
- File size limits
- Automatic cleanup of uploaded files on errors
- JWT authentication for protected routes
- CORS configuration
- Helmet security headers
