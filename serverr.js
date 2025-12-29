import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import chatRoutes from "./routes/chat.js";

const app = express();

app.use(express.json());

// ✅ allow frontend (safe for now)
app.use(cors());

// health check
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "SigmaGPT API running" });
});

app.use("/api", chatRoutes);

// ================= MongoDB Serverless Cache =================
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false
    }).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default app;
