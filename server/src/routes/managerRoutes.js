import { Router } from "express";
import { signupManager } from "../controllers/managerController.js";

const router = Router();

router.post("/signup", signupManager);

export default router;

