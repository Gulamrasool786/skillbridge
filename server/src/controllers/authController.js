import bcrypt from "bcryptjs";
import User from "../models/User.js";
import {
  sessionCookieName,
  sessionCookieOptions,
} from "../config/session.js";

export async function register(req, res, next) {
  try {
    const {
      name,
      email,
      password,
      role = "client",
    } = req.body ?? {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof role !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide valid name, email, password, and role fields.",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const errors = {};

    if (
      normalizedName.length < 2 ||
      normalizedName.length > 80
    ) {
      errors.name = "Name must contain 2 to 80 characters.";
    }

    if (
      normalizedEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      errors.email = "Enter a valid email address.";
    }

    if (
      password.length < 15 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      errors.password =
        "Use at least 15 characters and no more than 72 UTF-8 bytes.";
    }

    if (!["client", "freelancer"].includes(role)) {
      errors.role = "Choose client or freelancer.";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Please correct the registration details.",
        errors,
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      passwordHash,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "Account created. You can log in once login is enabled.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    next(error);
  }
}

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      email.length > 254 ||
      !password ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid email and password.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+passwordHash");

    const passwordMatches = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;
      console.log("Login diagnostic:",{
        userFound: Boolean(user),
        passwordHashPresent: Boolean(user?.passwordHash),
        passwordMatches,
      });
   

    if (!user || !passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    console.log("Login stage: reganeration session");

    await new Promise((resolve, reject) => {
      req.session.regenerate((error) => {
        if (error) return reject(error);
        resolve();
      });
    });

    console.log("Login stage: session generated");

    req.session.userId = user._id.toString();

    console.log("Login stage: saving session");

    await new Promise((resolve, reject) => {
      req.session.save((error) => {
        if (error) return reject(error);
        resolve();
      });
    });

    console.log("Login stage: session saved");

    res.once("finish", ()=>{
      console.log("Login response finished:", res.statusCode);
    });

    return res.status(200).json({
      success: true,
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
}

export function getMe(req, res) {
  return res.status(200).json({
    success: true,
    user: publicUser(req.user),
  });
}

export function logout(req, res, next) {
  req.session.destroy((error) => {
    if (error) return next(error);

    res.clearCookie(sessionCookieName, sessionCookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  });
}