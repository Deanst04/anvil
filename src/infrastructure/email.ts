import nodemailer from "nodemailer";
import { env } from "../config/env";
import { NotificationSendPayload } from "../validations/notification-event.validation";

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: env.EMAIL_SECURE,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
});

export async function sendEmailNotification(payload: NotificationSendPayload) {
  const subject = payload.title;

  const attachmentsText = payload.attachments.length
    ? payload.attachments
        .map((file, index) => {
          return [
            `Attachment #${index + 1}`,
            `File: ${file.fileName}`,
            file.mimeType ? `Type: ${file.mimeType}` : undefined,
            "Open file:",
            file.url,
          ]
            .filter(Boolean)
            .join("\n");
        })
        .join("\n\n")
    : "No attachments";

  const body = [
    "Anvil Notification",
    "",
    "Message",
    "-------",
    payload.message,
    "",
    `Attachments (${payload.attachments.length})`,
    "-----------",
    attachmentsText,
    "",
    "Metadata",
    "--------",
    `Event ID: ${payload.metadata.sourceEventId}`,
    `Bucket: ${payload.metadata.bucket}`,
    `Object Key: ${payload.metadata.objectKey}`,
    `Uploaded At: ${payload.metadata.uploadedAt}`,
  ].join("\n");

  try {
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to: env.EMAIL_TO,
      subject,
      text: body,
    });
    console.log(
      `[Email] Notification sent successfully for source event "${payload.metadata.sourceEventId}".`,
    );
  } catch (e) {
    console.error("[Email] Failed to send notification.", e);
    throw e;
  }
}
