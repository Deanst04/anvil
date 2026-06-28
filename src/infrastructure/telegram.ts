import { NotificationSendPayload } from "../validations/notification-event.validation";
import axios from "axios";
import { env } from "../config/env";

export async function sendTelegramNotification(
  payload: NotificationSendPayload,
) {
  const telegramUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const text = `
🔨 Anvil Notifications

✅ File Upload Completed

📄 File: ${payload.metadata.originalName}

🪣 Bucket: ${payload.metadata.bucket}

🆔 Object Key: ${payload.metadata.objectKey}

🕒 Uploaded At: ${payload.metadata.uploadedAt}
  `;
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
