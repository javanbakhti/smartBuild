import Resident from "../models/Resident.js";
import Unit from "../models/Unit.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const ensureSameBuilding = (resident, buildingUid) => {
  if (!resident || resident.buildingUid !== buildingUid) {
    const error = new Error("Resident not found in your building");
    error.statusCode = 404;
    throw error;
  }
};

export const listResidents = asyncHandler(async (req, res) => {
  const residents = await Resident.find({ buildingUid: req.user.buildingUid });
  res.json({ residents });
});
export const createResident = asyncHandler(async (req, res) => {
  const {
    fullName,
    nickname,
    email,
    phoneNumber,
    unitNumber,
    floorNumber,
    kioskDisplayName,
    status = "invited",
    referralCode,
    invitationLink,
    invitationExpirationDate,
    passcode,  // ← از Manager می‌آید
  } = req.body;

  if (!fullName || !email || !unitNumber || !floorNumber) {
    return res.status(400).json({ message: "Missing required resident fields" });
  }

  const existing = await Resident.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "Email already used" });
  }

  // ✔ اینجا passcode را ذخیره می‌کنیم → مدل Resident و hook آن هش می‌کند
  const resident = await Resident.create({
    fullName,
    nickname,
    email,
    phoneNumber,
    unitNumber,
    floorNumber,
    kioskDisplayName: kioskDisplayName || fullName,
    status,
    referralCode,
    invitationLink,
    invitationExpirationDate,
    passcode, // ← بسیار مهم
    managerId: req.user._id,
    buildingUid: req.user.buildingUid,
  });

  await Unit.findOneAndUpdate(
    { buildingUid: req.user.buildingUid, identifier: unitNumber },
    { isAssigned: true, residentId: resident._id, floor: floorNumber },
    { upsert: true }
  );

  res.status(201).json({ resident });
});

export const updateResident = asyncHandler(async (req, res) => {
  const resident = await Resident.findById(req.params.id);
  ensureSameBuilding(resident, req.user.buildingUid);

  const fields = [
    "fullName",
    "nickname",
    "email",
    "phoneNumber",
    "unitNumber",
    "floorNumber",
    "kioskDisplayName",
    "status",
    "referralCode",
    "invitationLink",
    "invitationExpirationDate",
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      resident[field] = req.body[field];
    }
  });

  await resident.save();

  if (req.body.unitNumber) {
    await Unit.findOneAndUpdate(
      { buildingUid: req.user.buildingUid, identifier: req.body.unitNumber },
      {
        isAssigned: true,
        residentId: resident._id,
        floor: req.body.floorNumber || resident.floorNumber,
      },
      { upsert: true }
    );
  }

  res.json({ resident });
});

export const deleteResident = asyncHandler(async (req, res) => {
  const resident = await Resident.findById(req.params.id);
  ensureSameBuilding(resident, req.user.buildingUid);
  await resident.deleteOne();

  await Unit.updateMany(
    { residentId: resident._id },
    { isAssigned: false, residentId: null }
  );

  res.json({ success: true });
});

export const updateResidentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  const resident = await Resident.findById(req.params.id);
  ensureSameBuilding(resident, req.user.buildingUid);
  resident.status = status;
  await resident.save();

  res.json({ resident });
});

export const resetResidentPasscode = asyncHandler(async (req, res) => {
  const resident = await Resident.findById(req.params.id);
  ensureSameBuilding(resident, req.user.buildingUid);

  const newPasscode = Math.floor(100000 + Math.random() * 900000).toString();
  resident.passcode = newPasscode;
  await resident.save();

  res.json({ resident, newPasscode });
});

