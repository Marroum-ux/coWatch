// backend/services/playlistService.js  (membre 4) – extrait utile au contrat
const db = require('../db');

// Contrat : utilisée par le membre 2 avant de lancer une vidéo.
// Renvoie { videoId, youtubeId, titre, position } si la vidéo est dans
// la playlist du salon, sinon null.
async function trouverVideoDansPlaylist(salonId, videoId) {
  const { rows } = await db.query(
    `SELECT v.id, v.youtube_id, v.titre, p.position
     FROM playlist_video p JOIN video v ON v.id = p.video_id
     WHERE p.salon_id = $1 AND p.video_id = $2`,
    [salonId, videoId]);
  if (!rows[0]) return null;
  const l = rows[0];
  return { videoId: l.id, youtubeId: l.youtube_id, titre: l.titre, position: l.position };
}

module.exports = { trouverVideoDansPlaylist };
