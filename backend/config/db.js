import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "cowatch",
  user: process.env.DB_USER || "postgres",
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