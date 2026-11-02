import { OG_SIZE, OG_TYPE, shareImage } from "@/lib/og";

export const alt = "Panduan Pemakaian";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function Image() {
  return shareImage({ title: "Panduan Pemakaian", subtitle: "Cara memakai SAHABAT ANAK langkah demi langkah, plus modul PDF." });
}
