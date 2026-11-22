import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  images: {
    // Next 16 requires an explicit allow-list of qualities.
    qualities: [75],
    formats: ["image/avif", "image/webp"],
    // Phase 2: add the Supabase Storage host here, e.g.
    // remotePatterns: [{ protocol: "https", hostname: "<project>.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
