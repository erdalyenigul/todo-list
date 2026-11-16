export function normalizeUsername(value: string): string {
  // Treat Turkish dotted/dotless I alike for this case-insensitive login ID.
  const username = value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/\u0307/g, "")
    .replace(/ı/g, "i");
  if (!/^[\p{L}\p{N}_.-]{3,32}$/u.test(username)) {
    throw new Error(
      "Kullanıcı adı 3–32 karakter olmalı; harf, rakam, nokta, tire veya alt çizgi içerebilir.",
    );
  }
  return username;
}

// Supabase Auth uses email/password. A deterministic internal address lets the
// UI accept Unicode usernames without exposing an email lookup or storing passwords.
// These internal addresses receive no email; administrators manage accounts.
export async function usernameToEmail(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(normalizeUsername(value));
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `u${hex.slice(0, 48)}@accounts.todo.invalid`;
}
