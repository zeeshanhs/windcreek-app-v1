import { sql } from "drizzle-orm";
import { blob, check, foreignKey, index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), name: text("name").notNull(), initials: text("initials").notNull(),
  role: text("role").notNull(), email: text("email").notNull(),
}, (t) => [uniqueIndex("users_email_uq").on(t.email)]);

export const issues = sqliteTable("issues", {
  id: text("id").primaryKey(), label: text("label").notNull(), category: text("category").notNull(),
});
export const locations = sqliteTable("locations", {
  id: text("id").primaryKey(), label: text("label").notNull(), area: text("area").notNull(), equipment: text("equipment"),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(), issueId: text("issue_id").notNull().references(() => issues.id),
  locationId: text("location_id").notNull().references(() => locations.id),
  requesterId: text("requester_id").notNull().references(() => users.id),
  createdAt: text("created_at").notNull(), status: text("status").notNull(), version: integer("version").notNull(),
  equipment: text("equipment"), closureActorId: text("closure_actor_id").references(() => users.id),
  closureAt: text("closure_at"), closureNote: text("closure_note"),
}, (t) => [
  check("orders_status_ck", sql`${t.status} in ('open','closed')`),
  check("orders_version_ck", sql`${t.version} > 0`),
  check("orders_closure_ck", sql`(${t.status} = 'open' and ${t.closureActorId} is null and ${t.closureAt} is null and ${t.closureNote} is null) or (${t.status} = 'closed' and ${t.closureActorId} is not null and ${t.closureAt} is not null and ${t.closureNote} is not null)`),
  index("orders_status_time_idx").on(t.status, t.createdAt), index("orders_requester_time_idx").on(t.requesterId, t.createdAt),
]);

export const orderRemarks = sqliteTable("order_remarks", {
  id: text("id").primaryKey(), orderId: text("order_id").notNull().references(() => orders.id),
  ordinal: integer("ordinal").notNull(), authorId: text("author_id").notNull().references(() => users.id),
  at: text("at").notNull(), text: text("text").notNull(),
}, (t) => [uniqueIndex("order_remarks_order_ordinal_uq").on(t.orderId, t.ordinal), check("order_remarks_ordinal_ck", sql`${t.ordinal} > 0`)]);
export const orderEvents = sqliteTable("order_events", {
  id: text("id").primaryKey(), orderId: text("order_id").notNull().references(() => orders.id),
  ordinal: integer("ordinal").notNull(), kind: text("kind").notNull(), actorId: text("actor_id").notNull().references(() => users.id),
  at: text("at").notNull(), text: text("text"),
}, (t) => [uniqueIndex("order_events_order_ordinal_uq").on(t.orderId, t.ordinal), check("order_events_kind_ck", sql`${t.kind} in ('created','remark','closed')`)]);

export const scenarios = sqliteTable("scenarios", {
  id: text("id").primaryKey(), title: text("title").notNull(), ticketSummary: text("ticket_summary").notNull(),
  label: text("label").notNull(),
});
export const scenarioFollowups = sqliteTable("scenario_followups", {
  scenarioId: text("scenario_id").notNull().references(() => scenarios.id),
  ordinal: integer("ordinal").notNull(), text: text("text").notNull(),
}, (t) => [uniqueIndex("scenario_followups_ordinal_uq").on(t.scenarioId, t.ordinal)]);

export const chats = sqliteTable("chats", {
  id: text("id").primaryKey(), ownerId: text("owner_id").notNull().references(() => users.id),
  orderId: text("order_id").references(() => orders.id), scenarioId: text("scenario_id").references(() => scenarios.id),
  title: text("title").notNull(), equipment: text("equipment"),
  createdAt: text("created_at").notNull(), updatedAt: text("updated_at").notNull(),
}, (t) => [
  uniqueIndex("chats_owner_order_uq").on(t.ownerId, t.orderId),
  index("chats_owner_updated_idx").on(t.ownerId, t.updatedAt),
  check("chats_scenario_general_ck", sql`${t.scenarioId} is null or ${t.orderId} is null`),
]);

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(), chatId: text("chat_id").notNull().references(() => chats.id),
  ordinal: integer("ordinal").notNull(), author: text("author").notNull(), status: text("status").notNull(),
  at: text("at"), displayTime: text("display_time"), contentKind: text("content_kind").notNull(),
  bodyText: text("body_text"), richJson: text("rich_json"), speaker: text("speaker"),
}, (t) => [
  uniqueIndex("messages_chat_ordinal_uq").on(t.chatId, t.ordinal),
  uniqueIndex("messages_id_chat_uq").on(t.id, t.chatId),
  check("messages_ordinal_ck", sql`${t.ordinal} > 0`),
  check("messages_author_ck", sql`${t.author} in ('user','assistant')`),
  check("messages_status_ck", sql`${t.status} in ('sent','sending','failed')`),
  check("messages_content_ck", sql`(${t.contentKind} = 'plain' and ${t.bodyText} is not null and ${t.richJson} is null) or (${t.contentKind} = 'rich' and ${t.bodyText} is null and ${t.richJson} is not null)`),
]);

export const citationPages = sqliteTable("citation_pages", {
  id: integer("id").primaryKey(), document: text("document").notNull(), sheet: text("sheet").notNull(),
  page: integer("page").notNull(), image: text("image").notNull(), width: integer("width").notNull(), height: integer("height").notNull(),
});
export const sourceRecords = sqliteTable("source_records", {
  id: text("id").primaryKey(), title: text("title").notNull(), version: text("version").notNull(),
});
export const messageReferences = sqliteTable("message_references", {
  id: text("id").primaryKey(), messageId: text("message_id").notNull().references(() => messages.id),
  ordinal: integer("ordinal").notNull(), kind: text("kind").notNull(), label: text("label").notNull(),
  locator: text("locator"), citationId: integer("citation_id").references(() => citationPages.id),
  sourceId: text("source_id").references(() => sourceRecords.id), orderId: text("order_id").references(() => orders.id),
}, (t) => [
  uniqueIndex("message_references_message_ordinal_uq").on(t.messageId, t.ordinal),
  check("message_references_target_ck", sql`(${t.kind} = 'citation' and ${t.citationId} is not null and ${t.sourceId} is null and ${t.orderId} is null) or (${t.kind} = 'source' and ${t.citationId} is null and ${t.sourceId} is not null and ${t.orderId} is null) or (${t.kind} in ('remark','status') and ${t.citationId} is null and ${t.sourceId} is null and ${t.orderId} is not null)`),
]);

export const photos = sqliteTable("photos", {
  id: text("id").primaryKey(), chatId: text("chat_id").notNull(), messageId: text("message_id").notNull(),
  name: text("name").notNull(), mimeType: text("mime_type").notNull(), size: integer("size").notNull(),
  description: text("description").notNull(), bytes: blob("bytes", { mode: "buffer" }).notNull(),
}, (t) => [
  foreignKey({ columns: [t.messageId, t.chatId], foreignColumns: [messages.id, messages.chatId] }),
  uniqueIndex("photos_message_uq").on(t.messageId), index("photos_chat_idx").on(t.chatId),
  check("photos_size_ck", sql`${t.size} >= 0 and ${t.size} <= 10485760`),
  check("photos_mime_ck", sql`${t.mimeType} in ('image/png','image/jpeg')`),
]);

export const unknownFaults = sqliteTable("unknown_faults", {
  id: text("id").primaryKey(), chatId: text("chat_id").notNull(), messageId: text("message_id").notNull(),
  equipment: text("equipment").notNull(), code: text("code").notNull(), at: text("at").notNull(),
  photoId: text("photo_id").references(() => photos.id),
}, (t) => [foreignKey({ columns: [t.messageId, t.chatId], foreignColumns: [messages.id, messages.chatId] }), index("unknown_faults_chat_idx").on(t.chatId)]);

export const operationReceipts = sqliteTable("operation_receipts", {
  operationId: text("operation_id").primaryKey(), actorId: text("actor_id").notNull().references(() => users.id),
  kind: text("kind").notNull(), requestHash: text("request_hash").notNull(),
  resultId: text("result_id").notNull(), secondaryId: text("secondary_id"), at: text("at").notNull(),
}, (t) => [index("operation_receipts_actor_idx").on(t.actorId)]);

export const demoRuntime = sqliteTable("demo_runtime", {
  id: integer("id").primaryKey(), clock: text("clock").notNull(),
  nextOrderNumber: integer("next_order_number").notNull(), nextSequence: integer("next_sequence").notNull(),
}, (t) => [check("demo_runtime_singleton_ck", sql`${t.id} = 1`)]);
export const seedMetadata = sqliteTable("seed_metadata", {
  id: integer("id").primaryKey(), version: integer("version").notNull(), installedAt: text("installed_at").notNull(),
}, (t) => [check("seed_metadata_singleton_ck", sql`${t.id} = 1`)]);
