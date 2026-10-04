import mongoose from "mongoose";

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing from server/.env");
  }

  await mongoose.connect(uri, {
    dbName: "skillbridge",
  });

  console.log("MongoDB connected: skillbridge");
}

export default connectDB;