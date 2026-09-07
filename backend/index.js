import express from "express";
import { configDotenv } from "dotenv";
configDotenv();
// import cors from "cors";

const PORT = process.env.PORT;

const app = express();

// app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`This server is running on port ${PORT}`);
});
