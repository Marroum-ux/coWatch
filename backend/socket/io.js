// backend/socket/io.js  (membre 1)
// Donne accès à l'instance Socket.IO depuis n'importe quel module
// (ex. routes HTTP de la playlist qui doivent émettre playlist:modifiee).
let io = null;

function initIO(instance) { io = instance; }

function getIO() {
  if (!io) throw new Error('Socket.IO pas encore initialisé');
  return io;
}

// Helpers pour les gestionnaires d'événements socket
const estDansSalon = (socket) => Boolean(socket.data.salonId && socket.data.participant);
const estCreateur  = (socket) => estDansSalon(socket) && socket.data.participant.estCreateur === true;

module.exports = { initIO, getIO, estDansSalon, estCreateur };
