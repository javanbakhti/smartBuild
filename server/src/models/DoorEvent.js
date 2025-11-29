import mongoose from "mongoose";

const doorEventSchema = new mongoose.Schema(
  {
    buildingUid: { type: String, required: true },
    doorId: { type: String, required: true },
    triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["opened", "failed"], default: "opened" },
    notes: String,
  },
  { timestamps: true }
);

const DoorEvent = mongoose.model("DoorEvent", doorEventSchema);
export default DoorEvent;

