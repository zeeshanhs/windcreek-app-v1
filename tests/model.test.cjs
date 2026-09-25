/* eslint-disable @typescript-eslint/no-require-imports */
require("./register-ts.cjs");
const test = require("node:test");
const assert = require("node:assert/strict");
const { ensureScenarioChats, initialState, scenarioChatId } = require("../lib/askpat/fixtures.ts");
const { applyCreateOrder, applyCloseOrder, applyAddRemark, applyLinkedChat, nextTimestamp, AlreadyClosedError, VersionConflictError } = require("../lib/askpat/model.ts");
const { demoAnswer } = require("../lib/askpat/responses.ts");

test("seed has the required order and user-scoped chat relationships", () => {
  const state = initialState();
  assert.deepEqual(state.orders.map((order) => order.id), ["1042", "1041", "1040", "1039", "1038", "1037"]);
  assert.equal(state.orders.filter((order) => order.status === "open").length, 4);
  assert.equal(state.chats.filter((chat) => chat.ownerId === "USR-M").length, 6);
  assert.equal(state.chats.find((chat) => chat.id === "CH-D01").messages.length, 4);
  assert.equal(state.chats.find((chat) => chat.id === "CH-D01").orderId, "1042");
  assert.equal(state.chats.find((chat) => chat.id === "CH-S01").ownerId, "USR-S");
  assert.equal(state.chats.filter((chat) => chat.ownerId === "USR-M" && !chat.orderId).length, 3);
});

test("create validates fields and returns the same SO 1043 for an operation retry", () => {
  const state = initialState();
  const payload = { issueId: "ISS-D05", locationId: "LOC-D07", remark: "Guestroom 703 feels warmer than the neighboring rooms. Please investigate.", requesterId: "USR-A" };
  assert.throws(() => applyCreateOrder(state, { ...payload, remark: "   " }, "bad"));
  assert.equal(state.orders.length, 6);
  assert.equal(applyCreateOrder(state, payload, "create-1"), "1043");
  assert.equal(applyCreateOrder(state, payload, "create-1"), "1043");
  assert.equal(state.orders.length, 7);
  assert.equal(state.orders[0].status, "open");
  assert.equal(state.orders[0].requesterId, "USR-A");
  assert.equal(state.orders[0].createdAt, "2026-09-24T10:31:00.000Z");
});

test("linked chat identity is per user and order, while general chats remain distinct", () => {
  const state = initialState();
  const morgan = applyLinkedChat(state, "USR-M", "1042", "m", "CH-D01");
  const sam = applyLinkedChat(state, "USR-S", "1042", "s", "CH-S01");
  const avery = applyLinkedChat(state, "USR-A", "1042", "a");
  assert.equal(morgan, "CH-D01"); assert.equal(sam, "CH-S01");
  assert.notEqual(avery, morgan);
  assert.equal(state.chats.filter((chat) => chat.ownerId === "USR-A" && chat.orderId === "1042").length, 1);
  assert.equal(state.chats.filter((chat) => chat.ownerId === "USR-M" && chat.orderId === null).length, 3);
});

test("scenario chat migrates into existing demo data once per user without an order", () => {
  const state = initialState();
  state.chats = state.chats.filter((chat) => !chat.scenarioId);
  assert.equal(ensureScenarioChats(state), true);
  assert.equal(ensureScenarioChats(state), false);
  for (const user of state.users) {
    const matching = state.chats.filter((chat) => chat.id === scenarioChatId(user.id));
    assert.equal(matching.length, 1);
    assert.equal(matching[0].ownerId, user.id);
    assert.equal(matching[0].orderId, null);
    assert.equal(matching[0].scenarioId, "ahu-15");
  }
});

test("AHU-15 follow-up answers stay within the scripted chat context", () => {
  const state = initialState();
  const chat = state.chats.find((item) => item.id === scenarioChatId("USR-M"));
  const cause = demoAnswer("Why did the breaker trip?", chat, undefined);
  assert.match(cause.text, /does not establish why/);
  assert.deepEqual(cause.references.map((reference) => reference.id), ["3"]);
  const fans = demoAnswer("Why are fans 3 and 4 off?", chat, undefined);
  assert.deepEqual(fans.references.map((reference) => reference.id), ["1", "6"]);
  const ticket = demoAnswer("Was a ticket logged?", chat, undefined);
  assert.match(ticket.text, /no service order or ticket was created/);
  assert.equal(ticket.references, undefined);
});

test("closure requires note and version, remains idempotent, and does not end chats", () => {
  const state = initialState();
  const originalChats = state.chats.length;
  assert.throws(() => applyCloseOrder(state, "1042", "USR-A", " ", 1, "bad"));
  assert.throws(() => applyCloseOrder(state, "1042", "USR-A", "Reviewed", 99, "stale"), VersionConflictError);
  const closed = applyCloseOrder(state, "1042", "USR-A", "Duplicate report confirmed.", 1, "close-1");
  assert.equal(closed.status, "closed");
  assert.equal(closed.closure.actorId, "USR-A");
  assert.equal(closed.closure.at, "2026-09-24T10:35:00.000Z");
  assert.equal(applyCloseOrder(state, "1042", "USR-A", "Duplicate report confirmed.", 1, "close-1").events.length, 3);
  assert.throws(() => applyCloseOrder(state, "1042", "USR-M", "Overwrite", 2, "close-2"), AlreadyClosedError);
  assert.equal(state.orders.find((order) => order.id === "1042").closure.note, "Duplicate report confirmed.");
  assert.equal(state.chats.length, originalChats);
  assert.equal(state.chats.find((chat) => chat.id === "CH-D01").orderId, "1042");
});

test("remarks are explicit, idempotent shared writes and closed orders reject them", () => {
  const state = initialState();
  applyAddRemark(state, "1042", "USR-M", "No new cause confirmed.", "remark-1");
  applyAddRemark(state, "1042", "USR-M", "No new cause confirmed.", "remark-1");
  assert.equal(state.orders[0].remarks.length, 3);
  assert.equal(state.orders[0].events.length, 3);
  assert.equal(state.chats.find((chat) => chat.id === "CH-D01").messages.length, 4);
  applyCloseOrder(state, "1042", "USR-A", "Duplicate report.", state.orders[0].version, "close-1");
  assert.throws(() => applyAddRemark(state, "1042", "USR-M", "After close", "remark-2"), AlreadyClosedError);
});

test("responses cite only supported demo sources and do not invent a fault meaning or motion", () => {
  const state = initialState();
  const chat = state.chats.find((item) => item.id === "CH-D01");
  const order = state.orders.find((item) => item.id === "1042");
  const area = demoAnswer("Which unit serves Conference Room C?", chat, order);
  assert.equal(area.references[0].id, "DF-S01");
  assert.match(area.text, /listed as serving Conference Room C/);
  const unknown = demoAnswer("What does TEST-X9 mean on AHU-D01?", chat, order);
  assert.match(unknown.text, /don't have a confirmed meaning/);
  assert.equal(unknown.unknownCode.code, "TEST-X9");
  const photo = demoAnswer("Is the heat wheel moving in this still photo?", chat, order);
  assert.match(photo.text, /cannot establish/);
  assert.deepEqual(photo.references, undefined);
  const unclearPhoto = demoAnswer("Here is the label I can read.", chat, order, true);
  assert.match(unclearPhoto.text, /detail needed to read this is not clear/);
});

test("unknown fault needs a unit and the first chat action can use the fixed demo time", () => {
  const state = initialState();
  assert.equal(nextTimestamp(state, "other"), "2026-09-24T10:30:00.000Z");
  assert.equal(nextTimestamp(state, "other"), "2026-09-24T10:31:00.000Z");
  const answer = demoAnswer("What does TEST-X9 mean?", undefined, undefined);
  assert.match(answer.text, /Which unit shows this code/);
  assert.equal(answer.unknownCode, undefined);
});

test("the training checklist advances from a visible tag to one comparison result", () => {
  const state = initialState();
  const chat = state.chats.find((item) => item.id === "CH-D01");
  const order = state.orders.find((item) => item.id === "1042");
  const first = demoAnswer("Start the identification checklist", chat, order);
  assert.equal(first.references[0].locator, "Step 1");
  chat.messages.push({ id: "step-1", chatId: chat.id, author: "assistant", text: first.text, at: state.clock, status: "sent", references: first.references });
  const matchingTag = demoAnswer("The tag is AHU-D01", chat, order);
  const wrongTag = demoAnswer("The tag is RTU-D04", chat, order);
  const unreadable = demoAnswer("The tag is unreadable", chat, order);
  assert.equal(matchingTag.references[0].locator, "Step 2");
  assert.match(wrongTag.text, /does not match/);
  assert.match(unreadable.text, /identification remains incomplete/);
  chat.messages.push({ id: "step-2", chatId: chat.id, author: "assistant", text: matchingTag.text, at: state.clock, status: "sent", references: matchingTag.references });
  const confirmed = demoAnswer("The label matches", chat, order);
  assert.equal(confirmed.references[0].locator, "Step 3");
  assert.match(confirmed.text, /does not establish a mechanical cause/);
});
