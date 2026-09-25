import { ensureScenarioChats, initialState, type DemoState, type Message, type Photo } from "./fixtures";
import { applyCreateOrder, applyCloseOrder, applyAddRemark, applyLinkedChat, nextTimestamp } from "./model";
export { AlreadyClosedError, VersionConflictError } from "./model";

const DB_NAME = "askpat-wcap-001-demo";
const DB_VERSION = 1;
const STATE_KEY = "current";
const CHANNEL_NAME = "askpat-wcap-001-changes";
let database: Promise<IDBDatabase> | undefined;
const listeners = new Set<() => void>();
let channel: BroadcastChannel | undefined;

function request<T>(value: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => { value.onsuccess = () => resolve(value.result); value.onerror = () => reject(value.error); });
}
function completed(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onabort = () => reject(tx.error ?? new Error("The demo store could not save this change.")); tx.onerror = () => reject(tx.error ?? new Error("The demo store could not save this change.")); });
}
async function openDatabase(): Promise<IDBDatabase> {
  if (!database) database = new Promise<IDBDatabase>((resolve, reject) => {
    const opening = indexedDB.open(DB_NAME, DB_VERSION);
    opening.onupgradeneeded = () => {
      const db = opening.result;
      if (!db.objectStoreNames.contains("state")) db.createObjectStore("state");
      if (!db.objectStoreNames.contains("relationships")) db.createObjectStore("relationships");
    };
    opening.onsuccess = () => resolve(opening.result);
    opening.onerror = () => reject(opening.error);
  }).catch((error) => { database = undefined; throw error; });
  return database;
}
function announce() {
  listeners.forEach((listener) => listener());
  if (typeof BroadcastChannel !== "undefined") {
    channel ??= new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage("changed");
  }
}
export function subscribe(listener: () => void) {
  listeners.add(listener);
  if (typeof BroadcastChannel !== "undefined" && !channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = () => listeners.forEach((current) => current());
  }
  return () => { listeners.delete(listener); };
}
export async function readState(): Promise<DemoState> {
  const db = await openDatabase();
  const tx = db.transaction(["state", "relationships"], "readwrite");
  const stateStore = tx.objectStore("state");
  let state = await request(stateStore.get(STATE_KEY)) as DemoState | undefined;
  if (!state) {
    state = initialState();
    stateStore.put(state, STATE_KEY);
    const relationships = tx.objectStore("relationships");
    for (const chat of state.chats) if (chat.orderId) relationships.put(chat.id, `${chat.ownerId}|${chat.orderId}`);
  } else if (ensureScenarioChats(state)) {
    stateStore.put(state, STATE_KEY);
  }
  await completed(tx);
  return state;
}
export async function resetDemo() {
  const db = await openDatabase();
  const tx = db.transaction(["state", "relationships"], "readwrite");
  const fresh = initialState();
  tx.objectStore("relationships").clear();
  for (const chat of fresh.chats) if (chat.orderId) tx.objectStore("relationships").put(chat.id, `${chat.ownerId}|${chat.orderId}`);
  tx.objectStore("state").put(fresh, STATE_KEY);
  await completed(tx);
  announce();
}
type Stores = { relationships: IDBObjectStore };
async function mutate<T>(change: (state: DemoState, stores: Stores) => Promise<T> | T): Promise<T> {
  const db = await openDatabase();
  const tx = db.transaction(["state", "relationships"], "readwrite");
  const store = tx.objectStore("state");
  const state = (await request(store.get(STATE_KEY)) as DemoState | undefined) ?? initialState();
  ensureScenarioChats(state);
  try {
    const result = await change(state, { relationships: tx.objectStore("relationships") });
    store.put(state, STATE_KEY);
    await completed(tx);
    announce();
    return result;
  } catch (error) {
    try { tx.abort(); } catch { /* The transaction may already have completed. */ }
    throw error;
  }
}
export async function createOrder(payload: { issueId: string; locationId: string; remark: string; requesterId: string }, operationId: string) {
  return mutate((state) => applyCreateOrder(state, payload, operationId));
}
export async function closeOrder(orderId: string, actorId: string, note: string, expectedVersion: number, operationId: string) {
  return mutate((state) => applyCloseOrder(state, orderId, actorId, note, expectedVersion, operationId));
}
export async function addRemark(orderId: string, actorId: string, text: string, operationId: string) {
  return mutate((state) => applyAddRemark(state, orderId, actorId, text, operationId));
}
export async function getOrCreateLinkedChat(ownerId: string, orderId: string, operationId: string) {
  return mutate(async (state, stores) => {
    const key = `${ownerId}|${orderId}`;
    const existing = await request(stores.relationships.get(key)) as string | undefined;
    const id = applyLinkedChat(state, ownerId, orderId, operationId, existing);
    if (!existing) stores.relationships.put(id, key);
    return id;
  });
}
export async function sendMessage(args: { chatId: string | null; ownerId: string; text: string; photo?: { file: File; description: string }; operationId: string }): Promise<{ chatId: string; messageId: string }> {
  return mutate((state) => {
    const prior = state.receipts[args.operationId];
    if (prior) { const [chatId, messageId] = prior.split("|"); return { chatId, messageId }; }
    if (!args.text.trim() && !args.photo) throw new Error("Add a message or photo.");
    let chat = args.chatId ? state.chats.find((item) => item.id === args.chatId && item.ownerId === args.ownerId) : undefined;
    if (args.chatId && !chat) throw new Error("This conversation isn't available to your account.");
    const at = nextTimestamp(state, "other");
    if (!chat) {
      const id = `CH-G${String(state.sequence++).padStart(3, "0")}`;
      chat = { id, ownerId: args.ownerId, orderId: null, title: args.text.trim().slice(0, 56) || "Photo conversation", createdAt: at, updatedAt: at, messages: [] };
      state.chats.push(chat);
    }
    let photoId: string | undefined;
    if (args.photo) {
      const { file, description } = args.photo;
      if (!["image/png", "image/jpeg"].includes(file.type) || file.size > 10 * 1024 * 1024) throw new Error("Choose one PNG or JPEG up to 10 MB.");
      photoId = `PH-${String(state.sequence++).padStart(3, "0")}`;
      const photo: Photo = { id: photoId, name: file.name, type: file.type, size: file.size, blob: file, description };
      state.photos.push(photo);
    }
    const messageId = `${chat.id}-M${String(state.sequence++).padStart(3, "0")}`;
    const message: Message = { id: messageId, chatId: chat.id, author: "user", text: args.text.trim() || `Photo attached: ${args.photo?.file.name}`, at, status: "sent", photoId };
    chat.messages.push(message); chat.updatedAt = at;
    state.receipts[args.operationId] = `${chat.id}|${messageId}`;
    return { chatId: chat.id, messageId };
  });
}
export async function appendAnswer(chatId: string, ownerId: string, messageId: string, text: string, references: Message["references"] = []) {
  return mutate((state) => {
    const chat = state.chats.find((item) => item.id === chatId && item.ownerId === ownerId);
    if (!chat) throw new Error("This conversation isn't available to your account.");
    const existing = chat.messages.find((item) => item.id === `${messageId}-answer`);
    if (existing) return existing;
    const at = nextTimestamp(state, "other");
    const answer: Message = { id: `${messageId}-answer`, chatId, author: "assistant", text, at, status: "sent", references };
    chat.messages.push(answer); chat.updatedAt = at;
    return answer;
  });
}
export async function recordUnknownFault(chatId: string, messageId: string, equipment: string, code: string, photoId?: string) {
  return mutate((state) => {
    const id = `${messageId}-fault`;
    if (!state.faults.some((fault) => fault.id === id)) state.faults.push({ id, chatId, equipment, code, at: state.clock, messageId, photoId });
    return id;
  });
}

export async function retryUnknownFaultLog(chatId: string, ownerId: string, messageId: string, equipment: string, code: string, photoId?: string) {
  return mutate((state) => {
    const chat = state.chats.find((item) => item.id === chatId && item.ownerId === ownerId);
    if (!chat) throw new Error("This conversation isn't available to your account.");
    const answer = chat.messages.find((item) => item.id === `${messageId}-answer`);
    if (!answer) throw new Error("The original response isn't available.");
    const id = `${messageId}-fault`;
    if (!state.faults.some((fault) => fault.id === id)) state.faults.push({ id, chatId, equipment, code, at: state.clock, messageId, photoId });
    answer.text = "I don't have a confirmed meaning for TEST-X9 in the available material. Please confirm the code and the equipment tag; a readable photo may help.\n\nUnrecognized code recorded for this chat.";
    return id;
  });
}

export async function resolveEquipmentPrompt(chatId: string, ownerId: string, promptId: string, useNewUnit: boolean) {
  return mutate((state) => {
    const chat = state.chats.find((item) => item.id === chatId && item.ownerId === ownerId);
    const prompt = chat?.messages.find((item) => item.id === promptId && item.author === "assistant" && item.text.startsWith("This question concerns FCU-D02."));
    if (!chat || !prompt) throw new Error("This equipment choice isn't available.");
    const choiceId = `${promptId}-choice`;
    if (chat.messages.some((item) => item.id === choiceId)) return chat.equipment;
    if (useNewUnit) chat.equipment = "FCU-D02";
    const at = nextTimestamp(state, "other");
    chat.messages.push({ id: choiceId, chatId, author: "assistant", text: useNewUnit ? "Equipment context: FCU-D02. This change is for this conversation only; the linked service order is unchanged." : "Equipment context remains AHU-D01. This conversation and its linked service order are unchanged.", at, status: "sent", references: useNewUnit ? [{ kind: "source", id: "DF-S01", label: "Demo source · Training equipment register · Entry EQ-D02", locator: "EQ-D02" }] : [] });
    chat.updatedAt = at;
    return chat.equipment;
  });
}
