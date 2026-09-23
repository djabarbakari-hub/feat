import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "static.exercisedb.dev" },
    ],
  },
};

export default nextConfig;
