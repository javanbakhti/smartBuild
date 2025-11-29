import Building from "../models/Building.js";
import Unit from "../models/Unit.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getBuilding = asyncHandler(async (req, res) => {
  const building = await Building.findOne({ buildingUid: req.params.uid });
  if (!building) {
    return res.status(404).json({ message: "Building not found" });
  }

  res.json({ building });
});

const expandUnits = ({ buildingUid, floorCount, unitsPerFloor, units }) => {
  if (Array.isArray(units) && units.length > 0) {
    return units.map((unit) => ({
      buildingUid,
      identifier: String(unit.identifier),
      floor: String(unit.floor),
      label: unit.label || "",
      isAssigned: !!unit.isAssigned,
    }));
  }

  const result = [];
  const useThreeDigits = floorCount >= 10;
  for (let floor = 1; floor <= floorCount; floor += 1) {
    for (let unitIdx = 1; unitIdx <= unitsPerFloor; unitIdx += 1) {
      let identifier = `${floor}${unitIdx}`;
      if (useThreeDigits) {
        identifier =
          unitIdx >= 10 ? `${floor}${unitIdx}` : `${floor}0${unitIdx}`;
      }

      result.push({
        buildingUid,
        identifier,
        floor: String(floor),
        label: "",
        isAssigned: false,
      });
    }
  }
  return result;
};

export const saveBuilding = asyncHandler(async (req, res) => {
  const {
    buildingUid: bodyBuildingUid,
    buildingName,
    buildingAddress,
    managerFullName,
    managerNickname,
    floorCount,
    unitsPerFloor,
    totalUnits,
    doorCount,
    doors = [],
    units = [],
  } = req.body;

  const buildingUid = bodyBuildingUid || req.user?.buildingUid;
  if (!buildingUid || !buildingName || !buildingAddress) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const building = await Building.findOneAndUpdate(
    { buildingUid },
    {
      buildingUid,
      buildingName,
      buildingAddress,
      managerFullName,
      managerNickname,
      managerId: req.user?._id,
      floorCount,
      unitsPerFloor,
      totalUnits,
      doorCount,
      doors,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  if (floorCount && unitsPerFloor) {
    const docs = expandUnits({
      buildingUid,
      floorCount,
      unitsPerFloor,
      units,
    });
    await Unit.deleteMany({ buildingUid });
    await Unit.insertMany(docs);
  }

  res.status(201).json({ building });
});

