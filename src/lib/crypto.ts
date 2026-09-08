const enc = new TextEncoder();

export async function hashPassword(password: string, salt: string): Promise<string> {
  const data = enc.encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function randomSalt(): string {
  return crypto.randomUUID().replace(/-/g, "");
}
