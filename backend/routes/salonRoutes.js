import express from "express";

import {
  creerSalonController,
  verifierSalonController,
} from "../controllers/salonController.js";

const router = express.Router();

// Route pour créer un salon
router.post("/", creerSalonController);

// Route pour vérifier l'existence d'un salon
router.get("/:idSalle", verifierSalonController);

export default router;