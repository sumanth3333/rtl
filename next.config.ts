const withPWA = require("next-pwa")({
  dest: "public",
  register: false,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Enable only in production
  // Some Next.js internal manifests are not served at runtime; exclude them to avoid workbox install errors
  buildExcludes: [/middleware-manifest\.json$/, /app-build-manifest\.json$/],
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
