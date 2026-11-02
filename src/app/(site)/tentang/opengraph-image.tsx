import { OG_SIZE, OG_TYPE, shareImage } from "@/lib/og";

export const alt = "Tentang SAHABAT ANAK";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function Image() {
  return shareImage({ title: "Tentang SAHABAT ANAK", subtitle: "Makna logo, latar belakang, dan alur program." });
}
