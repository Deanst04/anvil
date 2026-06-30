import { z } from "zod";
import { ALLOWED_MIME_TYPES } from "./file.validation";

export const notificationAttachmentSchema = z.object({
  type: z.literal("file"),
  url: z.url(),
  fileName: z.string().min(1, "Filename cannot be empty"),
  mimeType: z.enum(ALLOWED_MIME_TYPES).optional(),
});

export const notificationSendPayloadSchema = z.object({
  provider: z.enum(["telegram", "email"]),
  kind: z.enum(["file.upload.completed"]),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  metadata: z.object({
    sourceEventId: z.uuid(),
    bucket: z.string().min(1, "Bucket name is required"),
    objectKey: z.string().min(1, "Object key is required"),
    originalName: z.string().min(1, "Original name is required"),
    uploadedAt: z.iso.datetime(),
  }),
  attachments: z.array(notificationAttachmentSchema),
});

export type NotificationSendPayload = z.infer<
  typeof notificationSendPayloadSchema
>;

export type NotificationAttachment = z.infer<
  typeof notificationAttachmentSchema
>;
