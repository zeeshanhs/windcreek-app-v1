import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import type { SqliteConnection } from "../persistence/sqlite/connection";
import * as t from "../persistence/sqlite/schema";
import { userSchema, type User } from "../contracts";

export const COOKIE_NAME = "askpat_session";
const SESSION_SECONDS = 8 * 60 * 60;

function signingKey() {
  const value = process.env.ASKPAT_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("Set a 32-character or longer ASKPAT_SESSION_SECRET in the server environment.");
  return value;
}

function signature(token: string) { return createHmac("sha256", signingKey()).update(token).digest("base64url"); }
const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export function expectedOrigin() {
  const configured = process.env.ASKPAT_APP_ORIGIN ?? "http://localhost:3000";
  const url = new URL(configured);
  if (!(["http:", "https:"].includes(url.protocol)) || url.pathname !== "/" || url.search || url.hash) throw new Error("ASKPAT_APP_ORIGIN must be an HTTP(S) origin.");
  return url.origin;
}

export function validMutationOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  return origin === expectedOrigin() && (!fetchSite || fetchSite === "same-origin");
}

export function createSession(connection: SqliteConnection, userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_SECONDS * 1000).toISOString();
  connection.db.insert(t.demoSessions).values({ tokenHash: tokenHash(token), userId, expiresAt, revokedAt: null }).run();
  return { cookie: `${token}.${signature(token)}`, expiresAt };
}

function cookieValue(request: Request) {
  const header = request.headers.get("cookie") ?? "";
  const value = header.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`));
  return value?.slice(COOKIE_NAME.length + 1) ?? null;
}

export function readSession(connection: SqliteConnection, request: Request): { user: User; expiresAt: string; tokenHash: string } | null {
  const raw = cookieValue(request);
  if (!raw) return null;
  const [token, mac, extra] = raw.split(".");
  if (!token || !mac || extra || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const expected = signature(token);
  const actualBytes = Buffer.from(mac);
  const expectedBytes = Buffer.from(expected);
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) return null;
  const row = connection.db.select().from(t.demoSessions).where(and(eq(t.demoSessions.tokenHash, tokenHash(token)), isNull(t.demoSessions.revokedAt))).get();
  if (!row || Date.parse(row.expiresAt) <= Date.now()) return null;
  const user = connection.db.select().from(t.users).where(eq(t.users.id, row.userId)).get();
  return user ? { user: userSchema.parse(user), expiresAt: row.expiresAt, tokenHash: row.tokenHash } : null;
}

export function revokeSession(connection: SqliteConnection, sessionHash: string) {
  connection.db.update(t.demoSessions).set({ revokedAt: new Date().toISOString() }).where(eq(t.demoSessions.tokenHash, sessionHash)).run();
}

export function sessionCookie(value: string, expiresAt: string) {
  const secure = expectedOrigin().startsWith("https://");
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_SECONDS}; Expires=${new Date(expiresAt).toUTCString()}${secure ? "; Secure" : ""}`;
}

export function expiredSessionCookie() {
  const secure = expectedOrigin().startsWith("https://");
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secure ? "; Secure" : ""}`;
}
