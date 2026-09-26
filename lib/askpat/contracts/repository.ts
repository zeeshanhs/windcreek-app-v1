import type { AddRemarkInput, AppendMessageInput, ChatDetail, ChatList, CloseOrderInput, CreateOrderInput, Fault, Issue, Location, OrderDetail, OrderList, PhotoMetadata, Receipt, Reference, User } from "./index";

export type Page<T> = { items: T[]; nextCursor: string | null; hasMore: boolean };
export type DemoSendInput = { chatId: string | null; text: string; operationId: string; photo?: { name: string; mimeType: "image/png" | "image/jpeg"; description: string; bytes: Buffer } };
export type DemoSendResult = { chatId: string; messageId: string; replayed: boolean; chat: ChatDetail };

export interface AskPatRepository {
  listUsers(): User[];
  listIssues(): Issue[];
  listLocations(): Location[];
  listOrders(): OrderList[];
  pageOrders(options: { limit: number; cursor?: string; status?: "open" | "closed"; query?: string; sort?: "newest" | "oldest" }): Page<OrderList>;
  getOrder(id: string): OrderDetail | null;
  createOrder(input: CreateOrderInput): OrderDetail;
  addRemark(input: AddRemarkInput): OrderDetail;
  closeOrder(input: CloseOrderInput): OrderDetail;
  listChats(ownerId: string): ChatList[];
  pageChats(ownerId: string, options: { limit: number; cursor?: string; kind?: "general" | "linked"; query?: string }): Page<ChatList>;
  getChat(ownerId: string, chatId: string, afterOrdinal?: number, limit?: number): ChatDetail | null;
  getOrCreateLinkedChat(ownerId: string, orderId: string, operationId: string): ChatDetail;
  createGeneralChat(ownerId: string, title: string, operationId: string): ChatDetail;
  sendDemoMessage(ownerId: string, input: DemoSendInput): DemoSendResult;
  chooseEquipment(ownerId: string, chatId: string, promptMessageId: string, useNewUnit: boolean, operationId: string): ChatDetail;
  retryUnknownFault(ownerId: string, chatId: string, messageId: string): ChatDetail;
  getReference(ownerId: string, referenceId: string): { reference: Reference; source: { id: string; title: string; version: string } | null; order: OrderDetail | null } | null;
  appendMessage(input: AppendMessageInput): ChatDetail;
  putPhoto(ownerId: string, input: { id: string; chatId: string; messageId: string; name: string; mimeType: "image/png" | "image/jpeg"; description: string; bytes: Buffer }): PhotoMetadata;
  getPhotoMetadata(ownerId: string, photoId: string): PhotoMetadata | null;
  getPhotoBytes(ownerId: string, photoId: string): Buffer | null;
  recordFault(ownerId: string, input: { id: string; chatId: string; messageId: string; equipment: string; code: string; at: string; photoId?: string }): Fault;
  listFaults(ownerId: string, chatId: string): Fault[];
  getReceipt(actorId: string, operationId: string): Receipt | null;
  reserveChatArtifactId(ownerId: string, chatId: string, kind: "message" | "photo"): { id: string; at: string };
}
