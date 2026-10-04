import { Router } from "express";
import requireAuth from "../middleware/requireAuth.js";
import {
  getMyProfile,
  saveMyProfile,
  updateMyProfileStatus,
} from "../controllers/freelancerProfileController.js";

const router = Router();

router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

router.use(requireAuth);

router.use((req, res, next) => {
  if (req.user.role !== "freelancer") {
    return res.status(403).json({
      success: false,
      message: "A freelancer account is required.",
    });
  }

  next();
});

router.get("/me", getMyProfile);

router.put(
  "/me",
  (req, res, next) => {
    if (req.get("X-SkillBridge-Request") !== "1") {
      return res.status(403).json({
        success: false,
        message: "Invalid application request.",
      });
    }

    next();
  },
  saveMyProfile
);
// Your existing router.put("/me", ...) stays above.

router.patch(
  "/me/status",
  (req, res, next) => {
    if (req.get("X-SkillBridge-Request") !== "1") {
      return res.status(403).json({
        success: false,
        message: "Invalid application request.",
      });
    }

    next();
  },
  updateMyProfileStatus
);
export default router;