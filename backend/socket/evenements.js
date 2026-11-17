// ============================================================
// coWatch – Constantes partagées (noms d'événements, codes d'erreur)
// Copier ce fichier dans backend/socket/evenements.js
// ET dans frontend/src/services/evenements.js (même contenu).
// Ne jamais écrire un nom d'événement "en dur" ailleurs.
// ============================================================

// --- Événements Socket.IO -------------------------------------
const EVENEMENTS = {
  // Client -> serveur (avec accusé de réception)
  SALON_REJOINDRE: 'salon:rejoindre',     // membre 1
  VIDEO_COMMANDE:  'video:commande',      // membre 2 (créateur seulement)
  CHAT_ENVOYER:    'chat:envoyer',        // membre 3

  // Serveur -> clients du salon
  VIDEO_ETAT:          'video:etat',          // membre 2
  CHAT_MESSAGE:        'chat:message',        // membre 3
  SALON_PARTICIPANTS:  'salon:participants',  // membre 3
  PLAYLIST_MODIFIEE:   'playlist:modifiee',   // membre 4
  HISTORIQUE_AJOUTE:   'historique:ajoute',   // membre 4
};

// Actions possibles dans video:commande
const ACTIONS_VIDEO = {
  CHARGER:     'charger',      // lancer une vidéo de la playlist
  LECTURE:     'lecture',
  PAUSE:       'pause',
  DEPLACEMENT: 'deplacement',  // changement de position
};

// --- Codes d'erreur (HTTP et accusés Socket.IO) ---------------
const ERREURS = {
  SALON_INTROUVABLE:   'SALON_INTROUVABLE',   // 404
  PSEUDO_INVALIDE:     'PSEUDO_INVALIDE',     // 400
  JETON_ABSENT:        'JETON_ABSENT',        // 401
  JETON_INVALIDE:      'JETON_INVALIDE',      // 401
  NON_CREATEUR:        'NON_CREATEUR',        // 403
  PAS_DANS_SALON:      'PAS_DANS_SALON',      // 403 (socket sans salon:rejoindre)
  VIDEO_INVALIDE:      'VIDEO_INVALIDE',      // 400 (lien YouTube incorrect)
  VIDEO_DEJA_PRESENTE: 'VIDEO_DEJA_PRESENTE', // 409
  VIDEO_INTROUVABLE:   'VIDEO_INTROUVABLE',   // 404 (pas dans la playlist)
  COMMANDE_INVALIDE:   'COMMANDE_INVALIDE',   // 400
  MESSAGE_INVALIDE:    'MESSAGE_INVALIDE',    // 400
  ERREUR_SERVEUR:      'ERREUR_SERVEUR',      // 500
};

// Limites de validation communes
const LIMITES = {
  PSEUDO_MAX: 30,
  MESSAGE_MAX: 500,
};

// Nom de la "room" Socket.IO d'un salon
const roomDuSalon = (salonId) => `salon:${salonId}`;

// Clé localStorage où le frontend range l'identité d'un salon
const cleStockage = (salonId) => `cowatch:${salonId}`;

module.exports = { EVENEMENTS, ACTIONS_VIDEO, ERREURS, LIMITES, roomDuSalon, cleStockage };
// Côté frontend (Vite/React) remplacer la ligne ci-dessus par :
// export { EVENEMENTS, ACTIONS_VIDEO, ERREURS, LIMITES, roomDuSalon, cleStockage };
