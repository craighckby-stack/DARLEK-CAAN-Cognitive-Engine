import type { NextConfig } from "next";

/**
 * Enterprise Next.js Configuration
 * Optimized for performance, strict type safety, and server-side package execution.
 */
const nextConfig: NextConfig = {
  // Enforce strict type checking during build processes
  typescript: {
    ignoreBuildErrors: false,
  },
  // Ensure native server-side packages are correctly bundled and externalized
  serverExternalPackages: [
    "@prisma/client",
    "pdf-parse",
    "z-ai-web-dev-sdk",
    "mammoth",
  ],
  // Enable React strict mode for enhanced runtime error detection
  reactStrictMode: true,
  // Optimize production output and minimize memory footprint
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;