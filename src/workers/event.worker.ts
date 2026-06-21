import prisma from "../infrastructure/prisma";
import { env } from "../config/env";
import uploadFileService from "../services/files/file-storage.service";
import { unlink } from "fs/promises";
import { fileUploadPayloadSchema } from "../validations/file-upload-payload.validation";

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

function startEventWorker(eventWorker: string) {
  let isWorking = false;
  setInterval(async () => {
    if (isWorking) {
      return;
    }
    try {
      isWorking = true;
      const eventId = await claimNextPendingEvent();
      if (!eventId || eventId === null) {
        return;
      }
      await processEvent(eventId, eventWorker);
    } catch (e) {
      console.error(`Event worker ${eventWorker} failed:`, e);
    } finally {
      isWorking = false;
    }
  }, env.EVENT_WORKER_INTERVAL_MS);
}

export function recoverManyStuckProcessingEvents() {
  let isRecovering = false;
  setInterval(async () => {
    if (isRecovering) {
      return;
    }
    try {
      isRecovering = true;
      const cutoffDate = new Date(Date.now() - env.EVENT_STUCK_TIMEOUT_MS);
      const recoveredEvents = await prisma.event.updateMany({
        where: {
          status: "PROCESSING",
          updatedAt: {
            lt: cutoffDate,
          },
          recoveryAttempts: {
            lt: env.EVENT_MAX_RECOVERY_ATTEMPTS,
          },
        },
        data: {
          status: "PENDING",
          recoveryAttempts: {
            increment: 1,
          },
        },
      });
      const failedEvents = await prisma.event.updateMany({
        where: {
          status: "PROCESSING",
          updatedAt: {
            lt: cutoffDate,
          },
          recoveryAttempts: {
            gte: env.EVENT_MAX_RECOVERY_ATTEMPTS,
          },
        },
        data: {
          status: "FAILED",
        },
      });
      if (recoveredEvents.count > 0) {
        console.log(
          `${recoveredEvents.count} events recovered at ${new Date(Date.now())}`,
        );
      }
      if (failedEvents.count > 0) {
        console.log(
          `${failedEvents.count} events failed at ${new Date(Date.now())}`,
        );
      }
    } catch (e) {
      console.error("Event recover worker failed:", e);
    } finally {
      isRecovering = false;
    }
  }, env.EVENT_STUCK_TIMEOUT_MS);
}

async function claimNextPendingEvent() {
  for (let i = 0; env.EVENT_MAX_CLAIM_ATTEMPTS > i; i++) {
    const event = await prisma.event.findFirst({
      where: {
        status: "PENDING",
      },
    });
    if (!event) {
      return null;
    }
    const eventId = event.id;
    const updatedEvent = await prisma.event.updateMany({
      where: {
        id: eventId,
        status: "PENDING",
      },
      data: {
        status: "PROCESSING",
      },
    });
    if (updatedEvent.count === 1) {
      return event.id;
    }
    if (updatedEvent.count === 0) {
      continue;
    }
  }
  return null;
}

async function processEvent(eventId: string, eventWorker: string) {
  console.log(
    `${eventWorker} - event ${eventId} is currently PROCESSING ${new Date()}`,
  );
  // await sleep(env.EVENT_PROCESSING_TIME_MS);
  const eventById = await prisma.event.findUnique({
    where: {
      id: eventId,
    },
  });
  if (!eventById) {
    return;
  }
  switch (eventById.type) {
    case "file.upload": {
      const result = fileUploadPayloadSchema.safeParse(eventById.payload);
      if (!result.success) {
        await prisma.event.updateMany({
          where: {
            id: eventId,
            status: "PROCESSING",
          },
          data: {
            status: "FAILED",
          },
        });
        return;
      }
      const payload = result.data;
      const results = await uploadFileService(
        payload.tempPath,
        payload.objectKey,
      );
      try {
        await unlink(payload.tempPath);
      } catch (e) {
        console.error("Failed to delete temporary uploaded file", {
          tempFile: payload.tempPath,
          objectKey: results.objectKey,
          bucket: results.bucket,
          error: e,
        });
      }
      break;
    }
    default:
  }
  if (eventById.status === "PROCESSING") {
    await prisma.event.updateMany({
      where: {
        id: eventId,
        status: "PROCESSING",
      },
      data: {
        status: "COMPLETED",
      },
    });
    console.log(`${eventWorker} - event ${eventId} is COMPLETED ${new Date()}`);
  }
  return;
}

export function startEventWorkerPool(workerCount: number) {
  for (let i = 0; i < workerCount; i++) {
    startEventWorker(`worker-${i}`);
  }
}
