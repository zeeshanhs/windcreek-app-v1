import { and, eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "node:path";
import { citations, followUps, messages as scenarioMessages, ticketSummary, type CitationId } from "../../../../app/scenarios/ahu-15/scenario-data";
import { richContentSchema } from "../../contracts";
import { initialState, issues as fixtureIssues, locations as fixtureLocations, sourceRecords } from "../../fixtures";
import type { SqliteConnection } from "./connection";
import { openSqlite } from "./connection";
import * as table from "./schema";

const SEED_VERSION = 1;
type SeedTransaction = Parameters<Parameters<SqliteConnection["db"]["transaction"]>[0]>[0];

function insertBaseline(tx: SeedTransaction) {
  const state = initialState();
  tx.insert(table.users).values(state.users).run();
  tx.insert(table.issues).values(fixtureIssues).run();
  tx.insert(table.locations).values(fixtureLocations.map((location) => ({ ...location, equipment: location.equipment ?? null }))).run();
  tx.insert(table.scenarios).values({ id: "ahu-15", title: "AHU-15 Drops Off the BMS", ticketSummary, label: "Scripted example · fictional incident" }).run();
  tx.insert(table.scenarioFollowups).values(followUps.map((text, index) => ({ scenarioId: "ahu-15", ordinal: index + 1, text }))).run();
  tx.insert(table.citationPages).values(Object.values(citations)).run();
  tx.insert(table.sourceRecords).values(Object.entries(sourceRecords).map(([id, source]) => ({ id, title: source.title, version: source.version }))).run();

  for (const order of state.orders) {
    tx.insert(table.orders).values({
      id: order.id, issueId: order.issueId, locationId: order.locationId, requesterId: order.requesterId,
      createdAt: order.createdAt, status: order.status, version: order.version, equipment: order.equipment ?? null,
      closureActorId: order.closure?.actorId ?? null, closureAt: order.closure?.at ?? null, closureNote: order.closure?.note ?? null,
    }).run();
    if (order.remarks.length) tx.insert(table.orderRemarks).values(order.remarks.map((remark, index) => ({ ...remark, orderId: order.id, ordinal: index + 1 }))).run();
    if (order.events.length) tx.insert(table.orderEvents).values(order.events.map((event, index) => ({ ...event, orderId: order.id, ordinal: index + 1, text: event.text ?? null }))).run();
  }

  for (const chat of state.chats) {
    tx.insert(table.chats).values({ id: chat.id, ownerId: chat.ownerId, orderId: chat.orderId, scenarioId: chat.scenarioId ?? null, title: chat.title, equipment: chat.equipment ?? null, createdAt: chat.createdAt, updatedAt: chat.updatedAt }).run();
    for (const [index, message] of chat.messages.entries()) {
      tx.insert(table.messages).values({ id: message.id, chatId: chat.id, ordinal: index + 1, author: message.author, status: message.status, at: message.at, displayTime: null, contentKind: "plain", bodyText: message.text, richJson: null, speaker: null }).run();
      for (const [refIndex, reference] of (message.references ?? []).entries()) {
        tx.insert(table.messageReferences).values({
          id: `${message.id}-REF${refIndex + 1}`, messageId: message.id, ordinal: refIndex + 1,
          kind: reference.kind, label: reference.label, locator: reference.locator ?? null,
          citationId: reference.kind === "citation" ? Number(reference.id) : null,
          sourceId: reference.kind === "source" ? reference.id : null,
          orderId: reference.kind === "remark" || reference.kind === "status" ? reference.id : null,
        }).run();
      }
    }
    if (chat.scenarioId !== "ahu-15") continue;
    for (const [index, script] of scenarioMessages.entries()) {
      const id = `${chat.id}-S${String(index + 1).padStart(2, "0")}`;
      const rich = richContentSchema.parse({ version: 1, blocks: script.blocks });
      tx.insert(table.messages).values({
        id, chatId: chat.id, ordinal: index + 1, author: script.speaker === "Marcus" ? "user" : "assistant",
        status: "sent", at: null, displayTime: script.time ?? null, speaker: script.speaker,
        contentKind: "rich", bodyText: null, richJson: JSON.stringify(rich),
      }).run();
      const inline = rich.blocks.flatMap((block) => block.kind === "paragraph" ? block.content : block.items.flat());
      const occurrences = inline.filter((part) => part.kind === "citation");
      occurrences.forEach((part, refIndex) => {
        if (part.kind !== "citation") return;
        const citation = citations[part.id as CitationId];
        tx.insert(table.messageReferences).values({
          id: `${id}-REF${refIndex + 1}`, messageId: id, ordinal: refIndex + 1,
          kind: "citation", label: `Citation [${part.id}] · ${citation.sheet} · PDF page ${citation.page}`,
          locator: null, citationId: part.id, sourceId: null, orderId: null,
        }).run();
      });
    }
  }
  tx.insert(table.demoRuntime).values({ id: 1, clock: state.clock, nextOrderNumber: 1043, nextSequence: state.sequence }).run();
  tx.insert(table.seedMetadata).values({ id: 1, version: SEED_VERSION, installedAt: state.clock }).run();
}

function assertSeedIntegrity(tx: SeedTransaction) {
  const baseline = initialState();
  for (const user of baseline.users) {
    if (!tx.select({ id: table.users.id }).from(table.users).where(eq(table.users.id, user.id)).get()) throw new Error(`Seed user ${user.id} is missing.`);
    const chatId = `CH-AHU15-${user.id}`;
    if (!tx.select({ id: table.chats.id }).from(table.chats).where(eq(table.chats.id, chatId)).get()) throw new Error(`Seed chat ${chatId} is missing.`);
    for (let ordinal = 1; ordinal <= 12; ordinal++) {
      const id = `${chatId}-S${String(ordinal).padStart(2, "0")}`;
      if (!tx.select({ id: table.messages.id }).from(table.messages).where(eq(table.messages.id, id)).get()) throw new Error(`Seed message ${id} is missing.`);
      const script = scenarioMessages[ordinal - 1];
      const occurrences = script.blocks.flatMap((block) => block.kind === "paragraph" ? block.content : block.items.flat()).filter((part) => part.kind === "citation");
      for (const index of occurrences.keys()) {
        const refId = `${id}-REF${index + 1}`;
        if (!tx.select({ id: table.messageReferences.id }).from(table.messageReferences).where(eq(table.messageReferences.id, refId)).get()) throw new Error(`Seed reference ${refId} is missing.`);
      }
    }
  }
  for (const issue of fixtureIssues) if (!tx.select({ id: table.issues.id }).from(table.issues).where(eq(table.issues.id, issue.id)).get()) throw new Error(`Seed issue ${issue.id} is missing.`);
  for (const location of fixtureLocations) if (!tx.select({ id: table.locations.id }).from(table.locations).where(eq(table.locations.id, location.id)).get()) throw new Error(`Seed location ${location.id} is missing.`);
  for (const order of baseline.orders) {
    if (!tx.select({ id: table.orders.id }).from(table.orders).where(eq(table.orders.id, order.id)).get()) throw new Error(`Seed order ${order.id} is missing.`);
    for (const remark of order.remarks) if (!tx.select({ id: table.orderRemarks.id }).from(table.orderRemarks).where(eq(table.orderRemarks.id, remark.id)).get()) throw new Error(`Seed remark ${remark.id} is missing.`);
    for (const event of order.events) if (!tx.select({ id: table.orderEvents.id }).from(table.orderEvents).where(eq(table.orderEvents.id, event.id)).get()) throw new Error(`Seed event ${event.id} is missing.`);
  }
  for (const chat of baseline.chats) {
    if (!tx.select({ id: table.chats.id }).from(table.chats).where(eq(table.chats.id, chat.id)).get()) throw new Error(`Seed chat ${chat.id} is missing.`);
    for (const message of chat.messages) {
      if (!tx.select({ id: table.messages.id }).from(table.messages).where(eq(table.messages.id, message.id)).get()) throw new Error(`Seed message ${message.id} is missing.`);
      for (const index of (message.references ?? []).keys()) {
        const id = `${message.id}-REF${index + 1}`;
        if (!tx.select({ id: table.messageReferences.id }).from(table.messageReferences).where(eq(table.messageReferences.id, id)).get()) throw new Error(`Seed reference ${id} is missing.`);
      }
    }
  }
  for (const citation of Object.values(citations)) if (!tx.select({ id: table.citationPages.id }).from(table.citationPages).where(eq(table.citationPages.id, citation.id)).get()) throw new Error(`Seed citation ${citation.id} is missing.`);
  for (const id of Object.keys(sourceRecords)) if (!tx.select({ id: table.sourceRecords.id }).from(table.sourceRecords).where(eq(table.sourceRecords.id, id)).get()) throw new Error(`Seed source ${id} is missing.`);
  if (!tx.select({ id: table.scenarios.id }).from(table.scenarios).where(eq(table.scenarios.id, "ahu-15")).get()) throw new Error("Seed scenario is missing.");
  for (let ordinal = 1; ordinal <= followUps.length; ordinal++) {
    if (!tx.select({ ordinal: table.scenarioFollowups.ordinal }).from(table.scenarioFollowups).where(and(eq(table.scenarioFollowups.scenarioId, "ahu-15"), eq(table.scenarioFollowups.ordinal, ordinal))).get()) throw new Error(`Seed follow-up ${ordinal} is missing.`);
  }
  if (!tx.select({ id: table.demoRuntime.id }).from(table.demoRuntime).where(eq(table.demoRuntime.id, 1)).get()) throw new Error("Seed runtime is missing.");
}

export function seedBaseline(connection: SqliteConnection): boolean {
  return connection.db.transaction((tx) => {
    const marker = tx.select().from(table.seedMetadata).where(eq(table.seedMetadata.id, 1)).get();
    if (marker) {
      if (marker.version !== SEED_VERSION) throw new Error(`Unsupported seed version ${marker.version}.`);
      assertSeedIntegrity(tx);
      tx.insert(table.resetGeneration).values({ id: 1, generation: 0 }).onConflictDoNothing().run();
      return false;
    }
    if (tx.select().from(table.users).limit(1).get()) throw new Error("Database has data but no seed marker; reset explicitly or inspect it.");
    insertBaseline(tx);
    tx.insert(table.resetGeneration).values({ id: 1, generation: 0 }).run();
    return true;
  });
}

export function resetBaseline(connection: SqliteConnection) {
  connection.db.transaction((tx) => {
    const generation = tx.select().from(table.resetGeneration).where(eq(table.resetGeneration.id, 1)).get()?.generation ?? 0;
    tx.delete(table.demoSessions).run();
    tx.delete(table.unknownFaults).run();
    tx.delete(table.photos).run();
    tx.delete(table.messageReferences).run();
    tx.delete(table.messages).run();
    tx.delete(table.chats).run();
    tx.delete(table.orderEvents).run();
    tx.delete(table.orderRemarks).run();
    tx.delete(table.operationReceipts).run();
    tx.delete(table.orders).run();
    tx.delete(table.scenarioFollowups).run();
    tx.delete(table.scenarios).run();
    tx.delete(table.citationPages).run();
    tx.delete(table.sourceRecords).run();
    tx.delete(table.issues).run();
    tx.delete(table.locations).run();
    tx.delete(table.users).run();
    tx.delete(table.demoRuntime).run();
    tx.delete(table.seedMetadata).run();
    insertBaseline(tx);
    tx.insert(table.resetGeneration).values({ id: 1, generation: generation + 1 }).onConflictDoUpdate({ target: table.resetGeneration.id, set: { generation: generation + 1 } }).run();
  }, { behavior: "immediate" });
}

const domainTables = ["users", "issues", "locations", "orders", "order_remarks", "order_events", "scenarios", "scenario_followups", "chats", "messages", "citation_pages", "source_records", "message_references", "photos", "unknown_faults", "operation_receipts", "demo_runtime", "seed_metadata"] as const;
let baselineSnapshot: string | undefined;

function snapshot(connection: SqliteConnection): string {
  return JSON.stringify(domainTables.map((name) => {
    const rows = connection.client.prepare(`select * from ${name}`).all();
    return [name, rows.map((row) => JSON.stringify(row, (_key, value) => Buffer.isBuffer(value) ? value.toString("base64") : value)).sort()];
  }));
}

/** Server-only full-domain comparison used by WCAP-005's maintenance importer. */
export function isPristineBaseline(connection: SqliteConnection): boolean {
  if (!baselineSnapshot) {
    const pristine = openSqlite(":memory:");
    try {
      migrate(pristine.db, { migrationsFolder: path.resolve(process.cwd(), "drizzle") });
      seedBaseline(pristine);
      baselineSnapshot = snapshot(pristine);
    } finally { pristine.close(); }
  }
  return snapshot(connection) === baselineSnapshot;
}
