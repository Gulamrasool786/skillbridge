import express from "express";
import projectRoutes from "./routes/projectRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import sessionMiddleware from "./config/session.js";
import freelancerProfileRoutes from "./routes/freelancerProfileRoutes.js";
import talentRoutes from "./routes/talentRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

const app = express();

app.disable("x-powered-by");

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(express.json({ limit: "20kb" }));

// Authenticated API responses must not be cached by a CDN.
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use(sessionMiddleware);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SkillBridge backend is connected!",
  });
});

app.use("/api/projects", projectRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/freelancer-profiles", freelancerProfileRoutes);
app.use("/api/talent", talentRoutes);
app.use("/api/conversations", messageRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Please correct the submitted details.",
      errors: Object.fromEntries(
        Object.entries(error.errors).map(([field, issue]) => [
          field,
          issue.message,
        ])
      ),
    });
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "The request contains invalid JSON.",
    });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "The request is too large.",
    });
  }

  console.error("API error:", error.message);

  return res.status(500).json({
    success: false,
    message: "The server could not complete the request.",
  });
});

export default app;