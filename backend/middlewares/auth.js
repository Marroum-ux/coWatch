// backend/middlewares/auth.js  (membre 1)
// À utiliser sur les routes /api/salons/:id/...
const { trouverParJeton } = require('../services/identiteService');

async function exigerParticipant(req, res, next) {
  try {
    const jeton = req.get('X-Jeton-Participant');
    if (!jeton) {
      return res.status(401).json({ erreur: 'JETON_ABSENT', message: 'Jeton manquant.' });
    }
    const participant = await trouverParJeton(req.params.id, jeton);
    if (!participant) {
      return res.status(401).json({ erreur: 'JETON_INVALIDE', message: 'Jeton inconnu pour ce salon.' });
    }
    req.participant = participant;   // { id, salonId, pseudonyme, estCreateur }
    next();
  } catch (e) {
    next(e);
  }
}

function exigerCreateur(req, res, next) {
  exigerParticipant(req, res, () => {
    if (!req.participant.estCreateur) {
      return res.status(403).json({ erreur: 'NON_CREATEUR', message: 'Action réservée au créateur du salon.' });
    }
    next();
  });
}

module.exports = { exigerParticipant, exigerCreateur };
