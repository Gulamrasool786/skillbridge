import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import requireAuth from "../middleware/requireAuth.js";
import {
  startConversation,
  listConversations,
  getMessages,
  sendMessage,
  markConversationRead,
} from "../controllers/messageController.js";

const router = Router();

router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

router.use(requireAuth);

router.use((req, res, next) => {
  if (
    req.method !== "GET" &&
    req.get("X-SkillBridge-Request") !== "1"
  ) {
    return res.status(403).json({
      success: false,
      message: "Invalid application request.",
    });
  }

  next();
});

const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  keyGenerator: (req) => req.user._id.toString(),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please wait a minute.",
  },
});

router.get("/", listConversations);

router.post(
  "/",
  writeLimiter,
  startConversation
);

router.get(
  "/:conversationId/messages",
  getMessages
);

router.post(
  "/:conversationId/messages",
  writeLimiter,
  sendMessage
);

router.patch(
  "/:conversationId/read",
  markConversationRead
);

export default router;