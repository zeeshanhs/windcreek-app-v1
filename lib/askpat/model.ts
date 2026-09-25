import { issueFor, locationFor, type Chat, type DemoState, type Order } from "./fixtures";

export class AlreadyClosedError extends Error { constructor(public order: Order) { super("This order has already been closed."); } }
export class VersionConflictError extends Error { constructor(public order: Order) { super("The order changed while you were reviewing it."); } }

export function nextTimestamp(state: DemoState, kind: "create" | "close" | "other") {
  const floor = Date.parse(kind === "close" ? "2026-09-24T10:35:00Z" : kind === "create" ? "2026-09-24T10:31:00Z" : "2026-09-24T10:30:00Z");
  const current = Date.parse(state.clock);
  const next = new Date(Math.max(current + 60_000, floor)).toISOString();
  state.clock = next;
  return next;
}
export function applyCreateOrder(state: DemoState, payload: { issueId: string; locationId: string; remark: string; requesterId: string }, operationId: string) {
  const prior = state.receipts[operationId];
  if (prior) return prior;
  if (!issueFor(payload.issueId) || !locationFor(payload.locationId) || !state.users.some((u) => u.id === payload.requesterId) || !payload.remark.trim()) throw new Error("Choose an issue and location, then add a remark.");
  const id = String(Math.max(...state.orders.map((order) => Number(order.id))) + 1);
  const at = nextTimestamp(state, "create");
  const order: Order = { id, issueId: payload.issueId, locationId: payload.locationId, requesterId: payload.requesterId, createdAt: at, status: "open", version: 1, remarks: [{ id: `${id}-R1`, authorId: payload.requesterId, at, text: payload.remark.trim() }], events: [{ id: `${id}-E1`, kind: "created", actorId: payload.requesterId, at }] };
  state.orders.unshift(order);
  state.receipts[operationId] = id;
  return id;
}
export function applyCloseOrder(state: DemoState, orderId: string, actorId: string, note: string, expectedVersion: number, operationId: string) {
  if (state.receipts[operationId]) return state.orders.find((order) => order.id === orderId)!;
  const order = state.orders.find((candidate) => candidate.id === orderId);
  if (!order) throw new Error("This item isn't available to your account.");
  if (order.status === "closed") throw new AlreadyClosedError(order);
  if (order.version !== expectedVersion) throw new VersionConflictError(order);
  if (!note.trim() || !state.users.some((user) => user.id === actorId)) throw new Error("Add a resolution note.");
  const at = nextTimestamp(state, "close");
  order.status = "closed"; order.version += 1;
  order.closure = { actorId, at, note: note.trim() };
  order.events.push({ id: `${orderId}-E${order.events.length + 1}`, kind: "closed", actorId, at, text: note.trim() });
  state.receipts[operationId] = orderId;
  return order;
}
export function applyAddRemark(state: DemoState, orderId: string, actorId: string, text: string, operationId: string) {
  const order = state.orders.find((candidate) => candidate.id === orderId);
  if (!order) throw new Error("This item isn't available to your account.");
  if (state.receipts[operationId]) return order;
  if (order.status === "closed") throw new AlreadyClosedError(order);
  if (!text.trim()) throw new Error("Add a remark.");
  const at = nextTimestamp(state, "other");
  const id = `${orderId}-R${order.remarks.length + 1}`;
  order.remarks.push({ id, authorId: actorId, at, text: text.trim() });
  order.events.push({ id: `${orderId}-E${order.events.length + 1}`, kind: "remark", actorId, at, text: text.trim() });
  order.version += 1;
  state.receipts[operationId] = id;
  return order;
}
export function applyLinkedChat(state: DemoState, ownerId: string, orderId: string, operationId: string, existingId?: string) {
  const order = state.orders.find((candidate) => candidate.id === orderId);
  if (!order || !state.users.some((user) => user.id === ownerId)) throw new Error("This item isn't available to your account.");
  if (existingId) return existingId;
  const id = `CH-L${String(state.sequence++).padStart(3, "0")}`;
  const at = nextTimestamp(state, "other");
  const chat: Chat = { id, ownerId, orderId, title: issueFor(order.issueId)?.label ?? `SO #${orderId}`, equipment: order.equipment, createdAt: at, updatedAt: at, messages: [] };
  state.chats.push(chat);
  state.receipts[operationId] = id;
  return id;
}
