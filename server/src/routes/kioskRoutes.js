import { Router } from "express";
import {
  getKioskSettings,
  saveKioskSettings,
  getKioskResidents,
} from "../controllers/kioskController.js";
import { authenticate, requireManagerAccess } from "../middleware/auth.js";

const router = Router();

router.get("/settings", getKioskSettings);
router.post("/settings", authenticate, requireManagerAccess, saveKioskSettings);
router.get("/residents", getKioskResidents);

export default router;

