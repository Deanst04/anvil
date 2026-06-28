import { z } from "zod";

export const notificationSendPayloadSchema = z.object({
  provider: z.enum(["telegram"]),
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
});

export type NotificationSendPayload = z.infer<
  typeof notificationSendPayloadSchema
>;
