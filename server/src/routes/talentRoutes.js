import { Router } from "express";
import {
  getTalent,
  getTalentById,
} from "../controllers/talentController.js";

const router = Router();

router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

router.get("/", getTalent);
router.get("/:freelancerId", getTalentById);

export default router;