import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : null;
const supabaseHost = supabaseUrl?.hostname ?? "*.supabase.co";
// Supabase lokal (supabase start) berjalan di http://127.0.0.1.
const isLocalSupabase = supabaseUrl?.protocol === "http:";

const nextConfig: NextConfig = {
  // Font untuk gambar pratinjau tautan (dibaca saat runtime).
  outputFileTracingIncludes: { "/**": ["./src/assets/fonts/**"] },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    formats: ["image/webp"],
    remotePatterns: isLocalSupabase ? [{ protocol: "http", hostname: supabaseHost }] : [{ protocol: "https", hostname: supabaseHost }],
    dangerouslyAllowLocalIP: isLocalSupabase,
  },
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
