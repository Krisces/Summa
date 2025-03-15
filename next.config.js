/** @type {import('next').NextConfig} */
const dotenv = require("dotenv");

// Load environment variables from .env
dotenv.config();

const nextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

module.exports = nextConfig;
