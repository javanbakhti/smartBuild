import http from "http";
import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5500;

// Validate required environment variables
const validateEnv = () => {
  const required = ["MONGODB_URI", "MONGO_URI"];
  const hasMongoUri = required.some(key => process.env[key]);
  
  if (!hasMongoUri) {
    console.error("❌ Missing MONGODB_URI or MONGO_URI in environment");
    process.exit(1);
  }
  
  if (!process.env.JWT_SECRET) {
    console.error("❌ Missing JWT_SECRET in environment");
    console.error("   Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"");
    process.exit(1);
  }
  
  console.log("✅ Environment variables validated");
};

const startServer = async () => {
  try {
    validateEnv();
    await connectDB();

    const server = http.createServer(app);
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ SmartEntry7 API running on port ${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health`);
      console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    });
    
    // Handle server errors
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use`);
      } else {
        console.error("❌ Server error:", error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

