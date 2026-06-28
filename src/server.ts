import app from "./app";
import { env } from "./config/env";
import { ensureBucketExists } from "./infrastructure/minio";
import {
  recoverManyStuckProcessingEvents,
  startEventWorkerPool,
} from "./workers/event.worker";

async function bootstrap() {
  await ensureBucketExists();
  startEventWorkerPool(env.EVENT_WORKER_COUNT);
  recoverManyStuckProcessingEvents();
  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
}

bootstrap().catch((e) => {
  console.error(`[Startup] Failed to start Anvil.`, e);
  process.exit(1);
});
