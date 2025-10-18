// server.js
import express from "express";
import http from "http";
import { Server as SocketIO } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import playerRoutes from "./routes/playerRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: {
    origin: "*", // in production, replace * with your Vercel frontend domain
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ make io accessible in routes
app.locals.io = io;

// ✅ player routes
app.use("/api/players", playerRoutes);

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err.message));

// ✅ Socket.IO real-time leaderboard updates
io.on("connection", (socket) => {
  console.log("⚡ Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// ✅ Broadcast leaderboard updates
export const broadcastLeaderboardUpdate = (io, leaderboard) => {
  io.emit("leaderboard-updated", leaderboard);
};

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🔥 Server running on port ${PORT}`));
