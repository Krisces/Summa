import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
// Import schema
import * as schema from './schema'

// Make sure the database url is set
if (!process.env.DATABASE_URL) {
    // Throw error if database url is not valid
    throw new Error("DATABASE_URL is not set in the environment variables.");
}

// Make database connection
const sql = neon(process.env.DATABASE_URL);

// Setup drizzle ORM connection
export const db = drizzle(sql, { schema });
