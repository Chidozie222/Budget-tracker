import express from "express";
import { configDotenv } from "dotenv";

import routes from "./src/routes/index.js";
import { logger } from "./src/middleware/logger.middleware.js";
import { error } from "./src/middleware/error.middleware.js";

configDotenv();
// import cors from "cors";

const PORT = process.env.PORT;

const app = express();

// app.use(cors());
app.use(logger);
app.use(express.json());
app.use("/api/v1", routes);



app.use(error);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`This server is running on port ${PORT}`);
});
