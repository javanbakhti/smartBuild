import crypto from "crypto";
import AdminInvite from "../models/AdminInvite.js";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createAdminInvite = asyncHandler(async (req, res) => {
  const { email, role = "admin" } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const token = crypto.randomBytes(20).toString("hex");
  const invite = await AdminInvite.create({
    token,
    email,
    buildingUid: req.user.buildingUid,
    role,
    invitedBy: req.user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  res.status(201).json({
    invite,
    link: `${req.headers.origin || req.get("origin") || ""}/signup/admin?token=${token}`,
  });
});

export const validateAdminInvite = asyncHandler(async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  const invite = await AdminInvite.findOne({ token });
  if (!invite || invite.status !== "pending" || invite.expiresAt < new Date()) {
    return res.status(404).json({ message: "Invitation not found or expired" });
  }

  res.json({ invitation: invite });
});

export const signupAdminViaInvite = asyncHandler(async (req, res) => {
  const { token, fullName, password, receiveUpdates, receivePromotions } =
    req.body;

  if (!token || !fullName || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const invite = await AdminInvite.findOne({ token });
  if (!invite || invite.status !== "pending" || invite.expiresAt < new Date()) {
    return res
      .status(400)
      .json({ message: "Invitation token invalid or expired" });
  }

  const existing = await User.findOne({ email: invite.email });
  if (existing) {
    return res.status(409).json({ message: "Account already exists" });
  }

  const admin = await User.create({
    fullName,
    email: invite.email,
    password,
    role: invite.role || "admin",
    buildingUid: invite.buildingUid,
    acceptedTerms: true,
    receiveUpdates: !!receiveUpdates,
    receivePromotions: !!receivePromotions,
  });

  invite.status = "accepted";
  await invite.save();

  const tokenResponse = generateToken({ id: admin._id, role: admin.role });
  res.status(201).json({
    admin: {
      id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role,
      buildingUid: admin.buildingUid,
    },
    backendToken: tokenResponse,
  });
});

