/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    middlewarePrefetch: "strict", // ✅ Ensures cookies are passed to middleware
  },
  async headers() {
    return [
      {
        source: "/api/:path*", // Apply headers to API routes
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "https://rtl-drab.vercel.app" }, // ✅ Allow frontend
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, Cookie" },
        ],
      },
    ];
  },
  reactStrictMode: true, // ✅ Optional, recommended for catching issues
};

module.exports = nextConfig;
