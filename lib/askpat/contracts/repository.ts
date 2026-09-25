import type { AddRemarkInput, AppendMessageInput, ChatDetail, ChatList, CloseOrderInput, CreateOrderInput, Fault, Issue, Location, OrderDetail, OrderList, PhotoMetadata, Receipt, User } from "./index";

export interface AskPatRepository {
  listUsers(): User[];
  listIssues(): Issue[];
  listLocations(): Location[];
  listOrders(): OrderList[];
  getOrder(id: string): OrderDetail | null;
  createOrder(input: CreateOrderInput): OrderDetail;
  addRemark(input: AddRemarkInput): OrderDetail;
  closeOrder(input: CloseOrderInput): OrderDetail;
  listChats(ownerId: string): ChatList[];
  getChat(ownerId: string, chatId: string): ChatDetail | null;
  getOrCreateLinkedChat(ownerId: string, orderId: string, operationId: string): ChatDetail;
  createGeneralChat(ownerId: string, title: string, operationId: string): ChatDetail;
  appendMessage(input: AppendMessageInput): ChatDetail;
  putPhoto(ownerId: string, input: { id: string; chatId: string; messageId: string; name: string; mimeType: "image/png" | "image/jpeg"; description: string; bytes: Buffer }): PhotoMetadata;
  getPhotoMetadata(ownerId: string, photoId: string): PhotoMetadata | null;
  getPhotoBytes(ownerId: string, photoId: string): Buffer | null;
  recordFault(ownerId: string, input: { id: string; chatId: string; messageId: string; equipment: string; code: string; at: string; photoId?: string }): Fault;
  listFaults(ownerId: string, chatId: string): Fault[];
  getReceipt(actorId: string, operationId: string): Receipt | null;
  reserveChatArtifactId(ownerId: string, chatId: string, kind: "message" | "photo"): { id: string; at: string };
}
