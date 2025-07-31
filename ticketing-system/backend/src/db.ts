import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// ✅ Warn if any required env vars are missing
[
  'POSTGRES_HOST',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE'
].forEach((key) => {
  if (!process.env[key]) {
    console.warn(`⚠️ Missing env variable: ${key}`);
  }
});

console.log('📦 DB Config:', {
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD ? '****' : '❌ MISSING',
  database: process.env.POSTGRES_DATABASE,
});


// ✅ Create PostgreSQL pool
export const db = new Pool({
  host: process.env.POSTGRES_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  port: Number(process.env.POSTGRES_PORT) || 5432,
});

// ✅ Test the connection on startup
db.connect()
  .then(() => console.log('✅ PostgreSQL connected successfully'))
  .catch((err) => {
    console.error('❌ PostgreSQL connection error:', err); // full object
    process.exit(1);
  });

