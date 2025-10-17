import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  jhatuImage: { type: String, default: "" }, // server path or URL
  ganduImage: { type: String, default: "" },
  score: { type: Number, default: 0 },
  totalGames: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  ganduHits: { type: Number, default: 0 },
  totalTimePlayed: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Player", playerSchema);
