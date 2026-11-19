import {
  creerSalon,
  trouverSalon,
} from "../services/salonService.js";

// Créer un salon
export async function creerSalonController(req, res) {
  try {
    const salon = await creerSalon();

    res.status(201).json({
      message: "Salon créé avec succès !",
      salon,
    });
  } catch (error) {
    console.error("Erreur création salon :", error.message);

    res.status(500).json({
      message: "Impossible de créer le salon.",
    });
  }
}

// Vérifier si un salon existe
export async function verifierSalonController(req, res) {
  try {
    const { idSalle } = req.params;

    const salon = await trouverSalon(idSalle);

    if (!salon) {
      return res.status(404).json({
        message: "Salon introuvable.",
      });
    }

    res.status(200).json({
      message: "Salon trouvé !",
      salon,
    });
  } catch (error) {
    console.error("Erreur recherche salon :", error.message);

    res.status(500).json({
      message: "Impossible de vérifier le salon.",
    });
  }
}