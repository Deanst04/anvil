import { NotificationSendPayload } from "../validations/notification-event.validation";
import axios from "axios";
import { env } from "../config/env";

export async function sendTelegramNotification(
  payload: NotificationSendPayload,
) {
  const telegramUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  const attachmentsText = payload.attachments.length
    ? payload.attachments
        .map((file, index) => {
          return [
            `Attachment #${index + 1}`,
            `📄 File: ${file.fileName}`,
            file.mimeType ? `🧩 Type: ${file.mimeType}` : undefined,
            "🔗 Open file:",
            file.url,
          ]
            .filter(Boolean)
            .join("\n");
        })
        .join("\n\n")
    : "No attachments";

  const text = [
    "🔨 Anvil Notification",
    "",
    `📌 ${payload.title}`,
    "",
    "📝 Message",
    payload.message,
    "",
    `📎 Attachments (${payload.attachments.length})`,
    attachmentsText,
    "",
    "📊 Metadata",
    `• Event ID: ${payload.metadata.sourceEventId}`,
    `• Bucket: ${payload.metadata.bucket}`,
    `• Object Key: ${payload.metadata.objectKey}`,
    `• Uploaded At: ${payload.metadata.uploadedAt}`,
  ].join("\n");

  try {
    await axios.post(telegramUrl, {
      chat_id: env.TELEGRAM_CHAT_ID,
      text,
    });
    console.log(
      `[Telegram] Notification sent successfully for source event "${payload.metadata.sourceEventId}".`,
    );
  } catch (e) {
    console.error("[Telegram] Failed to send notification.", e);
    throw e;
  }
}
