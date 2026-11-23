
import pool from "../config/db.js";

export function registerSalonSocket(io, socket) {

  function envoyerListeParticipants(idSalle) {
    const sockets = io.sockets.adapter.rooms.get(idSalle);

    const participants = sockets
      ? [...sockets]
          .map((socketId) => {
            const client = io.sockets.sockets.get(socketId);

            return client
              ? {
                  socketId,
                  pseudo: client.data.pseudo || "Anonyme",
                }
              : null;
          })
          .filter(Boolean)
      : [];

    io.to(idSalle).emit("participant:liste", participants);
  }

  socket.on("salon:rejoindre", async ({ id_salle, pseudo } = {}) => {
    if (typeof id_salle !== "string" || !id_salle.trim()) {
      socket.emit("salon:erreur", "Identifiant de salon invalide");
      return;
    }

    try {
      const result = await pool.query(
        "SELECT id_salle FROM salon WHERE id_salle = $1",
        [id_salle]
      );

      if (result.rows.length === 0) {
        socket.emit("salon:erreur", "Salon introuvable");
        return;
      }

      const ancienSalon = socket.data.id_salle;

      if (ancienSalon && ancienSalon !== id_salle) {
        await socket.leave(ancienSalon);

        io.to(ancienSalon).emit("participant:deconnecte", {
          pseudo: socket.data.pseudo,
          socketId: socket.id,
        });

        envoyerListeParticipants(ancienSalon);
      }

      socket.data.id_salle = id_salle;
      socket.data.pseudo =
        typeof pseudo === "string" && pseudo.trim()
          ? pseudo.trim().slice(0, 50)
          : "Anonyme";

      await socket.join(id_salle);

      envoyerListeParticipants(id_salle);

      console.log(`${socket.data.pseudo} joined salon ${id_salle}`);

      socket.emit("salon:rejoint", {
        id_salle,
        message: "Salon rejoint avec succès",
      });

      socket.to(id_salle).emit("participant:connecte", {
        pseudo: socket.data.pseudo,
        socketId: socket.id,
      });

    } catch (error) {
      console.error("Erreur salon:rejoindre:", error);
      socket.emit("salon:erreur", "Impossible de rejoindre le salon");
    }
  });

  socket.on("disconnect", () => {
    const { id_salle, pseudo } = socket.data;

    if (id_salle) {
      io.to(id_salle).emit("participant:deconnecte", {
        pseudo,
        socketId: socket.id,
      });

      envoyerListeParticipants(id_salle);
    }

    console.log("Client disconnected:", socket.id);
  });
}
