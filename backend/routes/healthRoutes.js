import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "coWatch backend works!" });
});

export default router;