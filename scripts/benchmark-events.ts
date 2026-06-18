import axios from "axios";
import prisma from "../src/infrastructure/prisma";
import { sleep } from "../src/workers/event.worker";
import { env } from "../src/config/env";

const TOTAL_EVENTS = 100;

const benchmarkConfig = {
  totalEvents: TOTAL_EVENTS,
  workerCount: env.EVENT_WORKER_COUNT,
  workerIntervalMs: env.EVENT_WORKER_INTERVAL_MS,
  processingTimeMs: env.EVENT_PROCESSING_TIME_MS,
  stuckTimeoutMs: env.EVENT_STUCK_TIMEOUT_MS,
  maxClaimAttempts: env.EVENT_MAX_CLAIM_ATTEMPTS,
};

async function main() {
  const API_URL = "http://localhost:3000";
  await prisma.event.deleteMany();
  try {
    let eventsArr = [];
    const startTime = Date.now();
    for (let i = 0; i < TOTAL_EVENTS; i++) {
      eventsArr.push({
        type: "user.created",
        payload: {
          userId: `usr_${i}`,
          email: `user${i}@example.com`,
        },
      });
    }
    const eventPromises = eventsArr.map((event) => {
      return axios.post(`${API_URL}/events`, event);
    });
    await Promise.all(eventPromises);
    // axios call to POST API_URL/events with all the events
    let stats;
    while (true) {
      stats = await axios.get(`${API_URL}/events/stats`);
      if (
        stats.data.results.COMPLETED + stats.data.results.FAILED ===
        TOTAL_EVENTS
      ) {
        break;
      }
      await sleep(1000);
    }
    const endTime = Date.now();
    const results = {
      benchmark: { ...benchmarkConfig },
      Duration: `${(endTime - startTime) / 1000} seconds`,
      stats: { ...stats.data.results },
    };
    console.log("Benchmark completed:", results);
  } catch (e) {
    console.error("Benchmark failed:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
