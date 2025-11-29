import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    nickname: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    phoneNumber: { type: String },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["manager", "admin", "owner"],
      default: "manager",
    },
    buildingUid: { type: String },
    acceptedTerms: { type: Boolean, default: false },
    receiveUpdates: { type: Boolean, default: false },
    receivePromotions: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;

