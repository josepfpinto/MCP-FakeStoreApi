import { Router } from "express";
import { login } from "../controllers/authController";

const router = Router();

// POST /login
router.post("/login", login);

export default router;
