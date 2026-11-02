import { OG_SIZE, OG_TYPE, shareImage } from "@/lib/og";

export const alt = "Undangan bergabung SAHABAT ANAK";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default async function Image() {
  return shareImage({
    kicker: "Undangan",
    title: "Anda diundang bergabung dengan SAHABAT ANAK",
    subtitle: "Daftar dengan kode undangan, lalu mulai mencatat aktivitas si kecil — cukup 1 menit sehari.",
  });
}
