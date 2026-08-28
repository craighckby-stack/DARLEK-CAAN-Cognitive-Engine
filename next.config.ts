import type { NextConfig } from "next";

/**
 * EMG Core v49 Neural Code & Documentation Optimizer Engine
 * Enterprise Next.js Configuration - Comprehensive Sovereign Overhaul
 * Optimized for peak performance, maximum type-safety, memory efficiency, and robust hardening.
 */
const nextConfig: NextConfig = {
  // Enforce uncompromising strict type checking during production build pipelines
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Ensure strict ESLint adherence during build processes
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Ensure native and database server-side packages are correctly externalized to optimize memory footprint
  serverExternalPackages: [
    "@prisma/client",
    "pdf-parse",
    "z-ai-web-dev-sdk",
    "mammoth",
  ],

  // Enable React strict mode for enhanced runtime error detection and concurrency readiness
  reactStrictMode: true,

  // Minimize memory footprint and harden security by stripping framework identification headers
  poweredByHeader: false,

  // Maximize network transfer performance with built-in compression
  compress: true,

  // Optimize production builds and memory efficiency via experimental compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },

  // Strengthen output handling for modern containerized enterprise deployments
  output: "standalone",
};

export default nextConfig;