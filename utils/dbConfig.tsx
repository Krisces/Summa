import dotenv from 'dotenv'; // Import dotenv
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Load environment variables from .env file
dotenv.config();

if (!process.env.NEXT_PUBLIC_DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in the environment variables.");
}

const sql = neon(process.env.NEXT_PUBLIC_DATABASE_URL);
export const db = drizzle(sql, { schema });
