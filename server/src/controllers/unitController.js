import Unit from "../models/Unit.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getUnitsByBuilding = asyncHandler(async (req, res) => {
  const units = await Unit.find({ buildingUid: req.params.uid }).sort({
    floor: 1,
    identifier: 1,
  });
  res.json({ units });
});

