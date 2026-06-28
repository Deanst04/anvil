import {
  NotificationSendPayload,
  notificationSendPayloadSchema,
} from "../../validations/notification-event.validation";
import prisma from "../../infrastructure/prisma";
import z from "zod";

export type CreateFileUploadCompletedNotificationEventInput = {
  sourceEventId: string;
  bucket: string;
  objectKey: string;
  originalName: string;
  uploadedAt: string;
};

export default async function createFileUploadCompletedNotificationEvent(
  file: CreateFileUploadCompletedNotificationEventInput,
) {
  const payload: NotificationSendPayload = {
    provider: "telegram",
    kind: "file.upload.completed",
    title: "File upload completed",
    message: `File "${file.originalName}" was uploaded successfully.`,
    metadata: {
      sourceEventId: file.sourceEventId,
      bucket: file.bucket,
      objectKey: file.objectKey,
      originalName: file.originalName,
      uploadedAt: file.uploadedAt,
    },
  };
  const result = notificationSendPayloadSchema.safeParse(payload);
  if (!result.success) {
    console.error(
      `[Notification] Failed to validate file upload completed notification payload for source event "${payload.metadata.sourceEventId}".`,
      result.error,
    );
    throw new Error(
      `Failed to validate notification payload: ${JSON.stringify(z.treeifyError(result.error))}`,
    );
  }
  const validatedPayload = result.data;
  try {
    const event = await prisma.event.create({
      data: {
        type: "notification.send",
        payload: validatedPayload,
      },
    });
    return event;
  } catch (e) {
    console.error(
      `[Notification] Failed to create notification event for source event "${validatedPayload.metadata.sourceEventId}".`,
      e,
    );
    throw e;
  }
}
