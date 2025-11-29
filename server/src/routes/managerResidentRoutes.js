import { Router } from "express";
import {
  listResidents,
  createResident,
  updateResident,
  deleteResident,
  updateResidentStatus,
  resetResidentPasscode,
} from "../controllers/managerResidentController.js";
import { authenticate, requireManagerAccess } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, requireManagerAccess);

router.get("/residents", listResidents);
router.post("/residents", createResident);
router.put("/residents/:id", updateResident);
router.delete("/residents/:id", deleteResident);
router.post("/residents/:id/status", updateResidentStatus);
router.post("/residents/:id/reset-passcode", resetResidentPasscode);

export default router;

