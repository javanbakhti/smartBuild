import mongoose from "mongoose";

const kioskSettingSchema = new mongoose.Schema(
  {
    buildingUid: { type: String, required: true, unique: true },
    kioskUsername: { type: String, default: "kiosk_admin" },
    kioskPassword: { type: String, default: "password123" },
    ipWhitelist: { type: [String], default: [] },
    enable2FA: { type: Boolean, default: false },
    kioskUrl: { type: String },
    accessLogs: [
      {
        timestamp: { type: Date, default: Date.now },
        ip: String,
        status: String,
        user: String,
      },
    ],
  },
  { timestamps: true }
);

const KioskSetting = mongoose.model("KioskSetting", kioskSettingSchema);
export default KioskSetting;

