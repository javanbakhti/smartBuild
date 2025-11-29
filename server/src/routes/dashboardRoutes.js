import { Router } from "express";
import { openDoor } from "../controllers/dashboardController.js";
import { authenticate, requireManagerAccess } from "../middleware/auth.js";

const router = Router();

router.post("/door/open", authenticate, requireManagerAccess, openDoor);

export default router;

