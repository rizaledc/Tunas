import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sahabatanaktunas.com";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/app", "/admin", "/api", "/login/admin"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
