/** @type { import("drizzle-kit").Config } */
const config = {
  schema: "./utils/schema.tsx",
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.NEXT_PUBLIC_DATABASE_URL,
  }
};

export default config;
