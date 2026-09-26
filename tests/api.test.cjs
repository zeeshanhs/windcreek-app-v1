/* eslint-disable @typescript-eslint/no-require-imports */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { migrate } = require("drizzle-orm/better-sqlite3/migrator");
const { openSqlite } = require("../lib/askpat/persistence/sqlite/connection.ts");
const { seedBaseline, isPristineBaseline } = require("../lib/askpat/persistence/sqlite/seed.ts");
const { handleAskPat } = require("../lib/askpat/server/api.ts");

const origin = "http://localhost:3000";
process.env.ASKPAT_APP_ORIGIN = origin;
process.env.ASKPAT_SESSION_SECRET = "wcap004-test-secret-only-never-use-in-production";

function database() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "wcap004-"));
  const file = path.join(directory, "demo.sqlite");
  const connection = openSqlite(file);
  migrate(connection.db, { migrationsFolder: path.join(__dirname, "../drizzle") });
  seedBaseline(connection);
  process.env.DATABASE_FILE = file;
  return { connection, close: () => { connection.close(); fs.rmSync(directory, { recursive: true, force: true }); delete process.env.DATABASE_FILE; } };
}

async function call(method, parts, { cookie, json, form, requestOrigin = origin } = {}) {
  const headers = {};
  if (cookie) headers.cookie = cookie;
  if (method !== "GET") headers.origin = requestOrigin;
  let body;
  if (json !== undefined) { headers["content-type"] = "application/json"; body = JSON.stringify(json); }
  if (form) body = form;
  const request = new Request(`${origin}/api/askpat/${parts.join("/")}`, { method, headers, body });
  return handleAskPat(request, parts);
}
const data = async (response) => (await response.json()).data;

async function signIn(email) {
  const response = await call("POST", ["session"], { json: { email, password: "demo" } });
  assert.equal(response.status, 200);
  const setCookie = response.headers.get("set-cookie");
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /SameSite=Lax/);
  return setCookie.split(";")[0];
}

test("sessions reject unsigned and cross-origin requests and revoke on logout", async () => {
  const fixture = database();
  try {
    assert.equal((await call("GET", ["session"])).status, 401);
    assert.equal((await call("POST", ["session"], { json: { email: "morgan.reed@example.com", password: "demo" }, requestOrigin: "https://evil.example" })).status, 403);
    const cookie = await signIn("morgan.reed@example.com");
    assert.equal((await call("GET", ["session"], { cookie })).status, 200);
    assert.equal((await call("POST", ["orders"], { cookie, requestOrigin: "", json: { issueId: "ISS-D01", locationId: "LOC-D01", remark: "No", operationId: crypto.randomUUID() } })).status, 403);
    assert.equal((await call("POST", ["orders"], { cookie, requestOrigin: "https://evil.example", json: { issueId: "ISS-D01", locationId: "LOC-D01", remark: "No", operationId: crypto.randomUUID() } })).status, 403);
    assert.equal((await call("DELETE", ["session"], { cookie })).status, 204);
    assert.equal((await call("GET", ["session"], { cookie })).status, 401);
    assert.equal(isPristineBaseline(fixture.connection), true);
  } finally { fixture.close(); }
});

test("order operations are actor-owned, versioned and retry-safe", async () => {
  const fixture = database();
  try {
    const cookie = await signIn("avery.cole@example.com");
    const operationId = crypto.randomUUID();
    const body = { issueId: "ISS-D01", locationId: "LOC-D01", remark: "Check airflow.", operationId };
    const created = await data(await call("POST", ["orders"], { cookie, json: body }));
    assert.equal(created.requesterId, "USR-A");
    assert.equal(created.id, "1043");
    assert.equal(isPristineBaseline(fixture.connection), false);
    assert.equal((await data(await call("POST", ["orders"], { cookie, json: body }))).id, "1043");
    assert.equal((await call("POST", ["orders"], { cookie, json: { ...body, requesterId: "USR-M" } })).status, 422);
    assert.equal((await call("POST", ["orders"], { cookie, json: { ...body, remark: "different" } })).status, 409);
    const remarkId = crypto.randomUUID();
    assert.equal((await data(await call("POST", ["orders", "1043", "remarks"], { cookie, json: { text: "Inspected label", operationId: remarkId } }))).version, 2);
    assert.equal((await data(await call("POST", ["orders", "1043", "remarks"], { cookie, json: { text: "Inspected label", operationId: remarkId } }))).remarks.length, 2);
    const stale = await call("POST", ["orders", "1043", "close"], { cookie, json: { note: "Done", expectedVersion: 1, operationId: crypto.randomUUID() } });
    assert.equal(stale.status, 409);
    assert.equal((await stale.json()).error.details.currentOrder.version, 2);
    const closeId = crypto.randomUUID();
    assert.equal((await data(await call("POST", ["orders", "1043", "close"], { cookie, json: { note: "Done", expectedVersion: 2, operationId: closeId } }))).status, "closed");
    assert.equal((await data(await call("POST", ["orders", "1043", "close"], { cookie, json: { note: "Done", expectedVersion: 2, operationId: closeId } }))).version, 3);
    const page = await data(await call("GET", ["orders"], { cookie }));
    assert.equal(page.items.length, 7);
  } finally { fixture.close(); }
});

test("AHU-15 sends append after authored turns, return one answer, and protect chats/photos", async () => {
  const fixture = database();
  try {
    const morgan = await signIn("morgan.reed@example.com");
    const sam = await signIn("sam.patel@example.com");
    const chatId = "CH-AHU15-USR-M";
    assert.equal((await call("GET", ["chats", chatId], { cookie: sam })).status, 404);
    const form = new FormData();
    const operationId = crypto.randomUUID();
    form.set("operationId", operationId);
    form.set("text", "Why did the breaker trip?");
    const firstResponse = await call("POST", ["chats", chatId, "messages"], { cookie: morgan, form });
    assert.equal(firstResponse.status, 201);
    const first = await data(firstResponse);
    assert.equal(first.messages.length, 2);
    assert.equal(first.messages[0].ordinal, 13);
    assert.equal(first.messages[1].ordinal, 14);
    assert.match(first.messages[1].content.text, /does not establish why/);
    assert.equal((await data(await call("POST", ["chats", chatId, "messages"], { cookie: morgan, form }))).replayed, true);
    assert.equal((await data(await call("GET", ["chats", chatId], { cookie: morgan }))).chat.messageCount, 14);
    assert.equal((await call("POST", ["chats", chatId, "messages"], { cookie: sam, form })).status, 404);
    const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3]);
    const photoForm = new FormData();
    photoForm.set("operationId", crypto.randomUUID()); photoForm.set("text", "Photo");
    photoForm.set("photo", new File([png], "panel.png", { type: "image/png" }));
    const photoSend = await data(await call("POST", ["chats", chatId, "messages"], { cookie: morgan, form: photoForm }));
    const photoId = photoSend.messages[0].photo.id;
    assert.equal((await call("GET", ["photos", photoId], { cookie: sam })).status, 404);
    const download = await call("GET", ["photos", photoId], { cookie: morgan });
    assert.equal(download.status, 200);
    assert.deepEqual(Buffer.from(await download.arrayBuffer()), png);
    assert.equal(download.headers.get("cache-control"), "no-store");
    const badForm = new FormData(); badForm.set("operationId", crypto.randomUUID()); badForm.set("text", "Bad photo"); badForm.set("photo", new File(["wrong"], "fake.png", { type: "image/png" }));
    assert.equal((await call("POST", ["chats", chatId, "messages"], { cookie: morgan, form: badForm })).status, 415);
    const largeForm = new FormData(); largeForm.set("operationId", crypto.randomUUID()); largeForm.set("text", "Large photo"); largeForm.set("photo", new File([Buffer.alloc(10 * 1024 * 1024 + 1)], "large.png", { type: "image/png" }));
    assert.equal((await call("POST", ["chats", chatId, "messages"], { cookie: morgan, form: largeForm })).status, 413);
    assert.equal((await data(await call("GET", ["chats", chatId], { cookie: morgan }))).chat.messageCount, 16);
  } finally { fixture.close(); }
});

test("reset revokes sessions and restores the complete pristine baseline", async () => {
  const fixture = database();
  try {
    assert.equal(isPristineBaseline(fixture.connection), true);
    fixture.connection.client.prepare("update order_remarks set text=? where id=?").run("Changed seed remark", "1042-R1");
    assert.equal(isPristineBaseline(fixture.connection), false);
    fixture.connection.client.prepare("update order_remarks set text=? where id=?").run("Airflow in Conference Room C feels lower than usual. Please investigate.", "1042-R1");
    assert.equal(isPristineBaseline(fixture.connection), true);
    const cookie = await signIn("morgan.reed@example.com");
    const created = await call("POST", ["chats"], { cookie, json: { title: "Another question", operationId: crypto.randomUUID() } });
    assert.equal(created.status, 201);
    assert.equal(isPristineBaseline(fixture.connection), false);
    assert.equal((await call("POST", ["reset"], { cookie, json: { confirmation: "wrong" } })).status, 422);
    assert.equal((await call("POST", ["reset"], { cookie, json: { confirmation: "RESET_DEMO" } })).status, 200);
    assert.equal((await call("GET", ["session"], { cookie })).status, 401);
    assert.equal(isPristineBaseline(fixture.connection), true);
    assert.equal(fixture.connection.client.prepare("select generation from reset_generation where id=1").get().generation, 1);
  } finally { fixture.close(); }
});

test("bounded pages, references, general sends, equipment choice and fault retry keep owner scope", async () => {
  const fixture = database();
  try {
    const morgan = await signIn("morgan.reed@example.com");
    const sam = await signIn("sam.patel@example.com");
    const first = await data(await call("GET", ["chats"], { cookie: morgan }));
    assert.equal(first.items.length, 6);
    const page1 = await data(await handleAskPat(new Request(`${origin}/api/askpat/chats?limit=2`, { headers: { cookie: morgan } }), ["chats"]));
    assert.equal(page1.items.length, 2);
    assert.equal(page1.hasMore, true);
    const page2 = await data(await handleAskPat(new Request(`${origin}/api/askpat/chats?limit=2&cursor=${encodeURIComponent(page1.nextCursor)}`, { headers: { cookie: morgan } }), ["chats"]));
    assert.notEqual(page1.items[0].id, page2.items[0].id);
    const referenceId = "CH-AHU15-USR-M-S02-REF1";
    assert.equal((await call("GET", ["references", referenceId], { cookie: sam })).status, 404);
    const citation = await data(await call("GET", ["references", referenceId], { cookie: morgan }));
    assert.equal(citation.reference.citation.id, 6);
    const newChatForm = new FormData();
    newChatForm.set("operationId", crypto.randomUUID()); newChatForm.set("text", "Which unit serves Conference Room C?");
    const created = await data(await call("POST", ["chats", "new", "messages"], { cookie: morgan, form: newChatForm }));
    assert.equal(created.messages.length, 2);
    assert.equal(created.messages[1].references[0].sourceId, "DF-S01");
    assert.equal((await call("GET", ["chats", created.chatId], { cookie: sam })).status, 404);
    const promptForm = new FormData(); promptForm.set("operationId", crypto.randomUUID()); promptForm.set("text", "What about FCU-D02?");
    const prompt = await data(await call("POST", ["chats", "CH-D01", "messages"], { cookie: morgan, form: promptForm }));
    assert.match(prompt.messages[1].content.text, /^This question concerns FCU-D02/);
    const choiceId = crypto.randomUUID();
    const choice = await data(await call("POST", ["chats", "CH-D01", "equipment-choice"], { cookie: morgan, json: { promptMessageId: prompt.answerId, useNewUnit: true, operationId: choiceId } }));
    assert.equal(choice.equipment, "FCU-D02");
    assert.equal((await call("POST", ["chats", "CH-D01", "equipment-choice"], { cookie: morgan, json: { promptMessageId: prompt.answerId, useNewUnit: false, operationId: crypto.randomUUID() } })).status, 409);
    assert.equal((await data(await call("GET", ["orders", "1042"], { cookie: morgan }))).equipment, "AHU-D01");
    const faultForm = new FormData(); faultForm.set("operationId", crypto.randomUUID()); faultForm.set("text", "TEST-X9 is showing");
    const faultSend = await data(await call("POST", ["chats", "CH-D01", "messages"], { cookie: morgan, form: faultForm }));
    assert.match(faultSend.messages[1].content.text, /Unrecognized code recorded/);
    assert.equal((await call("POST", ["chats", "CH-D01", "faults", faultSend.messageId, "retry"], { cookie: sam })).status, 404);
    assert.equal((await call("POST", ["chats", "CH-D01", "faults", faultSend.messageId, "retry"], { cookie: morgan })).status, 200);
    assert.equal(fixture.connection.client.prepare("select count(*) as n from unknown_faults where message_id=?").get(faultSend.messageId).n, 1);
  } finally { fixture.close(); }
});

test("a failed answer write rolls back the message and receipt, then the same send retries once", async () => {
  const fixture = database();
  try {
    const cookie = await signIn("morgan.reed@example.com");
    const form = new FormData();
    const id = crypto.randomUUID();
    form.set("operationId", id); form.set("text", "Which unit serves Conference Room C?");
    fixture.connection.client.exec("create trigger fail_new_reference before insert on message_references begin select raise(abort, 'test answer failure'); end");
    const oldError = console.error;
    console.error = () => {};
    try { assert.equal((await call("POST", ["chats", "new", "messages"], { cookie, form })).status, 500); }
    finally { console.error = oldError; }
    assert.equal(fixture.connection.client.prepare("select count(*) as n from operation_receipts where operation_id=?").get(id).n, 0);
    assert.equal(fixture.connection.client.prepare("select count(*) as n from chats where title=?").get("Which unit serves Conference Room C?").n, 0);
    fixture.connection.client.exec("drop trigger fail_new_reference");
    const retry = await data(await call("POST", ["chats", "new", "messages"], { cookie, form }));
    assert.equal(retry.messages.length, 2);
    assert.equal((await data(await call("POST", ["chats", "new", "messages"], { cookie, form }))).replayed, true);
    assert.equal(fixture.connection.client.prepare("select count(*) as n from chats where id=?").get(retry.chatId).n, 1);
  } finally { fixture.close(); }
});
