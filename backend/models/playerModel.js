import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  jhatuImage: { type: String, default: "" },
  ganduImage: { type: String, default: "" },
  score: { type: Number, default: 0 },
  totalGames: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  ganduHits: { type: Number, default: 0 },
  totalTimePlayed: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

// 🏆 Index for faster leaderboard queries
playerSchema.index({ score: -1, updatedAt: -1 });

export default mongoose.model("Player", playerSchema);
