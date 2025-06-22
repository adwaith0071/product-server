// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    statusCode = 400;
  }

  // Multer error
  if (err.code === "LIMIT_FILE_SIZE") {
    const message = "File too large. Maximum size is 5MB";
    statusCode = 400;
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    const message = "Too many files. Maximum is 5 files";
    statusCode = 400;
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    const message = "Unexpected file field";
    statusCode = 400;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    statusCode = 401;
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

// Handle unhandled promise rejections
const handleUnhandledRejections = (server) => {
  process.on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
};

// Handle uncaught exceptions
const handleUncaughtExceptions = () => {
  process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server due to uncaught exception");
    process.exit(1);
  });
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = {
  notFound,
  errorHandler,
  handleUnhandledRejections,
  handleUncaughtExceptions,
};
