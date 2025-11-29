// import Resident from "../models/Resident.js";
// import Building from "../models/Building.js";
// import { generateToken } from "../utils/generateToken.js";
// import { asyncHandler } from "../utils/asyncHandler.js";

// export const residentSignup = asyncHandler(async (req, res) => {
//   const {
//     fullName,
//     nickname,
//     email,
//     phoneNumber,
//     password,
//     referralCode,
//     unitNumber,
//     buildingUid,
//     acceptedTerms,
//   } = req.body;

//   if (
//     !fullName ||
//     !email ||
//     !password ||
//     !unitNumber ||
//     !buildingUid ||
//     !acceptedTerms
//   ) {
//     return res.status(400).json({ message: "Missing required fields" });
//   }

//   const building = await Building.findOne({ buildingUid });
//   if (!building) {
//     return res.status(404).json({ message: "Building not found" });
//   }

//   const existing = await Resident.findOne({ email });
//   if (existing) {
//     return res.status(409).json({ message: "Resident already registered" });
//   }

//   const resident = await Resident.create({
//     fullName,
//     nickname,
//     email,
//     phoneNumber,
//     passcode: password,
//     referralCode,
//     unitNumber,
//     floorNumber: unitNumber?.slice(0, 1) || "1",
//     buildingUid,
//     status: "active",
//     acceptedTerms: true,
//   });

//   const token = generateToken({ id: resident._id, role: "resident" });
//   res.status(201).json({
//     token,
//     resident,
//   });
// });

// export const residentLogin = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ message: "Email and password required" });
//   }

//   const resident = await Resident.findOne({ email });
//   if (!resident) {
//     return res.status(401).json({ message: "Invalid credentials" });
//   }

//   const isMatch = await resident.validatePasscode(password);
//   if (!isMatch) {
//     return res.status(401).json({ message: "Invalid credentials" });
//   }

//   const token = generateToken({ id: resident._id, role: "resident" });
//   res.json({ token, resident });
// });

import Resident from "../models/Resident.js";
import Building from "../models/Building.js";
import { generateToken } from "../utils/generateToken.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// 🟢 Signup Resident
export const residentSignup = asyncHandler(async (req, res) => {
  const {
    fullName,
    nickname,
    email,
    phoneNumber,
    password,   // ← این همان passcode است
    referralCode,
    unitNumber,
    buildingUid,
    acceptedTerms,
  } = req.body;

  // اعتبارسنجی ورودی‌ها
  if (
    !fullName ||
    !email ||
    !password ||          // ← passcode اجباری
    !unitNumber ||
    !buildingUid ||
    !acceptedTerms
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // بررسی وجود ساختمان
  const building = await Building.findOne({ buildingUid });
  if (!building) {
    return res.status(404).json({ message: "Building not found" });
  }

  // بررسی وجود رزیدنت با ایمیل تکراری
  const existing = await Resident.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "Resident already registered" });
  }

  // ایجاد رزیدنت جدید
  const resident = await Resident.create({
    fullName,
    nickname,
    email,
    phoneNumber,
    passcode: password,  // ✔ ذخیره صحیح passcode (هش می‌شود در مدل)
    referralCode,
    unitNumber,
    floorNumber: unitNumber?.slice(0, 1) || "1",
    buildingUid,
    status: "active",
    acceptedTerms: true,
  });

  // تولید JWT
  const token = generateToken({ id: resident._id, role: "resident" });

  res.status(201).json({
    token,
    resident,
  });
});

// 🟢 Login Resident
export const residentLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // اعتبارسنجی ورودی‌ها
  if (!email || !password) {
    return res.status(400).json({ message: "Email and passcode required" });
  }

  // پیدا کردن رزیدنت همراه با passcode هش شده
  const resident = await Resident.findOne({ email }).select("+passcode");
  if (!resident) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // بررسی passcode
  const isMatch = await resident.validatePasscode(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // تولید JWT
  const token = generateToken({ id: resident._id, role: "resident" });

  // برگرداندن payload کامل
  res.json({
    token,
    resident: {
      id: resident._id,
      fullName: resident.fullName,
      nickname: resident.nickname,
      email: resident.email,
      phoneNumber: resident.phoneNumber,
      unitNumber: resident.unitNumber,
      floorNumber: resident.floorNumber,
      buildingUid: resident.buildingUid,
      kioskDisplayName: resident.kioskDisplayName,
      status: resident.status,
    },
  });
});

export const activateResident = asyncHandler(async (req, res) => {
  const { referralCode, passcode } = req.body;

  if (!referralCode || !passcode) {
    return res.status(400).json({ message: "Referral code and passcode are required" });
  }

  // پیدا کردن رزیدنت با referralCode
  const resident = await Resident.findOne({ referralCode }).select("+passcode");
  if (!resident) {
    return res.status(404).json({ message: "Invalid referral code" });
  }

  // اگر قبلاً فعال شده بود
  if (resident.status === "active") {
    return res.status(400).json({ message: "Resident already active" });
  }

  // ذخیره passcode جدید و تغییر وضعیت
  resident.passcode = passcode;
  resident.status = "active";
  await resident.save();

  // تولید JWT
  const token = generateToken({ id: resident._id, role: "resident" });

  res.json({
    token,
    resident: {
      id: resident._id,
      fullName: resident.fullName,
      email: resident.email,
      unitNumber: resident.unitNumber,
      floorNumber: resident.floorNumber,
      buildingUid: resident.buildingUid,
      kioskDisplayName: resident.kioskDisplayName,
      status: resident.status,
    },
  });});
