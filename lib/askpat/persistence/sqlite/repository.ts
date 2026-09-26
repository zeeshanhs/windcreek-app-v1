import { createHash } from "node:crypto";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import {
  addRemarkInputSchema, appendMessageInputSchema, chatDetailSchema, chatListSchema, citationPageSchema,
  closeOrderInputSchema, createOrderInputSchema, faultInputSchema, faultSchema, generalChatInputSchema, issueSchema, linkedChatInputSchema, locationSchema, messageSchema,
  orderDetailSchema, orderListSchema, photoMetadataSchema, photoUploadMetadataSchema, receiptSchema, referenceSchema,
  richContentSchema, scenarioMetadataSchema, userSchema,
  type ChatDetail, type ChatList, type Fault, type OrderDetail, type OrderList, type PhotoMetadata,
} from "../../contracts";
import type { AskPatRepository } from "../../contracts/repository";
import type { SqliteConnection } from "./connection";
import * as t from "./schema";
import { demoAnswer } from "../../responses";
import type { Chat as BrowserChat, Order as BrowserOrder, Reference as BrowserReference } from "../../fixtures";

export class RepositoryConflictError extends Error {}
export class RepositoryNotFoundError extends Error {}

type Transaction = Parameters<Parameters<SqliteConnection["db"]["transaction"]>[0]>[0];
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const encodeCursor = (at: string, id: string) => Buffer.from(JSON.stringify({ at, id })).toString("base64url");
function decodeCursor(value: string): { at: string; id: string } {
  try {
    const decoded: unknown = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (decoded && typeof decoded === "object" && "at" in decoded && "id" in decoded && typeof decoded.at === "string" && typeof decoded.id === "string" && decoded.id.length > 0 && Number.isFinite(Date.parse(decoded.at))) return { at: decoded.at, id: decoded.id };
  } catch { /* Invalid cursor. */ }
  throw new Error("Invalid page cursor.");
}
const nextTime = (current: string, kind: "create" | "close" | "other") => {
  const floor = Date.parse(kind === "close" ? "2026-09-24T10:35:00Z" : kind === "create" ? "2026-09-24T10:31:00Z" : "2026-09-24T10:30:00Z");
  return new Date(Math.max(Date.parse(current) + 60_000, floor)).toISOString();
};

export class SqliteAskPatRepository implements AskPatRepository {
  constructor(private readonly connection: SqliteConnection) {}

  private runtime(tx: Transaction, kind: "create" | "close" | "other", useOrder = false, useSequence = false) {
    const row = tx.select().from(t.demoRuntime).where(eq(t.demoRuntime.id, 1)).get();
    if (!row) throw new Error("Database is not seeded. Run npm run db:setup.");
    const at = nextTime(row.clock, kind);
    tx.update(t.demoRuntime).set({ clock: at, nextOrderNumber: row.nextOrderNumber + Number(useOrder), nextSequence: row.nextSequence + Number(useSequence) }).where(eq(t.demoRuntime.id, 1)).run();
    return { at, orderNumber: row.nextOrderNumber, sequence: row.nextSequence };
  }

  private replay(tx: Transaction, operationId: string, actorId: string, kind: string, requestHash: string) {
    const row = tx.select().from(t.operationReceipts).where(eq(t.operationReceipts.operationId, operationId)).get();
    if (!row) return null;
    if (row.actorId !== actorId || row.kind !== kind || row.requestHash !== requestHash) throw new RepositoryConflictError("Operation ID was already used for different input.");
    return row;
  }

  private receipt(tx: Transaction, operationId: string, actorId: string, kind: string, requestHash: string, resultId: string, at: string, secondaryId?: string) {
    tx.insert(t.operationReceipts).values({ operationId, actorId, kind, requestHash, resultId, secondaryId: secondaryId ?? null, at }).run();
  }

  listUsers() { return this.connection.db.select().from(t.users).all().map((row) => userSchema.parse(row)); }
  listIssues() { return this.connection.db.select().from(t.issues).all().map((row) => issueSchema.parse(row)); }
  listLocations() { return this.connection.db.select().from(t.locations).all().map((row) => locationSchema.parse(row)); }

  private orderList(row: typeof t.orders.$inferSelect): OrderList {
    return orderListSchema.parse({ id: row.id, issueId: row.issueId, locationId: row.locationId, requesterId: row.requesterId,
      createdAt: row.createdAt, status: row.status, version: row.version, equipment: row.equipment,
      closure: row.closureActorId !== null && row.closureAt !== null && row.closureNote !== null ? { actorId: row.closureActorId, at: row.closureAt, note: row.closureNote } : null });
  }
  listOrders() { return this.connection.db.select().from(t.orders).orderBy(desc(t.orders.createdAt), desc(t.orders.id)).all().map((row) => this.orderList(row)); }
  pageOrders(options: { limit: number; cursor?: string; status?: "open" | "closed"; query?: string; sort?: "newest" | "oldest" }) {
    const direction = options.sort === "oldest" ? "asc" : "desc";
    const cursor = options.cursor ? decodeCursor(options.cursor) : null;
    const conditions = ["1=1"];
    const values: string[] = [];
    if (options.status) { conditions.push("o.status = ?"); values.push(options.status); }
    if (options.query) { conditions.push("(o.id like ? or i.label like ? or l.label like ?)"); values.push(...Array(3).fill(`%${options.query}%`)); }
    if (cursor) { conditions.push(`(o.created_at ${direction === "desc" ? "<" : ">"} ? or (o.created_at = ? and o.id ${direction === "desc" ? "<" : ">"} ?))`); values.push(cursor.at, cursor.at, cursor.id); }
    const rows = this.connection.client.prepare(`select o.id from orders o join issues i on i.id=o.issue_id join locations l on l.id=o.location_id where ${conditions.join(" and ")} order by o.created_at ${direction}, o.id ${direction} limit ?`).all(...values, options.limit + 1) as { id: string }[];
    const page = rows.slice(0, options.limit).map(({ id }) => this.orderList(this.connection.db.select().from(t.orders).where(eq(t.orders.id, id)).get()!));
    const last = page.at(-1);
    return { items: page, nextCursor: rows.length > options.limit && last ? encodeCursor(last.createdAt, last.id) : null, hasMore: rows.length > options.limit };
  }
  getOrder(id: string): OrderDetail | null {
    const row = this.connection.db.select().from(t.orders).where(eq(t.orders.id, id)).get();
    if (!row) return null;
    const remarks = this.connection.db.select().from(t.orderRemarks).where(eq(t.orderRemarks.orderId, id)).orderBy(asc(t.orderRemarks.ordinal)).all().map((item) => ({ id: item.id, authorId: item.authorId, text: item.text, at: item.at, ordinal: item.ordinal }));
    const events = this.connection.db.select().from(t.orderEvents).where(eq(t.orderEvents.orderId, id)).orderBy(asc(t.orderEvents.ordinal)).all().map((item) => ({ id: item.id, kind: item.kind, actorId: item.actorId, at: item.at, text: item.text, ordinal: item.ordinal }));
    return orderDetailSchema.parse({ ...this.orderList(row), remarks, events });
  }

  createOrder(raw: Parameters<AskPatRepository["createOrder"]>[0]): OrderDetail {
    const input = createOrderInputSchema.parse(raw);
    const requestHash = hash(input);
    const id = this.connection.db.transaction((tx) => {
      const prior = this.replay(tx, input.operationId, input.requesterId, "create-order", requestHash);
      if (prior) return prior.resultId;
      const { at, orderNumber } = this.runtime(tx, "create", true);
      const id = String(orderNumber);
      tx.insert(t.orders).values({ id, issueId: input.issueId, locationId: input.locationId, requesterId: input.requesterId, createdAt: at, status: "open", version: 1, equipment: null, closureActorId: null, closureAt: null, closureNote: null }).run();
      tx.insert(t.orderRemarks).values({ id: `${id}-R1`, orderId: id, ordinal: 1, authorId: input.requesterId, at, text: input.remark }).run();
      tx.insert(t.orderEvents).values({ id: `${id}-E1`, orderId: id, ordinal: 1, kind: "created", actorId: input.requesterId, at, text: null }).run();
      this.receipt(tx, input.operationId, input.requesterId, "create-order", requestHash, id, at);
      return id;
    }, { behavior: "immediate" });
    return this.getOrder(id)!;
  }

  addRemark(raw: Parameters<AskPatRepository["addRemark"]>[0]): OrderDetail {
    const input = addRemarkInputSchema.parse(raw);
    const requestHash = hash(input);
    this.connection.db.transaction((tx) => {
      if (this.replay(tx, input.operationId, input.actorId, "add-remark", requestHash)) return;
      const order = tx.select().from(t.orders).where(eq(t.orders.id, input.orderId)).get();
      if (!order) throw new RepositoryNotFoundError("Order is unavailable.");
      if (order.status !== "open") throw new RepositoryConflictError("Order is closed.");
      const { at } = this.runtime(tx, "other");
      const remarkOrdinal = (tx.select({ n: sql<number>`coalesce(max(${t.orderRemarks.ordinal}), 0)` }).from(t.orderRemarks).where(eq(t.orderRemarks.orderId, input.orderId)).get()?.n ?? 0) + 1;
      const eventOrdinal = (tx.select({ n: sql<number>`coalesce(max(${t.orderEvents.ordinal}), 0)` }).from(t.orderEvents).where(eq(t.orderEvents.orderId, input.orderId)).get()?.n ?? 0) + 1;
      const remarkId = `${input.orderId}-R${remarkOrdinal}`;
      tx.insert(t.orderRemarks).values({ id: remarkId, orderId: input.orderId, ordinal: remarkOrdinal, authorId: input.actorId, at, text: input.text }).run();
      tx.insert(t.orderEvents).values({ id: `${input.orderId}-E${eventOrdinal}`, orderId: input.orderId, ordinal: eventOrdinal, kind: "remark", actorId: input.actorId, at, text: input.text }).run();
      tx.update(t.orders).set({ version: order.version + 1 }).where(eq(t.orders.id, input.orderId)).run();
      this.receipt(tx, input.operationId, input.actorId, "add-remark", requestHash, remarkId, at);
    }, { behavior: "immediate" });
    return this.getOrder(input.orderId)!;
  }

  closeOrder(raw: Parameters<AskPatRepository["closeOrder"]>[0]): OrderDetail {
    const input = closeOrderInputSchema.parse(raw);
    const requestHash = hash(input);
    this.connection.db.transaction((tx) => {
      if (this.replay(tx, input.operationId, input.actorId, "close-order", requestHash)) return;
      const order = tx.select().from(t.orders).where(eq(t.orders.id, input.orderId)).get();
      if (!order) throw new RepositoryNotFoundError("Order is unavailable.");
      if (order.status === "closed" || order.version !== input.expectedVersion) throw new RepositoryConflictError("Order changed or is already closed.");
      const { at } = this.runtime(tx, "close");
      const eventOrdinal = (tx.select({ n: sql<number>`coalesce(max(${t.orderEvents.ordinal}), 0)` }).from(t.orderEvents).where(eq(t.orderEvents.orderId, input.orderId)).get()?.n ?? 0) + 1;
      tx.update(t.orders).set({ status: "closed", version: order.version + 1, closureActorId: input.actorId, closureAt: at, closureNote: input.note }).where(eq(t.orders.id, input.orderId)).run();
      tx.insert(t.orderEvents).values({ id: `${input.orderId}-E${eventOrdinal}`, orderId: input.orderId, ordinal: eventOrdinal, kind: "closed", actorId: input.actorId, at, text: input.note }).run();
      this.receipt(tx, input.operationId, input.actorId, "close-order", requestHash, input.orderId, at);
    }, { behavior: "immediate" });
    return this.getOrder(input.orderId)!;
  }

  private chatList(row: typeof t.chats.$inferSelect): ChatList {
    const messageCount = this.connection.db.select({ n: sql<number>`count(*)` }).from(t.messages).where(eq(t.messages.chatId, row.id)).get()?.n ?? 0;
    return chatListSchema.parse({ ...row, messageCount });
  }
  listChats(ownerId: string) { return this.connection.db.select().from(t.chats).where(eq(t.chats.ownerId, ownerId)).orderBy(desc(t.chats.updatedAt), desc(t.chats.id)).all().map((row) => this.chatList(row)); }
  pageChats(ownerId: string, options: { limit: number; cursor?: string; kind?: "general" | "linked"; query?: string }) {
    const cursor = options.cursor ? decodeCursor(options.cursor) : null;
    const conditions = ["owner_id = ?"];
    const values: string[] = [ownerId];
    if (options.kind) conditions.push(`order_id is ${options.kind === "general" ? "null" : "not null"}`);
    if (options.query) { conditions.push("(title like ? or equipment like ? or order_id like ?)"); values.push(...Array(3).fill(`%${options.query}%`)); }
    if (cursor) { conditions.push("(updated_at < ? or (updated_at = ? and id < ?))"); values.push(cursor.at, cursor.at, cursor.id); }
    const rows = this.connection.client.prepare(`select id from chats where ${conditions.join(" and ")} order by updated_at desc, id desc limit ?`).all(...values, options.limit + 1) as { id: string }[];
    const page = rows.slice(0, options.limit).map(({ id }) => this.chatList(this.connection.db.select().from(t.chats).where(and(eq(t.chats.id, id), eq(t.chats.ownerId, ownerId))).get()!));
    const last = page.at(-1);
    return { items: page, nextCursor: rows.length > options.limit && last ? encodeCursor(last.updatedAt, last.id) : null, hasMore: rows.length > options.limit };
  }

  getChat(ownerId: string, chatId: string, afterOrdinal = 0, limit?: number): ChatDetail | null {
    const row = this.connection.db.select().from(t.chats).where(and(eq(t.chats.id, chatId), eq(t.chats.ownerId, ownerId))).get();
    if (!row) return null;
    const messageRows = limit === undefined
      ? this.connection.db.select().from(t.messages).where(eq(t.messages.chatId, chatId)).orderBy(asc(t.messages.ordinal)).all()
      : this.connection.db.select().from(t.messages).where(and(eq(t.messages.chatId, chatId), sql`${t.messages.ordinal} > ${afterOrdinal}`)).orderBy(asc(t.messages.ordinal)).limit(limit).all();
    const messages = messageRows.map((message) => {
      const refRows = this.connection.db.select().from(t.messageReferences).where(eq(t.messageReferences.messageId, message.id)).orderBy(asc(t.messageReferences.ordinal)).all();
      const references = refRows.map((ref) => {
        const cited = ref.citationId === null ? null : this.connection.db.select().from(t.citationPages).where(eq(t.citationPages.id, ref.citationId)).get();
        return referenceSchema.parse({ id: ref.id, ordinal: ref.ordinal, kind: ref.kind, label: ref.label, locator: ref.locator, citation: cited ? citationPageSchema.parse(cited) : null, sourceId: ref.sourceId, orderId: ref.orderId });
      });
      const photo = this.connection.db.select({ id: t.photos.id, chatId: t.photos.chatId, messageId: t.photos.messageId, name: t.photos.name, mimeType: t.photos.mimeType, size: t.photos.size, description: t.photos.description }).from(t.photos).where(eq(t.photos.messageId, message.id)).get();
      const content = message.contentKind === "rich" ? { kind: "rich" as const, rich: richContentSchema.parse(JSON.parse(message.richJson ?? "null")) } : { kind: "plain" as const, text: message.bodyText };
      if (message.contentKind === "rich") {
        if (content.kind !== "rich") throw new Error(`Rich content is missing for ${message.id}.`);
        const ids = content.rich.blocks.flatMap((block) => block.kind === "paragraph" ? block.content : block.items.flat()).filter((part) => part.kind === "citation").map((part) => part.kind === "citation" ? part.id : null);
        const refIds = references.filter((ref) => ref.kind === "citation").map((ref) => ref.citation?.id);
        if (JSON.stringify(ids) !== JSON.stringify(refIds)) throw new Error(`Citation references are inconsistent for ${message.id}.`);
      }
      return messageSchema.parse({ id: message.id, chatId: message.chatId, ordinal: message.ordinal, author: message.author, status: message.status, at: message.at, displayTime: message.displayTime, speaker: message.speaker, content, references, photo: photo ? photoMetadataSchema.parse(photo) : null });
    });
    let scenario = null;
    if (row.scenarioId) {
      const scenarioRow = this.connection.db.select().from(t.scenarios).where(eq(t.scenarios.id, row.scenarioId)).get();
      if (!scenarioRow) throw new Error(`Scenario ${row.scenarioId} is missing.`);
      const followUps = this.connection.db.select().from(t.scenarioFollowups).where(eq(t.scenarioFollowups.scenarioId, row.scenarioId)).orderBy(asc(t.scenarioFollowups.ordinal)).all().map((item) => item.text);
      scenario = scenarioMetadataSchema.parse({ ...scenarioRow, followUps });
    }
    return chatDetailSchema.parse({ ...this.chatList(row), messages, scenario });
  }

  sendDemoMessage(ownerId: string, input: { chatId: string | null; text: string; operationId: string; photo?: { name: string; mimeType: "image/png" | "image/jpeg"; description: string; bytes: Buffer } }) {
    const messageText = input.text.trim();
    if (!messageText && !input.photo) throw new Error("Add a message or photo.");
    if (input.photo && (input.photo.bytes.length < 1 || input.photo.bytes.length > 10 * 1024 * 1024)) throw new Error("Choose one PNG or JPEG up to 10 MB.");
    const requestHash = hash({ ownerId, chatId: input.chatId, text: messageText, photo: input.photo ? { name: input.photo.name, mimeType: input.photo.mimeType, description: input.photo.description, digest: createHash("sha256").update(input.photo.bytes).digest("hex") } : null });
    const result = this.connection.db.transaction((tx) => {
      const existing = input.chatId ? this.getChat(ownerId, input.chatId) : null;
      if (input.chatId && !existing) throw new RepositoryNotFoundError("Chat is unavailable to this account.");
      const prior = this.replay(tx, input.operationId, ownerId, "send-message", requestHash);
      if (prior) return { chatId: prior.secondaryId!, messageId: prior.resultId, replayed: true };
      let chatId = input.chatId;
      if (!chatId) {
        const allocated = this.runtime(tx, "other", false, true);
        chatId = `CH-G${String(allocated.sequence).padStart(3, "0")}`;
        tx.insert(t.chats).values({ id: chatId, ownerId, orderId: null, scenarioId: null, title: messageText.slice(0, 56) || "Photo conversation", equipment: null, createdAt: allocated.at, updatedAt: allocated.at }).run();
      }
      const order = existing?.orderId ? this.getOrder(existing.orderId) : null;
      const browserChat: BrowserChat | undefined = existing ? { id: existing.id, ownerId, orderId: existing.orderId, title: existing.title, equipment: existing.equipment ?? undefined, scenarioId: existing.scenarioId === "ahu-15" ? "ahu-15" : undefined, createdAt: existing.createdAt, updatedAt: existing.updatedAt, messages: existing.messages.map((item) => ({ id: item.id, chatId: item.chatId, author: item.author, text: item.content.kind === "plain" ? item.content.text : "", at: item.at ?? "", status: item.status, references: item.references.map((ref): BrowserReference => ({ kind: ref.kind, id: ref.kind === "citation" ? String(ref.citation?.id) : ref.sourceId ?? ref.orderId ?? "", label: ref.label, locator: ref.locator ?? undefined })) })) } : undefined;
      const browserOrder: BrowserOrder | undefined = order ? { id: order.id, issueId: order.issueId, locationId: order.locationId, requesterId: order.requesterId, createdAt: order.createdAt, status: order.status, version: order.version, equipment: order.equipment ?? undefined, remarks: order.remarks, events: order.events.map((event) => ({ ...event, text: event.text ?? undefined })), closure: order.closure ?? undefined } : undefined;
      const answer = demoAnswer(messageText || "photo", browserChat, browserOrder, !!input.photo);
      const userAlloc = this.runtime(tx, "other", false, true);
      const messageId = `${chatId}-M${String(userAlloc.sequence).padStart(3, "0")}`;
      const ordinal = (tx.select({ n: sql<number>`coalesce(max(${t.messages.ordinal}), 0)` }).from(t.messages).where(eq(t.messages.chatId, chatId)).get()?.n ?? 0) + 1;
      tx.insert(t.messages).values({ id: messageId, chatId, ordinal, author: "user", status: "sent", at: userAlloc.at, displayTime: null, contentKind: "plain", bodyText: messageText || `Photo attached: ${input.photo?.name}`, richJson: null, speaker: null }).run();
      let photoId: string | null = null;
      if (input.photo) {
        const photoAlloc = this.runtime(tx, "other", false, true);
        photoId = `PH-${String(photoAlloc.sequence).padStart(3, "0")}`;
        tx.insert(t.photos).values({ id: photoId, chatId, messageId, name: input.photo.name, mimeType: input.photo.mimeType, size: input.photo.bytes.length, description: input.photo.description, bytes: input.photo.bytes }).run();
      }
      const answerAt = this.runtime(tx, "other").at;
      const answerId = `${messageId}-answer`;
      const answerText = answer.unknownCode ? `${answer.text}\n\nUnrecognized code recorded for this chat.` : answer.text;
      tx.insert(t.messages).values({ id: answerId, chatId, ordinal: ordinal + 1, author: "assistant", status: "sent", at: answerAt, displayTime: null, contentKind: "plain", bodyText: answerText, richJson: null, speaker: null }).run();
      (answer.references ?? []).forEach((ref, index) => tx.insert(t.messageReferences).values({ id: `${answerId}-REF${index + 1}`, messageId: answerId, ordinal: index + 1, kind: ref.kind, label: ref.label, locator: ref.locator ?? null, citationId: ref.kind === "citation" ? Number(ref.id) : null, sourceId: ref.kind === "source" ? ref.id : null, orderId: ref.kind === "remark" || ref.kind === "status" ? ref.id : null }).run());
      if (answer.unknownCode) tx.insert(t.unknownFaults).values({ id: `${messageId}-fault`, chatId, messageId, equipment: answer.unknownCode.equipment, code: answer.unknownCode.code, at: answerAt, photoId }).run();
      tx.update(t.chats).set({ updatedAt: answerAt }).where(and(eq(t.chats.id, chatId), eq(t.chats.ownerId, ownerId))).run();
      this.receipt(tx, input.operationId, ownerId, "send-message", requestHash, messageId, userAlloc.at, chatId);
      return { chatId, messageId, replayed: false };
    }, { behavior: "immediate" });
    return { ...result, chat: this.getChat(ownerId, result.chatId)! };
  }

  chooseEquipment(ownerId: string, chatId: string, promptMessageId: string, useNewUnit: boolean, operationId: string) {
    const requestHash = hash({ ownerId, chatId, promptMessageId, useNewUnit });
    this.connection.db.transaction((tx) => {
      if (this.replay(tx, operationId, ownerId, "equipment-choice", requestHash)) return;
      const chat = tx.select().from(t.chats).where(and(eq(t.chats.id, chatId), eq(t.chats.ownerId, ownerId))).get();
      const prompt = tx.select().from(t.messages).where(and(eq(t.messages.id, promptMessageId), eq(t.messages.chatId, chatId))).get();
      if (!chat || !prompt || prompt.author !== "assistant" || !prompt.bodyText?.startsWith("This question concerns FCU-D02.")) throw new RepositoryNotFoundError("Equipment choice is unavailable.");
      const choiceId = `${promptMessageId}-choice`;
      const existingChoice = tx.select().from(t.messages).where(eq(t.messages.id, choiceId)).get();
      if (existingChoice && Boolean(existingChoice.bodyText?.startsWith("Equipment context: FCU-D02.")) !== useNewUnit) throw new RepositoryConflictError("Equipment choice was already made differently.");
      if (!existingChoice) {
        const at = this.runtime(tx, "other").at;
        const ordinal = (tx.select({ n: sql<number>`coalesce(max(${t.messages.ordinal}), 0)` }).from(t.messages).where(eq(t.messages.chatId, chatId)).get()?.n ?? 0) + 1;
        tx.insert(t.messages).values({ id: choiceId, chatId, ordinal, author: "assistant", status: "sent", at, displayTime: null, contentKind: "plain", bodyText: useNewUnit ? "Equipment context: FCU-D02. This change is for this conversation only; the linked service order is unchanged." : "Equipment context remains AHU-D01. This conversation and its linked service order are unchanged.", richJson: null, speaker: null }).run();
        if (useNewUnit) {
          tx.update(t.chats).set({ equipment: "FCU-D02", updatedAt: at }).where(eq(t.chats.id, chatId)).run();
          tx.insert(t.messageReferences).values({ id: `${choiceId}-REF1`, messageId: choiceId, ordinal: 1, kind: "source", label: "Demo source · Training equipment register · Entry EQ-D02", locator: "EQ-D02", citationId: null, sourceId: "DF-S01", orderId: null }).run();
        } else tx.update(t.chats).set({ updatedAt: at }).where(eq(t.chats.id, chatId)).run();
      }
      this.receipt(tx, operationId, ownerId, "equipment-choice", requestHash, choiceId, chat.updatedAt);
    }, { behavior: "immediate" });
    return this.getChat(ownerId, chatId)!;
  }

  retryUnknownFault(ownerId: string, chatId: string, messageId: string) {
    this.connection.db.transaction((tx) => {
      const chat = tx.select().from(t.chats).where(and(eq(t.chats.id, chatId), eq(t.chats.ownerId, ownerId))).get();
      const message = tx.select().from(t.messages).where(and(eq(t.messages.id, messageId), eq(t.messages.chatId, chatId))).get();
      const answerId = `${messageId}-answer`;
      const answer = tx.select().from(t.messages).where(and(eq(t.messages.id, answerId), eq(t.messages.chatId, chatId))).get();
      if (!chat || !message || !answer || message.author !== "user" || !message.bodyText?.toLowerCase().includes("test-x9") || !answer.bodyText?.includes("TEST-X9")) throw new RepositoryNotFoundError("Unknown-fault response is unavailable.");
      const id = `${messageId}-fault`;
      if (tx.select().from(t.unknownFaults).where(eq(t.unknownFaults.id, id)).get()) return;
      const equipment = chat.equipment ?? (chat.orderId ? tx.select().from(t.orders).where(eq(t.orders.id, chat.orderId)).get()?.equipment : null);
      if (!equipment) throw new RepositoryConflictError("Equipment context is required before recording this fault.");
      const photo = tx.select().from(t.photos).where(eq(t.photos.messageId, messageId)).get();
      const at = this.runtime(tx, "other").at;
      tx.insert(t.unknownFaults).values({ id, chatId, messageId, equipment, code: "TEST-X9", at, photoId: photo?.id ?? null }).run();
      if (!answer.bodyText.includes("Unrecognized code recorded for this chat.")) tx.update(t.messages).set({ bodyText: "I don't have a confirmed meaning for TEST-X9 in the available material. Please confirm the code and the equipment tag; a readable photo may help.\n\nUnrecognized code recorded for this chat." }).where(eq(t.messages.id, answerId)).run();
    }, { behavior: "immediate" });
    return this.getChat(ownerId, chatId)!;
  }

  getReference(ownerId: string, referenceId: string) {
    const row = this.connection.db.select().from(t.messageReferences).innerJoin(t.messages, eq(t.messageReferences.messageId, t.messages.id)).innerJoin(t.chats, eq(t.messages.chatId, t.chats.id)).where(and(eq(t.messageReferences.id, referenceId), eq(t.chats.ownerId, ownerId))).get();
    if (!row) return null;
    const reference = row.message_references;
    const citation = reference.citationId === null ? null : this.connection.db.select().from(t.citationPages).where(eq(t.citationPages.id, reference.citationId)).get();
    const source = reference.sourceId === null ? null : this.connection.db.select().from(t.sourceRecords).where(eq(t.sourceRecords.id, reference.sourceId)).get() ?? null;
    const order = reference.orderId === null ? null : this.getOrder(reference.orderId);
    return { reference: referenceSchema.parse({ id: reference.id, ordinal: reference.ordinal, kind: reference.kind, label: reference.label, locator: reference.locator, citation: citation ? citationPageSchema.parse(citation) : null, sourceId: reference.sourceId, orderId: reference.orderId }), source, order };
  }

  getOrCreateLinkedChat(ownerId: string, orderId: string, operationId: string): ChatDetail {
    const input = linkedChatInputSchema.parse({ ownerId, orderId, operationId });
    const requestHash = hash({ ownerId: input.ownerId, orderId: input.orderId });
    const id = this.connection.db.transaction((tx) => {
      const prior = this.replay(tx, operationId, ownerId, "linked-chat", requestHash);
      if (prior) return prior.resultId;
      const order = tx.select().from(t.orders).where(eq(t.orders.id, orderId)).get();
      if (!order) throw new RepositoryNotFoundError("Order is unavailable.");
      const existing = tx.select().from(t.chats).where(and(eq(t.chats.ownerId, ownerId), eq(t.chats.orderId, orderId))).get();
      if (existing) { this.receipt(tx, operationId, ownerId, "linked-chat", requestHash, existing.id, existing.createdAt); return existing.id; }
      const { at, sequence } = this.runtime(tx, "other", false, true);
      const id = `CH-L${String(sequence).padStart(3, "0")}`;
      const issue = tx.select().from(t.issues).where(eq(t.issues.id, order.issueId)).get();
      tx.insert(t.chats).values({ id, ownerId, orderId, scenarioId: null, title: issue?.label ?? `SO #${orderId}`, equipment: order.equipment, createdAt: at, updatedAt: at }).run();
      this.receipt(tx, operationId, ownerId, "linked-chat", requestHash, id, at);
      return id;
    }, { behavior: "immediate" });
    return this.getChat(ownerId, id)!;
  }

  createGeneralChat(ownerId: string, title: string, operationId: string): ChatDetail {
    const input = generalChatInputSchema.parse({ ownerId, title, operationId });
    const requestHash = hash({ ownerId: input.ownerId, title: input.title });
    const id = this.connection.db.transaction((tx) => {
      const prior = this.replay(tx, operationId, ownerId, "general-chat", requestHash);
      if (prior) return prior.resultId;
      const { at, sequence } = this.runtime(tx, "other", false, true);
      const id = `CH-G${String(sequence).padStart(3, "0")}`;
      tx.insert(t.chats).values({ id, ownerId, orderId: null, scenarioId: null, title: input.title.slice(0, 56), equipment: null, createdAt: at, updatedAt: at }).run();
      this.receipt(tx, operationId, ownerId, "general-chat", requestHash, id, at);
      return id;
    }, { behavior: "immediate" });
    return this.getChat(ownerId, id)!;
  }

  appendMessage(raw: Parameters<AskPatRepository["appendMessage"]>[0]): ChatDetail {
    const input = appendMessageInputSchema.parse(raw);
    const requestHash = hash(input);
    this.connection.db.transaction((tx) => {
      if (input.operationId && this.replay(tx, input.operationId, input.ownerId, "append-message", requestHash)) return;
      const chat = tx.select().from(t.chats).where(and(eq(t.chats.id, input.chatId), eq(t.chats.ownerId, input.ownerId))).get();
      if (!chat) throw new RepositoryNotFoundError("Chat is unavailable to this account.");
      const ordinal = (tx.select({ n: sql<number>`coalesce(max(${t.messages.ordinal}), 0)` }).from(t.messages).where(eq(t.messages.chatId, chat.id)).get()?.n ?? 0) + 1;
      tx.insert(t.messages).values({ id: input.id, chatId: chat.id, ordinal, author: input.author, status: "sent", at: input.at, displayTime: null, contentKind: "plain", bodyText: input.text, richJson: null, speaker: null }).run();
      input.references?.forEach((reference, index) => {
        const citationId = reference.kind === "citation" ? Number(reference.targetId) : null;
        if (reference.kind === "citation" && (!Number.isInteger(citationId) || citationId! < 1 || citationId! > 6)) throw new Error("Citation target is invalid.");
        tx.insert(t.messageReferences).values({
          id: `${input.id}-REF${index + 1}`, messageId: input.id, ordinal: index + 1,
          kind: reference.kind, label: reference.label, locator: reference.locator ?? null,
          citationId, sourceId: reference.kind === "source" ? reference.targetId : null,
          orderId: reference.kind === "remark" || reference.kind === "status" ? reference.targetId : null,
        }).run();
      });
      tx.update(t.chats).set({ updatedAt: input.at }).where(eq(t.chats.id, chat.id)).run();
      if (input.operationId) this.receipt(tx, input.operationId, input.ownerId, "append-message", requestHash, input.id, input.at);
    }, { behavior: "immediate" });
    return this.getChat(input.ownerId, input.chatId)!;
  }

  putPhoto(ownerId: string, input: Parameters<AskPatRepository["putPhoto"]>[1]): PhotoMetadata {
    const metadata = photoUploadMetadataSchema.parse(input);
    if (input.bytes.length > 10 * 1024 * 1024) throw new Error("Choose one PNG or JPEG up to 10 MB.");
    this.connection.db.transaction((tx) => {
      const chat = tx.select({ id: t.chats.id }).from(t.chats).where(and(eq(t.chats.id, input.chatId), eq(t.chats.ownerId, ownerId))).get();
      const message = tx.select({ id: t.messages.id }).from(t.messages).where(and(eq(t.messages.id, input.messageId), eq(t.messages.chatId, input.chatId))).get();
      if (!chat || !message) throw new RepositoryNotFoundError("Message is unavailable to this account.");
      tx.insert(t.photos).values({ ...metadata, size: input.bytes.length, bytes: input.bytes }).run();
    }, { behavior: "immediate" });
    return this.getPhotoMetadata(ownerId, input.id)!;
  }
  getPhotoMetadata(ownerId: string, photoId: string): PhotoMetadata | null {
    const photo = this.connection.db.select({ id: t.photos.id, chatId: t.photos.chatId, messageId: t.photos.messageId, name: t.photos.name, mimeType: t.photos.mimeType, size: t.photos.size, description: t.photos.description }).from(t.photos).innerJoin(t.chats, eq(t.photos.chatId, t.chats.id)).where(and(eq(t.photos.id, photoId), eq(t.chats.ownerId, ownerId))).get();
    return photo ? photoMetadataSchema.parse(photo) : null;
  }
  getPhotoBytes(ownerId: string, photoId: string): Buffer | null {
    const row = this.connection.db.select({ bytes: t.photos.bytes }).from(t.photos).innerJoin(t.chats, eq(t.photos.chatId, t.chats.id)).where(and(eq(t.photos.id, photoId), eq(t.chats.ownerId, ownerId))).get();
    return row?.bytes ?? null;
  }

  recordFault(ownerId: string, input: Parameters<AskPatRepository["recordFault"]>[1]): Fault {
    input = faultInputSchema.parse(input);
    return this.connection.db.transaction((tx) => {
      const chat = tx.select({ id: t.chats.id }).from(t.chats).where(and(eq(t.chats.id, input.chatId), eq(t.chats.ownerId, ownerId))).get();
      const message = tx.select({ id: t.messages.id }).from(t.messages).where(and(eq(t.messages.id, input.messageId), eq(t.messages.chatId, input.chatId))).get();
      if (!chat || !message) throw new RepositoryNotFoundError("Message is unavailable to this account.");
      if (input.photoId && !tx.select({ id: t.photos.id }).from(t.photos).where(and(eq(t.photos.id, input.photoId), eq(t.photos.chatId, input.chatId))).get()) throw new RepositoryNotFoundError("Photo is unavailable to this account.");
      const prior = tx.select().from(t.unknownFaults).where(eq(t.unknownFaults.id, input.id)).get();
      const candidate = faultSchema.parse({ ...input, photoId: input.photoId ?? null });
      if (prior) {
        if (JSON.stringify(faultSchema.parse(prior)) !== JSON.stringify(candidate)) throw new RepositoryConflictError("Fault ID was already used for different input.");
        return candidate;
      }
      tx.insert(t.unknownFaults).values({ ...input, photoId: input.photoId ?? null }).run();
      return candidate;
    }, { behavior: "immediate" });
  }
  listFaults(ownerId: string, chatId: string): Fault[] {
    if (!this.connection.db.select({ id: t.chats.id }).from(t.chats).where(and(eq(t.chats.id, chatId), eq(t.chats.ownerId, ownerId))).get()) return [];
    return this.connection.db.select().from(t.unknownFaults).where(eq(t.unknownFaults.chatId, chatId)).all().map((row) => faultSchema.parse(row));
  }
  getReceipt(actorId: string, operationId: string) {
    const row = this.connection.db.select().from(t.operationReceipts).where(and(eq(t.operationReceipts.actorId, actorId), eq(t.operationReceipts.operationId, operationId))).get();
    return row ? receiptSchema.parse(row) : null;
  }
  reserveChatArtifactId(ownerId: string, chatId: string, kind: "message" | "photo") {
    return this.connection.db.transaction((tx) => {
      if (!tx.select({ id: t.chats.id }).from(t.chats).where(and(eq(t.chats.id, chatId), eq(t.chats.ownerId, ownerId))).get()) throw new RepositoryNotFoundError("Chat is unavailable to this account.");
      const { at, sequence } = this.runtime(tx, "other", false, true);
      return { id: kind === "photo" ? `PH-${String(sequence).padStart(3, "0")}` : `${chatId}-M${String(sequence).padStart(3, "0")}`, at };
    }, { behavior: "immediate" });
  }
}
