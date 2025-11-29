import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const residentSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    nickname: { type: String },
    email: { type: String, required: true, lowercase: true, unique: true },
    phoneNumber: { type: String },
    unitNumber: { type: String, required: true },
    floorNumber: { type: String },
    kioskDisplayName: { type: String },
    status: {
      type: String,
      enum: ["invited", "active", "inactive", "pending"],
      default: "invited",
    },
    passcode: { type: String },
    referralCode: { type: String },
    invitationLink: { type: String },
    invitationExpirationDate: { type: Date },
    buildingUid: { type: String, required: true },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    acceptedTerms: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 🔐 Hash passcode before saving (fixed version)
residentSchema.pre("save", async function () {
  // اگر پس‌کد تغییر نکرده یا خالی است، هیچ کاری انجام نده
  if (!this.isModified("passcode") || !this.passcode) return;

  const salt = await bcrypt.genSalt(10);
  this.passcode = await bcrypt.hash(this.passcode, salt);
});

// 🔑 Validate passcode
residentSchema.methods.validatePasscode = function validatePasscode(candidate) {
  if (!this.passcode) return false;
  return bcrypt.compare(candidate, this.passcode);
};

const Resident = mongoose.model("Resident", residentSchema);
export default Resident;
