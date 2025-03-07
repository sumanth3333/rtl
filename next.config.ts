const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Enable only in production
  buildExcludes: [/middleware-manifest.json$/], // ✅ Prevents build issues
});

module.exports = withPWA({
  reactStrictMode: true,
  experimental: {
    middlewarePrefetch: "strict", // ✅ Ensures efficient prefetching
  },
  images: {
    domains: ["localhost"], // ✅ Allow image loading (if needed)
  },
});
