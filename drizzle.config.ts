/** @type { import("drizzle-kit").Config } */
const config = {
  schema: "./utils/schema.tsx",
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.NEXT_PUBLIC_DATABASE_URL || 'postgresql://Summa_owner:9NZFnpfq3VYr@ep-damp-frost-a5xvw2l4.us-east-2.aws.neon.tech/Summa?sslmode=require',
  }
};

export default config;
