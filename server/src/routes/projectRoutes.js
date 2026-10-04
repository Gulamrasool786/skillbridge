import { Router } from "express";
import {
  createProject,
  getProjects,
} from "../controllers/projectController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();

router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// Every project route below requires a logged-in user.
router.use(requireAuth);

router.get("/", getProjects);

router.post(
  "/",
  (req, res, next) => {
    if (req.get("X-SkillBridge-Request") !== "1") {
      return res.status(403).json({
        success: false,
        message: "Missing required request header.",
      });
    }

    if (req.user.role !== "client") {
      return res.status(403).json({
        success: false,
        message: "Only clients can create project briefs.",
      });
    }

    next();
  },
  createProject
);

export default router;