/** Kunci sessionStorage: pilihan hanya bertahan selama kunjungan (tab) ini; kunjungan baru selalu terang. */
export const THEME_KEY = "sa-theme";

/** Skrip kecil di <head> agar mode gelap langsung terpasang sebelum halaman tampil (tanpa kedip). */
export const THEME_SCRIPT = `try{if(sessionStorage.getItem("${THEME_KEY}")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;
