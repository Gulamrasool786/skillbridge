import mongoose from "mongoose";
import User from "../models/User.js";

export default async function requireAuth(req, res, next) {
  try {
    const userId = req.session?.userId;

    if (!userId || !mongoose.isObjectIdOrHexString(userId)) {
      return res.status(401).json({
        success: false,
        message: "Please log in to continue.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Your account is no longer available.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}