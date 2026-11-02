import { SITE_URL } from "@/lib/site";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = SITE_URL;
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/app", "/admin", "/api", "/login/admin"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
