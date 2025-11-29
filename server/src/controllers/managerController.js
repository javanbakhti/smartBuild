import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const signupManager = asyncHandler(async (req, res) => {
  try {
    // Log incoming request for debugging
    console.log("📥 Manager signup request:", {
      body: req.body,
      headers: req.headers['content-type'],
    });

    const {
      fullName,
      nickname,
      email,
      phoneNumber,
      password,
      buildingUid,
      acceptedTerms,
      receiveUpdates,
      receivePromotions,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !buildingUid) {
      const missing = [];
      if (!fullName) missing.push('fullName');
      if (!email) missing.push('email');
      if (!password) missing.push('password');
      if (!buildingUid) missing.push('buildingUid');
      
      console.log("❌ Validation failed - missing fields:", missing);
      return res.status(400).json({ 
        message: `Missing required fields: ${missing.join(', ')}`,
        required: ["fullName", "email", "password", "buildingUid"],
        received: Object.keys(req.body),
        missing,
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate password length
    if (password.length < 6) {
      console.log("❌ Validation failed - password too short:", password.length, "characters");
      return res.status(400).json({ 
        message: `Password must be at least 6 characters (received ${password.length})`,
        field: "password",
        minLength: 6,
        receivedLength: password.length,
      });
    }

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Create new manager
    const manager = await User.create({
      fullName: fullName.trim(),
      nickname: nickname?.trim() || "",
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber?.trim() || "",
      password,
      buildingUid: buildingUid.trim(),
      acceptedTerms: !!acceptedTerms,
      receiveUpdates: !!receiveUpdates,
      receivePromotions: !!receivePromotions,
      role: "manager",
    });

    // Generate token
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is missing in environment variables");
      return res.status(500).json({ 
        message: "Server configuration error. Please contact administrator." 
      });
    }

    const token = generateToken({ id: manager._id.toString(), role: manager.role });
    
    res.status(201).json({
      token,
      manager: {
        id: manager._id.toString(),
        _id: manager._id.toString(),
        fullName: manager.fullName,
        nickname: manager.nickname,
        email: manager.email,
        role: manager.role,
        buildingUid: manager.buildingUid,
      },
    });
  } catch (error) {
    console.error("Signup error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ 
        message: "Email already registered",
        field: Object.keys(error.keyPattern)[0],
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Validation failed",
        errors,
      });
    }

    // Re-throw to be caught by errorHandler middleware
    throw error;
  }
});

