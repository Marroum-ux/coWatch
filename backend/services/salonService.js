import { randomUUID } from "node:crypto";
import pool from "../config/db.js";

// Créer un salon
export async function creerSalon() {
  const idSalle = randomUUID();
  const codeInvitation = randomUUID().slice(0, 8);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Enregistrer le salon
    await client.query(
      `INSERT INTO salon (id_salle, code_invitation)
       VALUES ($1, $2)`,
      [idSalle, codeInvitation]
    );

    // Créer sa playlist
    await client.query(
      `INSERT INTO playlist (id_salle) VALUES ($1)`,
      [idSalle]
    );

    // Créer son historique
    await client.query(
      `INSERT INTO historique (id_salle) VALUES ($1)`,
      [idSalle]
    );

    await client.query("COMMIT");

    return {
      idSalle,
      codeInvitation,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Rechercher un salon
export async function trouverSalon(idSalle) {
  const result = await pool.query(
    `SELECT id_salle, code_invitation
     FROM salon
     WHERE id_salle = $1`,
    [idSalle]
  );

  return result.rows[0] || null;
}