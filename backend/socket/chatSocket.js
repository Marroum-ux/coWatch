
export function registerChatSocket(io, socket) {
  socket.on("chat:envoyer", ({ message } = {}) => {
    if (typeof message !== "string") return;

    const texte = message.trim();

    if (!texte || texte.length > 500) {
      socket.emit(
        "chat:erreur",
        "Message invalide (maximum 500 caractères)"
      );
      return;
    }

    const id_salle = socket.data.id_salle;

    if (!id_salle || !socket.rooms.has(id_salle)) {
      socket.emit(
        "chat:erreur",
        "Vous devez rejoindre un salon"
      );
      return;
    }

    io.to(id_salle).emit("chat:message", {
      pseudo: socket.data.pseudo,
      message: texte,
      date: new Date().toISOString(),
    });
  });
}
