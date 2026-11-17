// backend/socket/videoHandler.js  (membre 2) – partie "charger" du contrat §4 et §5
const { EVENEMENTS, ACTIONS_VIDEO, ERREURS, roomDuSalon } = require('./evenements');
const { estDansSalon, estCreateur } = require('./io');
const { trouverVideoDansPlaylist } = require('../services/playlistService');
const { ajouterHistorique } = require('../services/historiqueService');

const etats = new Map(); // salonId -> { videoId, youtubeId, titre, position, enLecture, misAJourLe }

function etatPourEnvoi(salonId) {
  const e = etats.get(salonId);
  if (!e) return null;
  const position = e.enLecture ? e.position + (Date.now() - e.misAJourLe) / 1000 : e.position;
  return { videoId: e.videoId, youtubeId: e.youtubeId, titre: e.titre, position, enLecture: e.enLecture };
}

function enregistrer(io, socket) {
  socket.on(EVENEMENTS.VIDEO_COMMANDE, async (donnees, cb = () => {}) => {
    try {
      if (!estDansSalon(socket)) return cb({ ok: false, erreur: ERREURS.PAS_DANS_SALON });
      if (!estCreateur(socket)) return cb({ ok: false, erreur: ERREURS.NON_CREATEUR });
      const salonId = socket.data.salonId;
      const room = roomDuSalon(salonId);
      const { action } = donnees || {};

      if (action === ACTIONS_VIDEO.CHARGER) {
        const video = await trouverVideoDansPlaylist(salonId, Number(donnees.videoId));
        if (!video) return cb({ ok: false, erreur: ERREURS.VIDEO_INTROUVABLE });
        etats.set(salonId, {
          videoId: video.videoId, youtubeId: video.youtubeId, titre: video.titre,
          position: 0, enLecture: true, misAJourLe: Date.now(),
        });
        await ajouterHistorique(salonId, video.videoId);              // contrat §4
        io.to(room).emit(EVENEMENTS.VIDEO_ETAT, etatPourEnvoi(salonId)); // toute la room
        return cb({ ok: true });
      }

      const e = etats.get(salonId);
      const position = Number(donnees.position);
      if (!e || !Number.isFinite(position) || position < 0) {
        return cb({ ok: false, erreur: ERREURS.COMMANDE_INVALIDE });
      }
      if (action === ACTIONS_VIDEO.LECTURE) e.enLecture = true;
      else if (action === ACTIONS_VIDEO.PAUSE) e.enLecture = false;
      else if (action !== ACTIONS_VIDEO.DEPLACEMENT) return cb({ ok: false, erreur: ERREURS.COMMANDE_INVALIDE });
      e.position = position;
      e.misAJourLe = Date.now();
      socket.to(room).emit(EVENEMENTS.VIDEO_ETAT, etatPourEnvoi(salonId)); // les autres seulement
      cb({ ok: true });
    } catch (err) {
      console.error(err);
      cb({ ok: false, erreur: ERREURS.ERREUR_SERVEUR });
    }
  });
}

module.exports = { enregistrer, etatPourEnvoi };
