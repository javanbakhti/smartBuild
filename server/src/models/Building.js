import mongoose from "mongoose";

const buildingSchema = new mongoose.Schema(
  {
    buildingUid: { type: String, required: true, unique: true },
    buildingName: { type: String, required: true },
    buildingAddress: { type: String, required: true },
    managerFullName: { type: String },
    managerNickname: { type: String },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    floorCount: { type: Number, default: 0 },
    unitsPerFloor: { type: Number, default: 0 },
    totalUnits: { type: Number, default: 0 },
    doorCount: { type: Number, default: 0 },
    doors: [
      {
        name: String,
        type: String,
        isLocked: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

const Building = mongoose.model("Building", buildingSchema);
export default Building;

