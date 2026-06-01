import { Router } from "express";
import healthRouter from "./health.routes";
import eventsRouter from "./events.routes";

const router = Router();

router.use("/health", healthRouter);
router.use("/events", eventsRouter);

export default router;
