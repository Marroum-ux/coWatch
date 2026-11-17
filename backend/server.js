import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";
import "dotenv/config";

const app = express();
const server = createServer(app);

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const io = new Server(server, {
  cors: { origin: "http://localhost:5173" },
});

app.get("/api/health", (req, res) => {
  res.json({ message: "coWatch backend works!" });
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

