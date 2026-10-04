import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import FreelancerProfile from "./models/FreelancerProfile.js";
import Conversation from "./models/Conversation.js";
import Message from "./models/Message.js";

const PORT = Number(process.env.PORT) || 5000;

const HOST =
  process.env.NODE_ENV === "production"
    ? "0.0.0.0"
    : "127.0.0.1";

async function startServer() {
  try {
    await connectDB();

    await Promise.all([
      User.init(),
      FreelancerProfile.init(),
      Conversation.init(),
      Message.init(),
    ]);

    const server = app.listen(PORT, HOST, () => {
      console.log(`SkillBridge API listening on port ${PORT}`);
    });

    server.on("error", (error) => {
      console.error("HTTP server failed:", error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();