import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";
import managerResidentRoutes from "./routes/managerResidentRoutes.js";
import residentRoutes from "./routes/residentRoutes.js";
import buildingRoutes from "./routes/buildingRoutes.js";
import unitRoutes from "./routes/unitRoutes.js";
import kioskRoutes from "./routes/kioskRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5000",
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://192.168.0.199:3000",
      "http://38.129.27.9",
      "http://ras.innonex.ca",
      "http://ras.innonex.ca/api",
    ];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(null, true);
      }
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

    allowedHeaders: [
  "Content-Type",
  "Authorization",
  "Cache-Control",
  "Pragma",
  "Expires",
  "X-Requested-With",
  "Accept",
  "User-Agent"
],

  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Custom morgan format to log request body for POST requests
morgan.token('body', (req) => {
  if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') && req.body) {
    try {
      return JSON.stringify(req.body).substring(0, 200);
    } catch {
      return '[unable to stringify body]';
    }
  }
  return '';
});

app.use(morgan(":method :url :status :response-time ms - :body"));

app.get("/", (_req, res) => {
  res.json({ 
    message: "SmartEntry7 API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      docs: "See README.md for API documentation"
    }
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasMongoUri: !!(process.env.MONGODB_URI || process.env.MONGO_URI),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/managers", managerRoutes);
app.use("/api/manager", managerResidentRoutes);
app.use("/api/residents", residentRoutes);
app.use("/api/building", buildingRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/kiosk", kioskRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

