import { describe, expect, it } from "vitest";
import { emailError, emailTypoHint, generateStrongPassword, normalizeEmail, normalizePhone, passwordChecks, phoneError, validatePassword } from "../src/lib/validation";

describe("password kuat", () => {
  it("menolak password lemah dengan pesan yang menjelaskan", () => {
    expect(validatePassword("abc")).toMatch(/minimal 10/);
    expect(validatePassword("abcdefghij")).toMatch(/huruf besar/);
    expect(validatePassword("Abcdefghij")).toMatch(/angka/);
    expect(validatePassword("Abcdefghi1")).toMatch(/simbol/);
    expect(validatePassword("Password!123")).toMatch(/kata umum/);
    expect(validatePassword("Siti!Aminah9", { name: "Siti Aminah" })).toMatch(/nama/i);
    expect(validatePassword("Xx!567890123", { phone: "081234567890" })).toMatch(/nomor hp/i);
    expect(validatePassword("Aaaaa!1aaaaa")).toMatch(/kata umum/); // karakter berulang
  });
  it("menerima password kuat", () => {
    expect(validatePassword("Mangga!kancil47")).toBeNull();
    expect(passwordChecks("Mangga!kancil47").every((c) => c.ok)).toBe(true);
  });
  it("password buatan otomatis selalu lolos", () => {
    for (let i = 0; i < 200; i++) expect(validatePassword(generateStrongPassword())).toBeNull();
  });
});

describe("nomor HP", () => {
  it("hanya angka dan seluler Indonesia", () => {
    expect(normalizePhone("0812-3456-7890")).toBe("6281234567890");
    expect(normalizePhone("+62 812 3456 7890")).toBe("6281234567890");
    expect(normalizePhone("08abc12345678")).toBeNull();
    expect(normalizePhone("0212345678")).toBeNull(); // telepon rumah
    expect(normalizePhone("0812")).toBeNull();
    expect(phoneError("08x")).toMatch(/hanya boleh berisi angka/);
    expect(phoneError("")).toMatch(/wajib/);
  });
});

describe("email", () => {
  it("validasi format dan saran salah ketik", () => {
    expect(normalizeEmail("  Siti@Gmail.com ")).toBe("siti@gmail.com");
    expect(normalizeEmail("siti@gmail")).toBeNull();
    expect(normalizeEmail("siti@@gmail.com")).toBeNull();
    expect(normalizeEmail("siti..a@gmail.com")).toBeNull();
    expect(emailError("bukan email")).toMatch(/tidak valid/);
    expect(emailTypoHint("siti@gmial.com")).toBe("siti@gmail.com");
  });
});
