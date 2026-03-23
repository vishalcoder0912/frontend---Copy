import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect()
  .then((client) => {
    console.log("Connected to PostgreSQL");
    client.release();
  })
  .catch((error) => {
    console.error("PostgreSQL connection error", error.message);
  });

export const query = (text, params) => pool.query(text, params);
