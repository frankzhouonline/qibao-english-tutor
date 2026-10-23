export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 32;
export const PBKDF2_ITERATIONS = 120000;
export const AUTH_FAILURE_LIMIT = 5;
export const AUTH_LOCK_MS = 30000;

const encoder = new TextEncoder();

function encodeBase64(bytes) {
  if (typeof btoa === "function") return btoa(String.fromCharCode(...bytes));
  return Buffer.from(bytes).toString("base64");
}

function decodeBase64(value) {
  if (typeof atob === "function") return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  return Uint8Array.from(Buffer.from(value, "base64"));
}

function randomBytes(length) {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

async function derive(secret, salt, iterations) {
  const key = await globalThis.crypto.subtle.importKey("raw", encoder.encode(secret), "PBKDF2", false, ["deriveBits"]);
  const bits = await globalThis.crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256
  );
  return new Uint8Array(bits);
}

export function validateParentPassword(password) {
  const value = String(password || "");
  if (value.length < PASSWORD_MIN_LENGTH || value.length > PASSWORD_MAX_LENGTH) return "密码需为 6–32 位。";
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return "密码需同时包含字母和数字。";
  return "";
}

export async function createCredential(secret, iterations = PBKDF2_ITERATIONS) {
  const salt = randomBytes(16);
  const hash = await derive(String(secret), salt, iterations);
  return { salt: encodeBase64(salt), hash: encodeBase64(hash), iterations };
}

export async function verifyCredential(secret, credential) {
  if (!credential?.salt || !credential?.hash || !credential?.iterations) return false;
  const actual = await derive(String(secret), decodeBase64(credential.salt), Number(credential.iterations));
  const expected = decodeBase64(credential.hash);
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) difference |= actual[index] ^ expected[index];
  return difference === 0;
}

export function createRecoveryCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(12);
  const raw = [...bytes].map((byte) => alphabet[byte % alphabet.length]).join("");
  return raw.match(/.{1,4}/g).join("-");
}

export function authLockRemaining(auth, now = Date.now()) {
  return Math.max(0, Number(auth?.lockedUntil || 0) - Number(now));
}

export function registerAuthFailure(auth, now = Date.now()) {
  const failures = Number(auth?.failedAttempts || 0) + 1;
  if (failures < AUTH_FAILURE_LIMIT) return { ...auth, failedAttempts: failures, lockedUntil: 0 };
  return { ...auth, failedAttempts: 0, lockedUntil: Number(now) + AUTH_LOCK_MS };
}

export function clearAuthFailures(auth) {
  return { ...auth, failedAttempts: 0, lockedUntil: 0 };
}
