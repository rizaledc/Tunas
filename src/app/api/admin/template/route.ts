import { NextResponse, type NextRequest } from "next/server";
import { getProfile } from "@/lib/auth";
import { fileResponse, toXlsx, XLSX_TYPE } from "@/lib/excel";

export async function GET(request: NextRequest) {
  const me = await getProfile();
  if (!me || (me.role !== "admin" && me.role !== "superadmin")) return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  const jenis = request.nextUrl.searchParams.get("jenis");
  if (jenis === "logbook") {
    const buf = await toXlsx([
      {
        name: "Logbook",
        rows: [
          { no_hp: "081234567890", anak: "Dika", tanggal: "2026-06-01", jenis: "digital", kategori: "Game", durasi: 60, didampingi: "tidak", catatan: "" },
          { no_hp: "081234567890", anak: "Dika", tanggal: "2026-06-01", jenis: "positif", kategori: "Merawat lele", durasi: 30, didampingi: "", catatan: "memberi makan lele" },
        ],
      },
    ]);
    return fileResponse(buf, "template-impor-logbook.xlsx", XLSX_TYPE);
  }
  const buf = await toXlsx([{ name: "Anggota", rows: [{ nama: "Bu Siti", no_hp: "081234567890", email: "", rt: "7" }] }]);
  return fileResponse(buf, "template-impor-anggota.xlsx", XLSX_TYPE);
}
