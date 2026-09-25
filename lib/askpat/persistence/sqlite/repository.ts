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

export class RepositoryConflictError extends Error {}
export class RepositoryNotFoundError extends Error {}

type Transaction = Parameters<Parameters<SqliteConnection["db"]["transaction"]>[0]>[0];
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
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

  getChat(ownerId: string, chatId: string): ChatDetail | null {
    const row = this.connection.db.select().from(t.chats).where(and(eq(t.chats.id, chatId), eq(t.chats.ownerId, ownerId))).get();
    if (!row) return null;
    const messageRows = this.connection.db.select().from(t.messages).where(eq(t.messages.chatId, chatId)).orderBy(asc(t.messages.ordinal)).all();
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
