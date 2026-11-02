// Membuat akun superadmin pertama.
// Pemakaian: node --env-file=.env.local scripts/create-superadmin.mjs "Nama" email@domain.com "PasswordKuat123"
import { createClient } from "@supabase/supabase-js";

const [nama, email, password] = process.argv.slice(2);
if (!nama || !email || !password) {
  console.error('Pemakaian: node --env-file=.env.local scripts/create-superadmin.mjs "Nama" email password');
  process.exit(1);
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi.");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });
const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
if (error) {
  console.error("Gagal membuat user:", error.message);
  process.exit(1);
}
const { error: e2 } = await supabase.from("users").insert({ id: data.user.id, nama, email, role: "superadmin" });
if (e2) {
  console.error("Gagal menyimpan profil:", e2.message);
  process.exit(1);
}
console.log("Superadmin dibuat:", email);
