import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "cowatch",
  user: "postgres",
  password: "ouali123",
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