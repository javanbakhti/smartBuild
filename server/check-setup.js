#!/usr/bin/env node

/**
 * Quick diagnostic script to check if your backend is properly configured
 * Run: node check-setup.js
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

console.log("🔍 Checking SmartEntry7 Backend Setup...\n");

let hasErrors = false;

// Check environment variables
console.log("1. Environment Variables:");
const checks = [
  { name: "PORT", value: process.env.PORT || "5500 (default)", required: false },
  { name: "MONGODB_URI", value: process.env.MONGODB_URI ? "✅ Set" : "❌ Missing", required: true },
  { name: "MONGO_URI", value: process.env.MONGO_URI ? "✅ Set (alternative)" : "Not set", required: false },
  { name: "JWT_SECRET", value: process.env.JWT_SECRET ? "✅ Set" : "❌ Missing", required: true },
  { name: "NODE_ENV", value: process.env.NODE_ENV || "development (default)", required: false },
];

checks.forEach(check => {
  const status = check.required && !process.env[check.name] && !process.env.MONGO_URI && check.name === "MONGODB_URI"
    ? "❌"
    : check.required && !process.env[check.name] && check.name === "JWT_SECRET"
    ? "❌"
    : "✅";
  console.log(`   ${status} ${check.name}: ${check.value}`);
  if (check.required && !process.env[check.name] && check.name !== "MONGODB_URI") {
    hasErrors = true;
  }
});

// Check MongoDB URI
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!mongoUri) {
  console.log("\n❌ No MongoDB URI found. Set MONGODB_URI or MONGO_URI in .env");
  hasErrors = true;
} else {
  console.log("\n2. Testing MongoDB Connection:");
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log("   ✅ MongoDB connection successful");
    await mongoose.disconnect();
  } catch (error) {
    console.log("   ❌ MongoDB connection failed:", error.message);
    console.log("   💡 Make sure MongoDB is running:");
    console.log("      - Docker: cd server && docker compose up -d");
    console.log("      - Or: sudo systemctl start mongod");
    hasErrors = true;
  }
}

// Check JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.log("\n3. JWT_SECRET:");
  console.log("   ❌ JWT_SECRET is required");
  console.log("   💡 Generate one with:");
  console.log("      node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"");
  hasErrors = true;
} else if (process.env.JWT_SECRET.length < 32) {
  console.log("\n3. JWT_SECRET:");
  console.log("   ⚠️  JWT_SECRET is too short (recommended: 32+ characters)");
}

console.log("\n" + "=".repeat(50));
if (hasErrors) {
  console.log("❌ Setup incomplete. Please fix the errors above.");
  process.exit(1);
} else {
  console.log("✅ All checks passed! Your backend should be ready to run.");
  console.log("\n   Start server with: npm run dev");
  process.exit(0);
}

