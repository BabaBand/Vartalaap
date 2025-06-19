import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  credentials: true,
}));

app.use((req, res, next) => {
  console.log("➡️ Incoming request:", req.method, req.originalUrl);
  next();
});


// Correct base route prefix
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.use((req, res, next) => {
  console.log("Unhandled request to:", req.originalUrl);
  next();
});


if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
  if (req.originalUrl.includes("http")) {
    // If malformed path like 'https://git.new/...' comes in
    return res.status(400).send("Bad request.");
  }

  try {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  } catch (err) {
    console.error("Error in wildcard route:", err);
    res.status(500).send("Internal Server Error");
  }
});

}

server.listen(PORT, () => {
  console.log("Server running on port:", PORT);
  connectDB();
});
