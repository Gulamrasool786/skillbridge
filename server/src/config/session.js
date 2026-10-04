import "dotenv/config";
import session from "express-session";
import MongoStore from "connect-mongo";

if (!process.env.SESSION_SECRET || !process.env.MONGODB_URI) {
  throw new Error("SESSION_SECRET and MONGODB_URI are required.");
}

export const sessionCookieName = "skillbridge.sid";

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

const store = MongoStore.create({
  mongoUrl: process.env.MONGODB_URI,
  dbName: "skillbridge",
  collectionName: "sessions",
});

store.on("error", (error) => {
  console.error("Session storage error:", error.message);
});

const sessionMiddleware = session({
  name: sessionCookieName,
  secret: process.env.SESSION_SECRET,
  store,
  resave: false,
  saveUninitialized: false,

  cookie: {
    ...sessionCookieOptions,
    maxAge: 1000 * 60 * 60 * 24,
  },
});

export default sessionMiddleware;