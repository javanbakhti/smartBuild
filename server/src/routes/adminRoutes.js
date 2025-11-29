import { Router } from "express";
import {
  createAdminInvite,
  validateAdminInvite,
  signupAdminViaInvite,
} from "../controllers/adminController.js";
import { authenticate, requireManagerAccess } from "../middleware/auth.js";

const router = Router();

router.post("/invite", authenticate, requireManagerAccess, createAdminInvite);
router.get("/invite/validate", validateAdminInvite);
router.post("/signup-via-invite", signupAdminViaInvite);

export default router;

