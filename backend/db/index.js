// backend/db/index.js  (membre 1) – pool PostgreSQL partagé
const { Pool } = require('pg');
module.exports = new Pool({ connectionString: process.env.DATABASE_URL });
