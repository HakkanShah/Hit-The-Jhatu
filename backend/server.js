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
  cors: { origin: "*" } // change to your frontend origin in production
});

app.use(cors());
app.use(express.json());

// serve static uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// make io available to routes via app.locals
app.locals.io = io;

app.use("/api/players", playerRoutes);

// Connect to Mongo
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB error:", err));

// Socket.IO connection logging (optional)
io.on("connection", socket => {
  console.log("Socket connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🔥 Server running on ${PORT}`));
