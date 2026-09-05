import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDb = async () => {
  if (!env.MONGO_URI) throw new Error("MONGODB_URI is required");
  await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  console.log("Database connected");
};


export const disconnectDb = async () => {
  await mongoose.disconnect();
  console.log("Database disconnected");
}