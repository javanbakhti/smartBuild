import mongoose from "mongoose";

const adminInviteSchema = new mongoose.Schema(
  {
    token: { type: String, unique: true, required: true },
    email: { type: String, required: true },
    buildingUid: { type: String, required: true },
    role: { type: String, default: "admin" },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["pending", "accepted", "revoked", "expired"],
      default: "pending",
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const AdminInvite = mongoose.model("AdminInvite", adminInviteSchema);
export default AdminInvite;

