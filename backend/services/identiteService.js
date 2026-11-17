// backend/services/identiteService.js  (membre 1)
const crypto = require('crypto');
const db = require('../db');                 // pool pg partagé

const hacher = (jeton) => crypto.createHash('sha256').update(jeton).digest('hex');
const nouveauJeton = () => crypto.randomBytes(32).toString('hex');     // 64 caractères
const nouvelIdSalon = () => crypto.randomBytes(8).toString('base64url').slice(0, 10);

const versParticipant = (l) => ({
  id: l.id, salonId: l.salon_id, pseudonyme: l.pseudonyme, estCreateur: l.est_createur,
});

function validerPseudo(pseudonyme) {
  const p = typeof pseudonyme === 'string' ? pseudonyme.trim() : '';
  return p.length >= 1 && p.length <= 30 ? p : null;
}

// Crée le salon ET son créateur dans une transaction
async function creerSalon(pseudonyme) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const salonId = nouvelIdSalon();
    await client.query('INSERT INTO salon (id) VALUES ($1)', [salonId]);
    const jeton = nouveauJeton();
    const { rows } = await client.query(
      `INSERT INTO participant_salon (salon_id, pseudonyme, est_createur, jeton_hash)
       VALUES ($1, $2, TRUE, $3) RETURNING *`,
      [salonId, pseudonyme, hacher(jeton)]);
    await client.query('COMMIT');
    return { salonId, participant: versParticipant(rows[0]), jeton };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// Retrouve le participant d'un salon à partir de son jeton (ou null)
async function trouverParJeton(salonId, jeton) {
  if (!jeton) return null;
  const { rows } = await db.query(
    'SELECT * FROM participant_salon WHERE salon_id = $1 AND jeton_hash = $2',
    [salonId, hacher(jeton)]);
  return rows[0] ? versParticipant(rows[0]) : null;
}

// Rejoindre : réutilise le participant si le jeton est valide, sinon en crée un
async function rejoindreSalon(salonId, pseudonyme, jeton) {
  const existant = await trouverParJeton(salonId, jeton);
  if (existant) return { participant: existant, jeton };
  const nouveau = nouveauJeton();
  const { rows } = await db.query(
    `INSERT INTO participant_salon (salon_id, pseudonyme, jeton_hash)
     VALUES ($1, $2, $3) RETURNING *`,
    [salonId, pseudonyme, hacher(nouveau)]);
  return { participant: versParticipant(rows[0]), jeton: nouveau };
}

async function salonExiste(salonId) {
  const { rowCount } = await db.query('SELECT 1 FROM salon WHERE id = $1', [salonId]);
  return rowCount === 1;
}

module.exports = { creerSalon, rejoindreSalon, trouverParJeton, salonExiste, validerPseudo };
