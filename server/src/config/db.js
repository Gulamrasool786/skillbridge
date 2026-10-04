import mongoose from "mongoose";

let connectionPromise = null;

export default async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required.");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGODB_URI, {
        dbName: "skillbridge",
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 10000,
      })
      .then(() => {
        console.log("MongoDB connected: skillbridge");
        return mongoose.connection;
      })
      .finally(() => {
        connectionPromise = null;
      });
  }

  return connectionPromise;
}