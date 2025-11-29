import { Router } from "express";
import {
  residentLogin,
  residentSignup,
  activateResident,
} from "../controllers/residentController.js";

const router = Router();

router.post("/signup", residentSignup);
router.post("/login", residentLogin);
router.post("/activate", activateResident); // ← مسیر جدید

export default router;
