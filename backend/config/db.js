import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.connect()
  .then((client) => {
    console.log("Connexion à PostgreSQL réussie !");
    client.release();
  })
  .catch((err) => {
    console.error("Erreur de connexion à PostgreSQL :", err.message);
  });

export default pool;