
import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import "dotenv/config";

import pool from "./config/db.js";
import salonRoutes from "./routes/salonRoutes.js";
import { initializeSocket } from "./socket/index.js";

const app = express();
const server = createServer(app);

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/salons", salonRoutes);

initializeSocket(server);

app.get("/api/health", (req, res) => {
  res.json({ message: "coWatch backend works!" });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
