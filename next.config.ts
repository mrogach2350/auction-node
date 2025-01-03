import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  experimental: {
    turbo: {
      moduleIdStrategy: "deterministic",
    },
  },
};

export default nextConfig;
