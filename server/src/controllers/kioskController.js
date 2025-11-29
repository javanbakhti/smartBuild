import KioskSetting from "../models/KioskSetting.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Resident from "../models/Resident.js";

const getTargetBuildingUid = (req) =>
  req.query.buildingUid || req.user?.buildingUid;

export const getKioskSettings = asyncHandler(async (req, res) => {
  const buildingUid = getTargetBuildingUid(req);

  const query = buildingUid ? { buildingUid } : {};
  let settings = await KioskSetting.findOne(query);

  if (!settings && buildingUid) {
    settings = await KioskSetting.create({ buildingUid });
  }

  res.json({ settings });
});

export const saveKioskSettings = asyncHandler(async (req, res) => {
  const buildingUid = getTargetBuildingUid(req);
  if (!buildingUid) {
    return res
      .status(400)
      .json({ message: "Building UID is required to save kiosk settings" });
  }

  const settings = await KioskSetting.findOneAndUpdate(
    { buildingUid },
    { buildingUid, ...req.body },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json({ settings });
});
export const getKioskResidents = asyncHandler(async (req, res) => {
  const buildingUid = req.query.buildingUid;

  if (!buildingUid) {
    return res.status(400).json({ message: "Building UID is required" });
  }

  const residents = await Resident.find({ 
    buildingUid,
    status: { $in: ["active", "invited"] }
  })
    .select("fullName kioskDisplayName unitNumber floorNumber status")
    .sort({ floorNumber: 1, unitNumber: 1 });

  res.json({ residents });
});
