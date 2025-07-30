import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1", // ✅ Allow localhost signed URLs
        port: "54321", // Optional, if your Supabase emulator runs on a port
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
