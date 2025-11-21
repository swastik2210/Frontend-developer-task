import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Task from "../models/Task.js";

const router = express.Router();

// CREATE TASK
router.post("/create", protect, async (req, res) => {
  const { title } = req.body;

  if (!title) return res.status(400).json({ message: "Title required" });

  const task = await Task.create({
    title,
    user: req.user._id,
  });

  res.json(task);
});

// GET ALL TASKS FOR LOGGED IN USER
router.get("/", protect, async (req, res) => {
  const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(tasks);
});

// UPDATE TASK
router.put("/:id", protect, async (req, res) => {
  const { title } = req.body;
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { title },
    { new: true }
  );
  res.json(task);
});

// DELETE TASK
router.delete("/:id", protect, async (req, res) => {
  await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ message: "Task deleted" });
});

// TOGGLE COMPLETE
router.patch("/:id/toggle", protect, async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
  task.completed = !task.completed;
  await task.save();
  res.json(task);
});

export default router;
