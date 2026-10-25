import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { configDotenv } from "dotenv";

import routes from "./src/routes/index.js";
import { logger } from "./src/middleware/logger.middleware.js";
import { error } from "./src/middleware/error.middleware.js";

configDotenv();

const PORT = process.env.PORT;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.locals.io = io;

app.use(cors());
app.use(logger);
app.use(express.json());
app.use("/api/v1", routes);

app.use(error);

io.on("connection", (socket) => {
  socket.on("join-budget", (budgetId) => {
    if (!budgetId) return;
    socket.join(`budget:${budgetId}`);
  });

  socket.on("leave-budget", (budgetId) => {
    if (!budgetId) return;
    socket.leave(`budget:${budgetId}`);
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`This server is running on port ${PORT}`);
});
