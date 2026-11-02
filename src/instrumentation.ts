/**
 * Dijalankan sekali saat server Next.js menyala.
 * Hosting bersama membatasi jumlah thread per akun, sementara libvips (sharp, dipakai
 * optimasi gambar Next.js dan kartu pratinjau tautan) default membuat thread sebanyak CPU.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const sharp = (await import("sharp")).default;
    sharp.concurrency(Number(process.env.VIPS_CONCURRENCY) || 2);
  } catch {
    // sharp opsional; abaikan bila tidak tersedia.
  }
}
