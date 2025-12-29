import express from "express";
import Thread from "../models/thread.js";
import openAiResponse from "../utils/openai.js";
import { connectDB } from "../serverr.js";

const router = express.Router();

/* ---------- TEST ---------- */
router.post("/test", async (req, res) => {
  await connectDB();
  const thread = new Thread({
    threadId: "xyz",
    title: "testing"
  });
  const response = await thread.save();
  res.json(response);
});

/* ---------- GET ALL THREADS ---------- */
router.get("/thread", async (req, res) => {
  try {
    await connectDB();
    const threads = await Thread.find({}).sort({ updatedAt: -1 });
    res.json(threads);
  } catch {
    res.status(500).json({ error: "failed to fetch threads" });
  }
});

/* ---------- GET SINGLE THREAD ---------- */
router.get("/thread/:threadId", async (req, res) => {
  try {
    await connectDB();
    const thread = await Thread.findOne({ threadId: req.params.threadId });
    if (!thread) return res.status(404).json({ error: "thread not found" });
    res.json(thread.messages);
  } catch {
    res.status(500).json({ error: "failed to fetch chat" });
  }
});

/* ---------- DELETE THREAD ---------- */
router.delete("/thread/:threadId", async (req, res) => {
  try {
    await connectDB();
    await Thread.findOneAndDelete({ threadId: req.params.threadId });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "failed to delete chat" });
  }
});

/* ---------- CHAT ---------- */
router.post("/chat", async (req, res) => {
  const { threadId, message } = req.body;
  if (!threadId || !message) {
    return res.status(400).json({ error: "missing fields" });
  }

  try {
    await connectDB();

    let thread = await Thread.findOne({ threadId });

    if (!thread) {
      thread = new Thread({
        threadId,
        title: message,
        messages: [{ role: "user", content: message }]
      });
    } else {
      thread.messages.push({ role: "user", content: message });
    }

    const assistantReply = await openAiResponse(message);

    thread.messages.push({
      role: "assistant",
      content: assistantReply
    });

    thread.updatedAt = new Date();
    await thread.save();

    res.json({ reply: assistantReply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "chat failed" });
  }
});

export default router;
