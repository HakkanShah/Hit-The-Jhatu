import express from "express";
import multer from "multer";
import Player from "../models/playerModel.js";
import path from "path";
import fs from "fs";

const router = express.Router();

// Multer storage (save to /uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random()*1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${unique}${ext}`);
  }
});
const upload = multer({ storage });

// Create or update player (register)
router.post("/register", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name required" });

    // find existing by name (or create new)
    let player = await Player.findOne({ name });
    if (!player) {
      player = new Player({ name });
      await player.save();
    }

    res.json(player);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload images for a player (jhatuImage and/or ganduImage)
router.post("/upload/:id", upload.fields([
  { name: "jhatuImage", maxCount: 1 },
  { name: "ganduImage", maxCount: 1 }
]), async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ message: "Player not found" });

    if (req.files && req.files.jhatuImage) {
      player.jhatuImage = `/uploads/${req.files.jhatuImage[0].filename}`;
    }
    if (req.files && req.files.ganduImage) {
      player.ganduImage = `/uploads/${req.files.ganduImage[0].filename}`;
    }
    player.updatedAt = Date.now();
    await player.save();

    // emit updated leaderboard to all connected clients
    const io = req.app.locals.io;
    if (io) {
      const top = await Player.find().sort({ score: -1, updatedAt: -1 }).limit(10);
      io.emit("leaderboard-updated", top);
    }

    res.json(player);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update stats/score (should be called on game over)
router.post("/update/:id", async (req, res) => {
  try {
    const { score, totalGames, bestStreak, ganduHits, totalTimePlayed } = req.body;
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ message: "Player not found" });

    // update numeric stats carefully
    if (typeof score === "number" && score > player.score) player.score = score;
    if (typeof totalGames === "number") player.totalGames = (player.totalGames || 0) + totalGames;
    if (typeof bestStreak === "number" && bestStreak > player.bestStreak) player.bestStreak = bestStreak;
    if (typeof ganduHits === "number") player.ganduHits = (player.ganduHits || 0) + ganduHits;
    if (typeof totalTimePlayed === "number") player.totalTimePlayed = (player.totalTimePlayed || 0) + totalTimePlayed;

    player.updatedAt = Date.now();
    await player.save();

    // emit new leaderboard
    const io = req.app.locals.io;
    if (io) {
      const top = await Player.find().sort({ score: -1, updatedAt: -1 }).limit(10);
      io.emit("leaderboard-updated", top);
    }

    res.json(player);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const top = await Player.find().sort({ score: -1, updatedAt: -1 }).limit(10);
    res.json(top);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
