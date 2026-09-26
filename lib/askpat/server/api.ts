import { existsSync } from "node:fs";
import { z, ZodError } from "zod";
import { eq } from "drizzle-orm";
import { databaseFile, openSqlite } from "../persistence/sqlite/connection";
import { SqliteAskPatRepository, RepositoryConflictError, RepositoryNotFoundError } from "../persistence/sqlite/repository";
import { resetBaseline } from "../persistence/sqlite/seed";
import { sourceRecords } from "../fixtures";
import type { AskPatRepository } from "../contracts/repository";
import * as t from "../persistence/sqlite/schema";
import { createSession, expiredSessionCookie, readSession, revokeSession, sessionCookie, validMutationOrigin } from "./auth";

class ApiFailure extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) { super(message); }
}
const operationId = z.string().uuid();
const shortId = z.string().regex(/^[A-Za-z0-9-]{1,100}$/);
const textField = (max: number) => z.string().trim().min(1).max(max);
const loginSchema = z.strictObject({ email: z.email().max(254).transform((value) => value.toLowerCase()), password: z.string().min(1).max(128) });
const createOrderSchema = z.strictObject({ issueId: shortId, locationId: shortId, remark: textField(2000), operationId });
const remarkSchema = z.strictObject({ text: textField(2000), operationId });
const closeSchema = z.strictObject({ note: textField(2000), expectedVersion: z.number().int().positive(), operationId });
const linkedSchema = z.strictObject({ orderId: shortId, operationId });
const generalSchema = z.strictObject({ title: textField(56), operationId });
const equipmentSchema = z.strictObject({ promptMessageId: shortId, useNewUnit: z.boolean(), operationId });
const resetSchema = z.strictObject({ confirmation: z.literal("RESET_DEMO") });
const listSchema = z.object({ limit: z.coerce.number().int().min(1).max(50).default(50), cursor: z.string().max(500).optional(), q: z.string().trim().max(100).optional() });
const photoMax = 10 * 1024 * 1024;
const multipartMax = photoMax + 32 * 1024;
const noStore = { "Cache-Control": "no-store" };

function success(data: unknown, status = 200, headers?: HeadersInit) {
  return Response.json({ data }, { status, headers: { ...noStore, ...headers } });
}
function failure(error: ApiFailure) {
  return Response.json({ error: { code: error.code, message: error.message, ...(error.details === undefined ? {} : { details: error.details }) } }, { status: error.status, headers: noStore });
}
function notFound(): never { throw new ApiFailure(404, "NOT_FOUND", "This item is unavailable to your account."); }
function validId(value: string | undefined) { return shortId.parse(value); }

async function boundedBody(request: Request, maximum: number): Promise<Uint8Array> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maximum) throw new ApiFailure(413, "FILE_TOO_LARGE", "Request exceeds the allowed size.");
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maximum) { await reader.cancel(); throw new ApiFailure(413, "FILE_TOO_LARGE", "Request exceeds the allowed size."); }
    chunks.push(value);
  }
  const result = new Uint8Array(size);
  let position = 0;
  for (const chunk of chunks) { result.set(chunk, position); position += chunk.byteLength; }
  return result;
}

async function jsonBody(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new ApiFailure(415, "UNSUPPORTED_MEDIA_TYPE", "Send JSON for this operation.");
  const bytes = await boundedBody(request, 32 * 1024);
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new ApiFailure(422, "VALIDATION_ERROR", "Malformed JSON request."); }
}

async function sendBody(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data;")) throw new ApiFailure(415, "UNSUPPORTED_MEDIA_TYPE", "Send multipart form data for a message.");
  const bytes = await boundedBody(request, multipartMax);
  let form: FormData;
  try { form = await new Request("http://localhost/form", { method: "POST", headers: { "content-type": request.headers.get("content-type")! }, body: new Uint8Array(bytes) }).formData(); }
  catch { throw new ApiFailure(422, "VALIDATION_ERROR", "Malformed multipart request."); }
  const allowed = new Set(["operationId", "text", "photo", "description"]);
  for (const key of form.keys()) if (!allowed.has(key) || form.getAll(key).length > 1) throw new ApiFailure(422, "VALIDATION_ERROR", "Unexpected or repeated form field.");
  const parsed = z.strictObject({ operationId, text: z.string().trim().max(4000), description: z.string().max(500).optional() }).parse({ operationId: form.get("operationId"), text: form.get("text"), description: form.has("description") ? form.get("description") : undefined });
  const file = form.get("photo");
  if (file !== null && !(file instanceof File)) throw new ApiFailure(422, "VALIDATION_ERROR", "Photo field must contain a file.");
  if (!parsed.text && !file) throw new ApiFailure(422, "VALIDATION_ERROR", "Add a message or photo.");
  if (!file) return { text: parsed.text, operationId: parsed.operationId };
  if (!file.name.trim() || file.name.length > 255 || /[/\\\u0000-\u001f]/.test(file.name)) throw new ApiFailure(422, "VALIDATION_ERROR", "Photo file name is invalid.");
  if (!(["image/png", "image/jpeg"].includes(file.type))) throw new ApiFailure(415, "UNSUPPORTED_MEDIA_TYPE", "Choose one PNG or JPEG image.");
  if (file.size < 1 || file.size > photoMax) throw new ApiFailure(413, "FILE_TOO_LARGE", "Choose one PNG or JPEG up to 10 MB.");
  const fileBytes = Buffer.from(await file.arrayBuffer());
  const isPng = fileBytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isJpeg = fileBytes.length >= 4 && fileBytes[0] === 255 && fileBytes[1] === 216 && fileBytes[2] === 255 && fileBytes.at(-2) === 255 && fileBytes.at(-1) === 217;
  if (!(file.type === "image/png" ? isPng : isJpeg)) throw new ApiFailure(415, "UNSUPPORTED_MEDIA_TYPE", "Image content does not match its type.");
  return { text: parsed.text, operationId: parsed.operationId, photo: { name: file.name, mimeType: file.type as "image/png" | "image/jpeg", description: parsed.description ?? "", bytes: fileBytes } };
}

function queryObject(request: Request) { return Object.fromEntries(new URL(request.url).searchParams.entries()); }
function messagePage(repo: AskPatRepository, ownerId: string, chatId: string, after = 0) {
  const chat = repo.getChat(ownerId, chatId, after, 50);
  if (!chat) notFound();
  const last = chat.messages.at(-1)?.ordinal ?? after;
  return { chat, nextCursor: last < chat.messageCount ? String(last) : null, hasMore: last < chat.messageCount };
}

/** The catch-all route delegates here, keeping request/auth behavior directly testable. */
export async function handleAskPat(request: Request, path: string[]): Promise<Response> {
  try {
    const method = request.method.toUpperCase();
    if (!["GET", "POST", "DELETE"].includes(method)) throw new ApiFailure(405, "METHOD_NOT_ALLOWED", "Method is unavailable.");
    if (method !== "GET" && !validMutationOrigin(request)) throw new ApiFailure(403, "FORBIDDEN_ORIGIN", "Use the same-origin application to make this change.");
    if (!existsSync(databaseFile())) throw new ApiFailure(503, "SETUP_REQUIRED", "Run npm run db:setup before using the API.");
    const connection = openSqlite();
    try {
      const repo = new SqliteAskPatRepository(connection);
      if (method === "POST" && path.join("/") === "session") {
        const body = loginSchema.parse(await jsonBody(request));
        const user = repo.listUsers().find((item) => item.email.toLowerCase() === body.email);
        if (!user || body.password !== "demo") throw new ApiFailure(401, "INVALID_CREDENTIALS", "Unable to sign in. Check your email and password.");
        const session = createSession(connection, user.id);
        return success({ user, expiresAt: session.expiresAt }, 200, { "Set-Cookie": sessionCookie(session.cookie, session.expiresAt) });
      }
      const session = readSession(connection, request);
      if (!session) throw new ApiFailure(401, "UNAUTHENTICATED", "Sign in to continue.");
      const ownerId = session.user.id;
      if (method === "GET" && path.join("/") === "session") return success({ user: session.user, expiresAt: session.expiresAt, users: repo.listUsers(), issues: repo.listIssues(), locations: repo.listLocations(), resetGeneration: connection.db.select().from(t.resetGeneration).where(eq(t.resetGeneration.id, 1)).get()?.generation ?? 0 });
      if (method === "DELETE" && path.join("/") === "session") { revokeSession(connection, session.tokenHash); return new Response(null, { status: 204, headers: { ...noStore, "Set-Cookie": expiredSessionCookie() } }); }
      if (method === "GET" && path.length === 1 && path[0] === "orders") {
        const q = listSchema.extend({ status: z.enum(["open", "closed"]).optional(), sort: z.enum(["newest", "oldest"]).optional() }).strict().parse(queryObject(request));
        return success(repo.pageOrders({ limit: q.limit, cursor: q.cursor, status: q.status, query: q.q, sort: q.sort }));
      }
      if (method === "GET" && path.length === 2 && path[0] === "orders") return success(repo.getOrder(validId(path[1])) ?? notFound());
      if (method === "POST" && path.join("/") === "orders") {
        const body = createOrderSchema.parse(await jsonBody(request));
        const replay = repo.getReceipt(ownerId, body.operationId) !== null;
        return success(repo.createOrder({ ...body, requesterId: ownerId }), replay ? 200 : 201);
      }
      if (method === "POST" && path.length === 3 && path[0] === "orders" && path[2] === "remarks") {
        const body = remarkSchema.parse(await jsonBody(request));
        return success(repo.addRemark({ orderId: validId(path[1]), actorId: ownerId, ...body }));
      }
      if (method === "POST" && path.length === 3 && path[0] === "orders" && path[2] === "close") {
        const id = validId(path[1]); const body = closeSchema.parse(await jsonBody(request));
        try { return success(repo.closeOrder({ orderId: id, actorId: ownerId, ...body })); }
        catch (error) { if (error instanceof RepositoryConflictError && !error.message.startsWith("Operation ID")) throw new ApiFailure(409, "VERSION_CONFLICT", "Order changed or is already closed.", { currentOrder: repo.getOrder(id) }); throw error; }
      }
      if (method === "GET" && path.join("/") === "chats") {
        const q = listSchema.extend({ kind: z.enum(["general", "linked"]).optional() }).strict().parse(queryObject(request));
        return success(repo.pageChats(ownerId, { limit: q.limit, cursor: q.cursor, kind: q.kind, query: q.q }));
      }
      if (method === "GET" && path.length === 2 && path[0] === "chats") return success(messagePage(repo, ownerId, validId(path[1])));
      if (method === "GET" && path.length === 3 && path[0] === "chats" && path[2] === "messages") {
        const q = z.object({ after: z.coerce.number().int().min(0).default(0) }).strict().parse(queryObject(request));
        const page = messagePage(repo, ownerId, validId(path[1]), q.after);
        return success({ items: page.chat.messages, nextCursor: page.nextCursor, hasMore: page.hasMore });
      }
      if (method === "POST" && path.join("/") === "chats/linked") {
        const body = linkedSchema.parse(await jsonBody(request));
        return success(repo.getOrCreateLinkedChat(ownerId, body.orderId, body.operationId));
      }
      if (method === "POST" && path.join("/") === "chats") {
        const body = generalSchema.parse(await jsonBody(request));
        const replay = repo.getReceipt(ownerId, body.operationId) !== null;
        return success(repo.createGeneralChat(ownerId, body.title, body.operationId), replay ? 200 : 201);
      }
      if (method === "POST" && path.join("/") === "chats/new/messages") {
        const body = await sendBody(request);
        const sent = repo.sendDemoMessage(ownerId, { ...body, chatId: null });
        return success({ chatId: sent.chatId, messageId: sent.messageId, answerId: `${sent.messageId}-answer`, replayed: sent.replayed, messages: sent.chat.messages.filter((message) => message.id === sent.messageId || message.id === `${sent.messageId}-answer`) }, sent.replayed ? 200 : 201);
      }
      if (method === "POST" && path.length === 3 && path[0] === "chats" && path[2] === "messages") {
        const body = await sendBody(request);
        const sent = repo.sendDemoMessage(ownerId, { ...body, chatId: validId(path[1]) });
        return success({ chatId: sent.chatId, messageId: sent.messageId, answerId: `${sent.messageId}-answer`, replayed: sent.replayed, messages: sent.chat.messages.filter((message) => message.id === sent.messageId || message.id === `${sent.messageId}-answer`) }, sent.replayed ? 200 : 201);
      }
      if (method === "POST" && path.length === 3 && path[0] === "chats" && path[2] === "equipment-choice") {
        const body = equipmentSchema.parse(await jsonBody(request));
        return success(repo.chooseEquipment(ownerId, validId(path[1]), body.promptMessageId, body.useNewUnit, body.operationId));
      }
      if (method === "POST" && path.length === 5 && path[0] === "chats" && path[2] === "faults" && path[4] === "retry") return success(repo.retryUnknownFault(ownerId, validId(path[1]), validId(path[3])));
      if (method === "GET" && path.length === 2 && path[0] === "photos") {
        const id = validId(path[1]); const metadata = repo.getPhotoMetadata(ownerId, id); const bytes = repo.getPhotoBytes(ownerId, id);
        if (!metadata || !bytes) notFound();
        return new Response(new Uint8Array(bytes), { status: 200, headers: { ...noStore, "Content-Type": metadata.mimeType, "Content-Length": String(bytes.length), "Content-Disposition": "inline", "X-Content-Type-Options": "nosniff" } });
      }
      if (method === "GET" && path.length === 2 && path[0] === "references") {
        const resolved = repo.getReference(ownerId, validId(path[1]));
        if (!resolved) notFound();
        const source = resolved.source && Object.hasOwn(sourceRecords, resolved.source.id) ? sourceRecords[resolved.source.id as keyof typeof sourceRecords] : null;
        return success({ ...resolved, source });
      }
      if (method === "POST" && path.join("/") === "reset") {
        resetSchema.parse(await jsonBody(request));
        resetBaseline(connection);
        return success({ reset: true, sessionEnded: true }, 200, { "Set-Cookie": expiredSessionCookie() });
      }
      notFound();
    } finally { connection.close(); }
  } catch (error) {
    if (error instanceof ApiFailure) return failure(error);
    if (error instanceof ZodError) return failure(new ApiFailure(422, "VALIDATION_ERROR", "Invalid request payload.", error.issues.map((issue) => ({ path: issue.path, message: issue.message }))));
    if (error instanceof RepositoryNotFoundError) return failure(new ApiFailure(404, "NOT_FOUND", "This item is unavailable to your account."));
    if (error instanceof RepositoryConflictError) return failure(new ApiFailure(409, "OPERATION_CONFLICT", error.message));
    if (error instanceof Error && error.message === "Invalid page cursor.") return failure(new ApiFailure(422, "VALIDATION_ERROR", error.message));
    console.error("AskPat API failure", error);
    return failure(new ApiFailure(500, "INTERNAL_ERROR", "The demo operation could not be completed."));
  }
}
