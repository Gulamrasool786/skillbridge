import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import {
  register,
  login,
  getMe,
  logout,
} from "../controllers/authController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again in 15 minutes.",
  },
});

// Require a custom header on requests that change auth state.
router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");

  if (
    ["POST", "PUT", "PATCH", "DELETE"].includes(req.method) &&
    req.get("X-SkillBridge-Request") !== "1"
  ) {
    return res.status(403).json({
      success: false,
      message: "Missing required request header.",
    });
  }

  next();
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", requireAuth, getMe);
router.post("/logout", logout);

export default router;