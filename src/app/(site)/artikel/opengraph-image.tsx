import { OG_SIZE, OG_TYPE, shareImage } from "@/lib/og";

export const alt = "Artikel & Tips";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function Image() {
  return shareImage({ title: "Artikel & Tips", subtitle: "Tips digital parenting untuk keluarga." });
}
