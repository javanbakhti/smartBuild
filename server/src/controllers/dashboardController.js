import DoorEvent from "../models/DoorEvent.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const openDoor = asyncHandler(async (req, res) => {
  const { doorId, notes } = req.body;
  if (!doorId) {
    return res.status(400).json({ message: "doorId is required" });
  }

  const event = await DoorEvent.create({
    buildingUid: req.user.buildingUid,
    doorId,
    triggeredBy: req.user._id,
    status: "opened",
    notes,
  });

  res.json({ success: true, event });
});

