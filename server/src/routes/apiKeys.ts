import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  createUserApiKey,
  listUserApiKeys,
  revokeUserApiKey,
  deleteUserApiKey,
} from "../controllers/apiKeyController";

const router = Router();

// All API key routes require authentication
router.use(authenticateToken);

// POST /api-keys - Create new API key
router.post("/", createUserApiKey);

// GET /api-keys - List user's API keys
router.get("/", listUserApiKeys);

// PUT /api-keys/:keyId/revoke - Revoke API key
router.put("/:keyId/revoke", revokeUserApiKey);

// DELETE /api-keys/:keyId - Delete API key
router.delete("/:keyId", deleteUserApiKey);

export default router;
