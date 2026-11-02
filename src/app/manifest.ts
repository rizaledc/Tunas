import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SAHABAT ANAK",
    short_name: "SAHABAT ANAK",
    description: "Catat dan seimbangkan aktivitas digital anak bersama keluarga.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#f7f5f3",
    theme_color: "#940000",
    lang: "id",
    icons: [
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
