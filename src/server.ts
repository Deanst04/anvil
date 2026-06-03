import app from "./app";
import { env } from "./config/env";
import {
  recoverManyStuckProcessingEvents,
  startEventWorkerPool,
} from "./workers/event.worker";

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
  startEventWorkerPool(env.EVENT_WORKER_COUNT);
  recoverManyStuckProcessingEvents();
});
