import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
export const db = new Pool({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    port: Number(process.env.POSTGRES_PORT) || 5432,
});
