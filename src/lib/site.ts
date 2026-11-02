/** URL publik situs; atur lewat NEXT_PUBLIC_SITE_URL di setiap lingkungan. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
