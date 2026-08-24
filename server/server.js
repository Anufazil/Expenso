require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

// Connect to MongoDB
connectDB();

const app = express();

// --------------------------------------------------
// CORS Configuration
// --------------------------------------------------

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://expenso-taupe.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header
    // (Postman, server-to-server requests, health checks, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
};

app.use(cors(corsOptions));

// Explicitly handle preflight requests
app.options("*", cors(corsOptions));

// --------------------------------------------------
// Body Parsing Middleware
// --------------------------------------------------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------------------------------------
// Routes
// --------------------------------------------------

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

// --------------------------------------------------
// Health Check
// --------------------------------------------------

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Expense Tracker API is running",
  });
});

// --------------------------------------------------
// 404 Handler
// --------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// --------------------------------------------------
// Global Error Handler
// --------------------------------------------------

app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      message: "CORS origin not allowed",
    });
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// --------------------------------------------------
// Start Server
// --------------------------------------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Allowed CORS origins:");
  allowedOrigins.forEach((origin) => {
    console.log(`- ${origin}`);
  });
});