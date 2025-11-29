import mongoose from "mongoose";

const unitSchema = new mongoose.Schema(
  {
    buildingUid: { type: String, required: true, index: true },
    identifier: { type: String, required: true },
    floor: { type: String, required: true },
    label: { type: String },
    isAssigned: { type: Boolean, default: false },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: "Resident" },
  },
  { timestamps: true }
);

unitSchema.index({ buildingUid: 1, identifier: 1 }, { unique: true });

const Unit = mongoose.model("Unit", unitSchema);
export default Unit;

