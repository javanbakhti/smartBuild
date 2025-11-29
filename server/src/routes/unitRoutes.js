import { Router } from "express";
import { getUnitsByBuilding } from "../controllers/unitController.js";

const router = Router();
router.get("/:uid", getUnitsByBuilding);

export default router;

