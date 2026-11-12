export const SESSION_COOKIE_NAME = "banwaan_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

const textEncoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string): Uint8Array | null {
  try {
    const padded = input.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((input.length + 3) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sha256Bytes(value: string): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(value));
  return new Uint8Array(digest);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.AUTH_USERNAME &&
      process.env.AUTH_PASSWORD &&
      process.env.AUTH_SECRET
  );
}

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const expectedUser = process.env.AUTH_USERNAME;
  const expectedPass = process.env.AUTH_PASSWORD;
  if (!expectedUser || !expectedPass) return false;

  const [uA, uB, pA, pB] = await Promise.all([
    sha256Bytes(username.trim()),
    sha256Bytes(expectedUser.trim()),
    sha256Bytes(password),
    sha256Bytes(expectedPass),
  ]);

  return constantTimeEqual(uA, uB) && constantTimeEqual(pA, pB);
}

export async function createSessionToken(username: string): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }

  const payload = {
    u: username,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const payloadB64 = toBase64Url(textEncoder.encode(JSON.stringify(payload)));
  const key = await getHmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, textEncoder.encode(payloadB64));
  const sigB64 = toBase64Url(new Uint8Array(sig));

  return `${payloadB64}.${sigB64}`;
}

export async function verifySessionToken(
  token: string | undefined
): Promise<{ valid: boolean; username?: string }> {
  if (!token) return { valid: false };
  const secret = process.env.AUTH_SECRET;
  if (!secret) return { valid: false };

  const dotIdx = token.indexOf(".");
  if (dotIdx <= 0) return { valid: false };

  const payloadB64 = token.slice(0, dotIdx);
  const sigB64 = token.slice(dotIdx + 1);

  const sigBytes = fromBase64Url(sigB64);
  if (!sigBytes) return { valid: false };

  try {
    const key = await getHmacKey(secret);
    const sigBuffer = new Uint8Array(sigBytes).buffer;
    const isValidSig = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBuffer,
      textEncoder.encode(payloadB64)
    );
    if (!isValidSig) return { valid: false };

    const payloadBytes = fromBase64Url(payloadB64);
    if (!payloadBytes) return { valid: false };

    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as {
      u?: string;
      exp?: number;
    };

    if (!payload.u || !payload.exp) return { valid: false };
    if (payload.exp < Math.floor(Date.now() / 1000)) return { valid: false };

    return { valid: true, username: payload.u };
  } catch {
    return { valid: false };
  }
}

