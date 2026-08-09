/** @type {import('next').NextConfig} */
const nextConfig = {
  // Development and production emit incompatible runtime chunk layouts.
  // Keeping them separate prevents `next dev` from reading a partial build.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
};

module.exports = nextConfig;
