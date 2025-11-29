import { Router } from "express";
import {
  getBuilding,
  saveBuilding,
} from "../controllers/buildingController.js";
import { authenticate, requireManagerAccess } from "../middleware/auth.js";

const router = Router();

router.get("/:uid", getBuilding);
router.post("/save", authenticate, requireManagerAccess, saveBuilding);

export default router;

