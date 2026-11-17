// backend/services/historiqueService.js  (membre 4)
const db = require('../db');
const { getIO } = require('../socket/io');
const { EVENEMENTS, roomDuSalon } = require('../socket/evenements');

// Contrat : appelée par le membre 2 quand le créateur lance (charge) une vidéo.
// Enregistre la vidéo dans l'historique du salon puis prévient la room.
async function ajouterHistorique(salonId, videoId) {
  const { rows } = await db.query(
    `WITH ins AS (
       INSERT INTO historique_video (salon_id, video_id) VALUES ($1, $2)
       RETURNING id, video_id, date_visionnage)
     SELECT ins.id, ins.video_id, v.youtube_id, v.titre, ins.date_visionnage
     FROM ins JOIN video v ON v.id = ins.video_id`,
    [salonId, videoId]);
  const l = rows[0];
  const entree = {
    id: l.id, videoId: l.video_id, youtubeId: l.youtube_id,
    titre: l.titre, dateVisionnage: l.date_visionnage.toISOString(),
  };
  getIO().to(roomDuSalon(salonId)).emit(EVENEMENTS.HISTORIQUE_AJOUTE, { entree });
  return entree;
}

async function listerHistorique(salonId) {
  const { rows } = await db.query(
    `SELECT h.id, h.video_id, v.youtube_id, v.titre, h.date_visionnage
     FROM historique_video h JOIN video v ON v.id = h.video_id
     WHERE h.salon_id = $1 ORDER BY h.date_visionnage DESC, h.id DESC`,
    [salonId]);
  return rows.map((l) => ({
    id: l.id, videoId: l.video_id, youtubeId: l.youtube_id,
    titre: l.titre, dateVisionnage: l.date_visionnage.toISOString(),
  }));
}

module.exports = { ajouterHistorique, listerHistorique };
