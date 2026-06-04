import prisma from "../infrastructure/prisma";
import { env } from "../config/env";

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
      const events = await prisma.event.updateMany({
        where: {
          status: "PROCESSING",
          updatedAt: {
            lt: cutoffDate,
          },
        },
        data: {
          status: "FAILED",
        },
      });
      if (events.count > 0) {
        console.log(`${events.count} events failed at ${new Date(Date.now())}`);
      }
    } catch (e) {
      console.error("Event recover worker failed:", e);
    } finally {
      isRecovering = false;
    }
  }, 10000);
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
  console.log(`${eventWorker} - event ${eventId} is currently PROCESSING ${new Date()}`);
  await sleep(env.EVENT_PROCESSING_TIME_MS);
  const eventById = await prisma.event.findUnique({
    where: {
      id: eventId,
    },
  });
  if (!eventById) {
    return;
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
