/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.tsx",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgresql://Summa_owner:9NZFnpfq3VYr@ep-damp-frost-a5xvw2l4.us-east-2.aws.neon.tech/Summa?sslmode=require',
    }
  };