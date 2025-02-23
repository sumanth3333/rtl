import { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    middlewarePrefetch: "strict", // ✅ Ensures cookies are passed to middleware
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "https://rtl-drab.vercel.app" }, // ✅ Allow frontend
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, Cookie" },
        ],
      },
    ];
  },
  reactStrictMode: true, // ✅ Recommended for debugging
};

export default nextConfig;
