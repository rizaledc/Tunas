import { NextResponse, type NextRequest } from "next/server";
import { getProfile } from "@/lib/auth";
import { anonymousReport, attendanceReport, monthlyReport, toPdf, type Report } from "@/lib/reports";
import { fileResponse, toXlsx, XLSX_TYPE } from "@/lib/excel";
import { audit } from "@/lib/audit";
import { addDays, todayStr } from "@/lib/date";

export async function GET(request: NextRequest) {
  const me = await getProfile();
  if (!me || me.status !== "active" || (me.role !== "admin" && me.role !== "superadmin")) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  }
  const sp = request.nextUrl.searchParams;
  const jenis = sp.get("jenis") ?? "bulanan";
  const format = sp.get("format") === "pdf" ? "pdf" : "xlsx";
  let report: Report;
  if (jenis === "anonim") {
    if (me.role !== "superadmin") return NextResponse.json({ error: "Khusus superadmin" }, { status: 403 });
    report = await anonymousReport(sp.get("dari") || addDays(todayStr(), -89), sp.get("sampai") || todayStr());
  } else if (jenis === "kehadiran") {
    report = await attendanceReport();
  } else {
    const month = /^\d{4}-\d{2}$/.test(sp.get("bulan") ?? "") ? sp.get("bulan")! : todayStr().slice(0, 7);
    report = await monthlyReport(month);
  }
  await audit(me.id, "report.export", `${jenis}.${format}`);
  const name = report.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (format === "pdf") return fileResponse(toPdf(report), `${name}.pdf`, "application/pdf");
  return fileResponse(await toXlsx(report.sheets), `${name}.xlsx`, XLSX_TYPE);
}
