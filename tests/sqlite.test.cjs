/* eslint-disable @typescript-eslint/no-require-imports */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { migrate } = require("drizzle-orm/better-sqlite3/migrator");
const { openSqlite } = require("../lib/askpat/persistence/sqlite/connection.ts");
const { seedBaseline, resetBaseline } = require("../lib/askpat/persistence/sqlite/seed.ts");
const { SqliteAskPatRepository, RepositoryConflictError, RepositoryNotFoundError } = require("../lib/askpat/persistence/sqlite/repository.ts");
const { reconcileRuntimeCounters } = require("../lib/askpat/persistence/sqlite/runtime.ts");

function temporaryDatabase() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "wcap003-"));
  const file = path.join(directory, "askpat.sqlite");
  const connection = openSqlite(file);
  migrate(connection.db, { migrationsFolder: path.join(__dirname, "../drizzle") });
  return { connection, file, cleanup: () => { connection.close(); fs.rmSync(directory, { recursive: true, force: true }); } };
}

test("fresh migration and seed preserve relational baseline, authored citations, and foreign keys", () => {
  const fixture = temporaryDatabase();
  try {
    const { connection } = fixture;
    assert.equal(seedBaseline(connection), true);
    assert.equal(seedBaseline(connection), false);
    const count = (name) => connection.client.prepare(`select count(*) as n from ${name}`).get().n;
    assert.deepEqual(["users", "issues", "locations", "orders", "order_remarks", "order_events", "chats", "messages", "citation_pages", "message_references", "photos", "unknown_faults", "operation_receipts"].map(count), [4, 6, 7, 6, 7, 9, 10, 62, 6, 60, 0, 0, 0]);
    assert.deepEqual(connection.client.pragma("foreign_key_check"), []);
    assert.throws(() => connection.client.prepare("insert into chats (id, owner_id, title, created_at, updated_at) values ('bad', 'NO-USER', 'Bad', '2026-09-24T00:00:00Z', '2026-09-24T00:00:00Z')").run(), /FOREIGN KEY/);
    const repo = new SqliteAskPatRepository(connection);
    assert.equal(repo.listOrders().filter((order) => order.status === "closed").length, 2);
    assert.equal(repo.getOrder("1042").remarks.length, 2);
    assert.equal(repo.listChats("USR-M").length, 6);
    assert.equal(repo.getChat("USR-S", "CH-D01"), null);
    for (const ownerId of ["USR-M", "USR-A", "USR-S", "USR-J"]) {
      const chat = repo.getChat(ownerId, `CH-AHU15-${ownerId}`);
      assert.equal(chat.orderId, null);
      assert.equal(chat.messages.length, 12);
      assert.equal(chat.messages[0].speaker, "Marcus");
      assert.equal(chat.messages[0].displayTime, "2:14 PM");
      assert.equal(chat.messages[1].at, null);
      assert.equal(chat.messages[1].content.kind, "rich");
      assert.equal(chat.scenario.followUps.length, 3);
      assert.equal(chat.messages.flatMap((message) => message.references).length, 13);
      assert.deepEqual([...new Set(chat.messages.flatMap((message) => message.references.filter((ref) => ref.citation).map((ref) => ref.citation.id)))].sort(), [1, 2, 3, 4, 5, 6]);
    }
    assert.equal(repo.getOrder("AHU-15"), null);
    connection.client.prepare("delete from message_references where id = ?").run("CH-AHU15-USR-M-S02-REF1");
    assert.throws(() => seedBaseline(connection), /Seed reference/);
  } finally { fixture.cleanup(); }
});

test("writes round-trip with receipts, ownership, photo BLOBs, and explicit reset", () => {
  const fixture = temporaryDatabase();
  try {
    seedBaseline(fixture.connection);
    const repo = new SqliteAskPatRepository(fixture.connection);
    const input = { issueId: "ISS-D01", locationId: "LOC-D01", requesterId: "USR-A", remark: "Check airflow.", operationId: "create-1" };
    assert.equal(repo.createOrder(input).id, "1043");
    assert.equal(repo.createOrder(input).id, "1043");
    assert.throws(() => repo.createOrder({ ...input, remark: "Changed" }), RepositoryConflictError);
    const added = repo.addRemark({ orderId: "1043", actorId: "USR-M", text: "Checked tag.", operationId: "remark-1" });
    assert.equal(added.version, 2);
    assert.equal(repo.addRemark({ orderId: "1043", actorId: "USR-M", text: "Checked tag.", operationId: "remark-1" }).remarks.length, 2);
    const linked = repo.getOrCreateLinkedChat("USR-M", "1043", "linked-1");
    assert.equal(repo.getOrCreateLinkedChat("USR-M", "1043", "linked-2").id, linked.id);
    assert.equal(repo.getOrCreateLinkedChat("USR-A", "1043", "linked-3").orderId, "1043");
    assert.equal(repo.getChat("USR-A", linked.id), null);
    const general = repo.createGeneralChat("USR-M", "General question", "general-1");
    assert.equal(general.orderId, null);
    const scriptChatId = "CH-AHU15-USR-M";
    const after = repo.appendMessage({ chatId: scriptChatId, ownerId: "USR-M", id: "followup-1", author: "user", at: "2026-09-24T15:00:00Z", text: "What changed?", operationId: "message-1" });
    assert.equal(after.messages.length, 13);
    assert.equal(after.messages[12].ordinal, 13);
    assert.equal(repo.appendMessage({ chatId: scriptChatId, ownerId: "USR-M", id: "followup-1", author: "user", at: "2026-09-24T15:00:00Z", text: "What changed?", operationId: "message-1" }).messages.length, 13);
    const answer = repo.appendMessage({ chatId: scriptChatId, ownerId: "USR-M", id: "answer-1", author: "assistant", at: "2026-09-24T15:02:00Z", text: "The drawing shows the controller power path.", references: [{ kind: "citation", targetId: "3", label: "AHU-15 control panel" }, { kind: "source", targetId: "DF-S01", label: "Training register" }] });
    assert.equal(answer.messages.length, 14);
    assert.equal(answer.messages[13].references[0].citation.page, 148);
    assert.equal(answer.messages[13].references[1].sourceId, "DF-S01");
    assert.throws(() => repo.appendMessage({ chatId: scriptChatId, ownerId: "USR-A", id: "bad", author: "user", at: "2026-09-24T15:00:00Z", text: "No" }), RepositoryNotFoundError);
    const bytes = Buffer.from([137, 80, 78, 71, 1, 2, 3]);
    const photo = repo.putPhoto("USR-M", { id: "PH-001", chatId: scriptChatId, messageId: "followup-1", name: "check.png", mimeType: "image/png", description: "Panel", bytes });
    assert.equal(photo.size, bytes.length);
    assert.deepEqual(repo.getPhotoBytes("USR-M", photo.id), bytes);
    assert.equal(repo.getPhotoBytes("USR-A", photo.id), null);
    assert.equal(repo.getChat("USR-M", scriptChatId).messages[12].photo.name, "check.png");
    assert.equal(JSON.stringify(repo.listChats("USR-M")).includes("bytes"), false);
    assert.equal(JSON.stringify(repo.getChat("USR-M", scriptChatId)).includes("bytes"), false);
    assert.equal(repo.recordFault("USR-M", { id: "fault-1", chatId: scriptChatId, messageId: "followup-1", equipment: "AHU-15", code: "TEST-X9", at: "2026-09-24T15:01:00Z", photoId: photo.id }).photoId, photo.id);
    assert.equal(repo.listFaults("USR-M", scriptChatId).length, 1);
    assert.deepEqual(repo.listFaults("USR-A", scriptChatId), []);
    assert.equal(repo.closeOrder({ orderId: "1043", actorId: "USR-M", note: "Resolved.", expectedVersion: 2, operationId: "close-1" }).status, "closed");
    assert.throws(() => repo.closeOrder({ orderId: "1043", actorId: "USR-A", note: "Again.", expectedVersion: 2, operationId: "close-2" }), RepositoryConflictError);
    assert.equal(repo.getReceipt("USR-A", "create-1").resultId, "1043");
    assert.equal(seedBaseline(fixture.connection), false);
    assert.equal(repo.getOrder("1043").status, "closed");
    resetBaseline(fixture.connection);
    assert.equal(repo.getOrder("1043"), null);
    assert.equal(repo.getChat("USR-M", scriptChatId).messages.length, 12);
    assert.equal(repo.listOrders().length, 6);
    assert.equal(repo.getReceipt("USR-A", "create-1"), null);
    assert.equal(repo.getPhotoBytes("USR-M", photo.id), null);
  } finally { fixture.cleanup(); }
});

test("invalid stored rich JSON fails validation at the repository boundary", () => {
  const fixture = temporaryDatabase();
  try {
    seedBaseline(fixture.connection);
    fixture.connection.client.prepare("update messages set rich_json = ? where id = ?").run('{"version":1,"blocks":[{"kind":"unsafe"}]}', "CH-AHU15-USR-M-S01");
    const repo = new SqliteAskPatRepository(fixture.connection);
    assert.throws(() => repo.getChat("USR-M", "CH-AHU15-USR-M"));
  } finally { fixture.cleanup(); }
});

test("counter reconciliation advances past imported identifiers and timestamps", () => {
  const fixture = temporaryDatabase();
  try {
    seedBaseline(fixture.connection);
    const db = fixture.connection.client;
    db.prepare("insert into orders (id, issue_id, location_id, requester_id, created_at, status, version) values (?, ?, ?, ?, ?, ?, ?)").run("2000", "ISS-D01", "LOC-D01", "USR-M", "2026-10-01T12:00:00Z", "open", 1);
    db.prepare("insert into chats (id, owner_id, title, created_at, updated_at) values (?, ?, ?, ?, ?)").run("CH-G999", "USR-M", "Imported", "2026-10-01T12:00:00Z", "2026-10-01T12:00:00Z");
    db.prepare("insert into messages (id, chat_id, ordinal, author, status, at, content_kind, body_text) values (?, ?, ?, ?, ?, ?, ?, ?)").run("CH-G999-M1", "CH-G999", 1, "user", "sent", "2026-10-01T12:01:00Z", "plain", "Imported message");
    db.prepare("insert into photos (id, chat_id, message_id, name, mime_type, size, description, bytes) values (?, ?, ?, ?, ?, ?, ?, ?)").run("PH-1200", "CH-G999", "CH-G999-M1", "imported.png", "image/png", 3, "Imported", Buffer.from([1, 2, 3]));
    reconcileRuntimeCounters(fixture.connection);
    const repo = new SqliteAskPatRepository(fixture.connection);
    assert.equal(repo.createOrder({ issueId: "ISS-D01", locationId: "LOC-D01", requesterId: "USR-M", remark: "New", operationId: "after-import" }).id, "2001");
    assert.equal(repo.createGeneralChat("USR-M", "New", "after-import-chat").id, "CH-G1201");
    assert.equal(repo.reserveChatArtifactId("USR-M", "CH-G999", "photo").id, "PH-1202");
    assert.ok(Date.parse(repo.getOrder("2001").createdAt) > Date.parse("2026-10-01T12:00:00Z"));
  } finally { fixture.cleanup(); }
});
