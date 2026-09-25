import { z } from "zod";

export const idSchema = z.string().min(1);
export const isoTimeSchema = z.iso.datetime({ offset: true });
export const userSchema = z.object({ id: idSchema, name: z.string().min(1), initials: z.string().min(1), role: z.enum(["Technician", "Team member"]), email: z.email() });
export const issueSchema = z.object({ id: idSchema, label: z.string().min(1), category: z.string().min(1) });
export const locationSchema = z.object({ id: idSchema, label: z.string().min(1), area: z.string().min(1), equipment: z.string().nullable() });
export const remarkSchema = z.object({ id: idSchema, authorId: idSchema, text: z.string().min(1), at: isoTimeSchema, ordinal: z.number().int().positive() });
export const orderEventSchema = z.object({ id: idSchema, kind: z.enum(["created", "remark", "closed"]), actorId: idSchema, at: isoTimeSchema, text: z.string().nullable(), ordinal: z.number().int().positive() });
export const closureSchema = z.object({ actorId: idSchema, at: isoTimeSchema, note: z.string().min(1) });
const orderBaseSchema = z.object({ id: idSchema, issueId: idSchema, locationId: idSchema, requesterId: idSchema, createdAt: isoTimeSchema, status: z.enum(["open", "closed"]), version: z.number().int().positive(), equipment: z.string().nullable(), closure: closureSchema.nullable() });
const closureMatchesStatus = (value: { status: "open" | "closed"; closure: unknown }) => value.status === "closed" ? value.closure !== null : value.closure === null;
export const orderListSchema = orderBaseSchema.refine(closureMatchesStatus, "Order closure does not match its status.");
export const orderDetailSchema = orderBaseSchema.extend({ remarks: z.array(remarkSchema), events: z.array(orderEventSchema) }).refine(closureMatchesStatus, "Order closure does not match its status.");

export const citationIdSchema = z.number().int().min(1).max(6);
export const inlineSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("text"), text: z.string() }),
  z.object({ kind: z.literal("strong"), text: z.string() }),
  z.object({ kind: z.literal("citation"), id: citationIdSchema }),
]);
export const blockSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("paragraph"), content: z.array(inlineSchema) }),
  z.object({ kind: z.literal("ordered"), items: z.array(z.array(inlineSchema)) }),
]);
export const richContentSchema = z.object({ version: z.literal(1), blocks: z.array(blockSchema).min(1) });
export const contentSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("plain"), text: z.string() }),
  z.object({ kind: z.literal("rich"), rich: richContentSchema }),
]);
export const citationPageSchema = z.object({ id: citationIdSchema, document: z.string().min(1), sheet: z.string().min(1), page: z.number().int().positive(), image: z.string().startsWith("/"), width: z.number().int().positive(), height: z.number().int().positive() });
export const referenceSchema = z.object({ id: idSchema, ordinal: z.number().int().positive(), kind: z.enum(["source", "remark", "status", "citation"]), label: z.string().min(1), locator: z.string().nullable(), citation: citationPageSchema.nullable(), sourceId: idSchema.nullable(), orderId: idSchema.nullable() }).refine((ref) =>
  ref.kind === "citation" ? ref.citation !== null && ref.sourceId === null && ref.orderId === null
    : ref.kind === "source" ? ref.citation === null && ref.sourceId !== null && ref.orderId === null
      : ref.citation === null && ref.sourceId === null && ref.orderId !== null,
"Reference target does not match its kind.");
export const photoMetadataSchema = z.object({ id: idSchema, chatId: idSchema, messageId: idSchema, name: z.string().min(1), mimeType: z.enum(["image/png", "image/jpeg"]), size: z.number().int().min(0).max(10 * 1024 * 1024), description: z.string() });
export const messageSchema = z.object({ id: idSchema, chatId: idSchema, ordinal: z.number().int().positive(), author: z.enum(["user", "assistant"]), status: z.enum(["sent", "sending", "failed"]), at: isoTimeSchema.nullable(), displayTime: z.string().nullable(), speaker: z.string().nullable(), content: contentSchema, references: z.array(referenceSchema), photo: photoMetadataSchema.nullable() });
export const scenarioMetadataSchema = z.object({ id: idSchema, title: z.string().min(1), label: z.string().min(1), ticketSummary: z.string().min(1), followUps: z.array(z.string().min(1)) });
export const chatListSchema = z.object({ id: idSchema, ownerId: idSchema, orderId: idSchema.nullable(), scenarioId: idSchema.nullable(), title: z.string().min(1), equipment: z.string().nullable(), createdAt: isoTimeSchema, updatedAt: isoTimeSchema, messageCount: z.number().int().nonnegative() });
export const chatDetailSchema = chatListSchema.extend({ messages: z.array(messageSchema), scenario: scenarioMetadataSchema.nullable() });
export const faultSchema = z.object({ id: idSchema, chatId: idSchema, messageId: idSchema, equipment: z.string().min(1), code: z.string().min(1), at: isoTimeSchema, photoId: idSchema.nullable() });
export const receiptSchema = z.object({ operationId: idSchema, actorId: idSchema, kind: z.string().min(1), requestHash: z.string().min(1), resultId: idSchema, secondaryId: idSchema.nullable(), at: isoTimeSchema });

export const createOrderInputSchema = z.object({ issueId: idSchema, locationId: idSchema, remark: z.string().trim().min(1), requesterId: idSchema, operationId: idSchema });
export const addRemarkInputSchema = z.object({ orderId: idSchema, actorId: idSchema, text: z.string().trim().min(1), operationId: idSchema });
export const closeOrderInputSchema = z.object({ orderId: idSchema, actorId: idSchema, note: z.string().trim().min(1), expectedVersion: z.number().int().positive(), operationId: idSchema });
export const referenceInputSchema = z.object({ kind: z.enum(["source", "remark", "status", "citation"]), targetId: idSchema, label: z.string().min(1), locator: z.string().optional() });
export const appendMessageInputSchema = z.object({ chatId: idSchema, ownerId: idSchema, id: idSchema, author: z.enum(["user", "assistant"]), at: isoTimeSchema, text: z.string(), references: z.array(referenceInputSchema).optional(), operationId: idSchema.optional() });
export const linkedChatInputSchema = z.object({ ownerId: idSchema, orderId: idSchema, operationId: idSchema });
export const generalChatInputSchema = z.object({ ownerId: idSchema, title: z.string().trim().min(1), operationId: idSchema });
export const photoUploadMetadataSchema = z.object({ id: idSchema, chatId: idSchema, messageId: idSchema, name: z.string().min(1), mimeType: z.enum(["image/png", "image/jpeg"]), description: z.string() });
export const faultInputSchema = z.object({ id: idSchema, chatId: idSchema, messageId: idSchema, equipment: z.string().min(1), code: z.string().min(1), at: isoTimeSchema, photoId: idSchema.optional() });

export type User = z.infer<typeof userSchema>;
export type Issue = z.infer<typeof issueSchema>;
export type Location = z.infer<typeof locationSchema>;
export type OrderList = z.infer<typeof orderListSchema>;
export type OrderDetail = z.infer<typeof orderDetailSchema>;
export type ChatList = z.infer<typeof chatListSchema>;
export type ChatDetail = z.infer<typeof chatDetailSchema>;
export type Message = z.infer<typeof messageSchema>;
export type Reference = z.infer<typeof referenceSchema>;
export type PhotoMetadata = z.infer<typeof photoMetadataSchema>;
export type Fault = z.infer<typeof faultSchema>;
export type Receipt = z.infer<typeof receiptSchema>;
export type RichContent = z.infer<typeof richContentSchema>;
export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;
export type AddRemarkInput = z.infer<typeof addRemarkInputSchema>;
export type CloseOrderInput = z.infer<typeof closeOrderInputSchema>;
export type AppendMessageInput = z.infer<typeof appendMessageInputSchema>;
export type ReferenceInput = z.infer<typeof referenceInputSchema>;
export type PhotoUploadMetadata = z.infer<typeof photoUploadMetadataSchema>;
