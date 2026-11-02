import "server-only";
import ExcelJS from "exceljs";

export type Sheet = { name: string; rows: Array<Record<string, unknown>> };

export async function toXlsx(sheets: Sheet[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "SAHABAT ANAK";
  for (const s of sheets) {
    const ws = wb.addWorksheet(s.name.slice(0, 31));
    const cols = Array.from(new Set(s.rows.flatMap((r) => Object.keys(r))));
    ws.columns = cols.map((c) => ({ header: c, key: c, width: Math.min(40, Math.max(12, c.length + 2)) }));
    for (const r of s.rows) {
      const row: Record<string, unknown> = {};
      for (const c of cols) {
        const v = r[c];
        row[c] = v !== null && typeof v === "object" ? JSON.stringify(v) : v;
      }
      ws.addRow(row);
    }
    ws.getRow(1).font = { bold: true };
  }
  return Buffer.from(await wb.xlsx.writeBuffer());
}

export async function readXlsx(buf: ArrayBuffer): Promise<Array<Record<string, string>>> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);
  const ws = wb.worksheets[0];
  if (!ws) return [];
  const headers: string[] = [];
  ws.getRow(1).eachCell((cell, col) => {
    headers[col] = String(cell.text ?? "").trim().toLowerCase().replace(/\s+/g, "_");
  });
  const out: Array<Record<string, string>> = [];
  ws.eachRow((row, idx) => {
    if (idx === 1) return;
    const rec: Record<string, string> = {};
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      if (headers[col]) rec[headers[col]] = String(cell.text ?? "").trim();
    });
    if (Object.values(rec).some(Boolean)) out.push(rec);
  });
  return out;
}

export function fileResponse(body: Buffer | string, filename: string, type: string) {
  return new Response(new Uint8Array(typeof body === "string" ? Buffer.from(body) : body), {
    headers: {
      "Content-Type": type,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

export const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
