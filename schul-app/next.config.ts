import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse / mammoth do their own fs/Node-native work and shouldn't be
  // bundled into the serverless function — keep them as plain dependencies.
  serverExternalPackages: ["pdf-parse", "mammoth"],
};

export default nextConfig;
