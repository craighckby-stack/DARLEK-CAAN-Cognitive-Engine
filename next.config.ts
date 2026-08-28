import type { NextConfig } from "next";

const nextConfig = {
  
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["@prisma/client", "pdf-parse", "z-ai-web-dev-sdk", "mammoth"],
} as any;

export default nextConfig as NextConfig;
