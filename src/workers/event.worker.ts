import prisma from "../infrastructure/prisma";

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export default function startEventWorker() {
  let isWorking = false;
  setInterval(async () => {
    if (isWorking) {
      return;
    }
    try {
      const event = await prisma.event.findFirst({
        where: {
          status: "PENDING",
        },
      });
      if (!event) {
        return;
      }
      isWorking = true;
      const eventId = event.id;
      await prisma.event.update({
        where: {
          id: eventId,
        },
        data: {
          status: "PROCESSING",
        },
      });
      console.log(`event ${eventId} is currently PROCESSING ${new Date()}`);
      await sleep(4000);
      const updatedEvent = await prisma.event.findUnique({
        where: {
          id: eventId,
        },
      });
      if (!updatedEvent) {
        return;
      }
      if (updatedEvent.status === "PROCESSING") {
        await prisma.event.update({
          where: {
            id: eventId,
          },
          data: {
            status: "COMPLETED",
          },
        });
        console.log(`event ${eventId} is COMPLETED ${new Date()}`);
      }
    } catch (e) {
      console.error("Event worker failed:", e);
    } finally {
      isWorking = false;
    }
  }, 4000);
}
