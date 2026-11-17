// backend/socket/salonHandler.js  (membre 1) – salon:rejoindre
const { EVENEMENTS, ERREURS, roomDuSalon } = require('./evenements');
const ident = require('../services/identiteService');
const { etatPourEnvoi } = require('./videoHandler');

function enregistrer(io, socket) {
  socket.on(EVENEMENTS.SALON_REJOINDRE, async (donnees = {}, cb = () => {}) => {
    try {
      const { salonId, jeton } = donnees;
      if (typeof salonId !== 'string' || !(await ident.salonExiste(salonId))) {
        return cb({ ok: false, erreur: ERREURS.SALON_INTROUVABLE });
      }
      let resultat = jeton ? await ident.trouverParJeton(salonId, jeton) : null;
      if (resultat) {
        resultat = { participant: resultat, jeton };
      } else {
        const pseudo = ident.validerPseudo(donnees.pseudonyme);
        if (!pseudo) return cb({ ok: false, erreur: ERREURS.PSEUDO_INVALIDE });
        resultat = await ident.rejoindreSalon(salonId, pseudo, null);
      }
      socket.data.salonId = salonId;
      socket.data.participant = resultat.participant;
      await socket.join(roomDuSalon(salonId));
      cb({ ok: true, jeton: resultat.jeton, participant: resultat.participant,
           etatVideo: etatPourEnvoi(salonId), participants: [] /* rempli par le membre 3 */ });
    } catch (e) {
      console.error(e);
      cb({ ok: false, erreur: ERREURS.ERREUR_SERVEUR });
    }
  });
}
module.exports = { enregistrer };
