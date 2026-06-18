import { Router } from "express";
import healthRouter from "./health.routes";
import eventsRouter from "./events.routes";
import fileUploadRouter from "./file-upload.routes";

const router = Router();

router.use("/health", healthRouter);
router.use("/events", eventsRouter);
router.use("/files", fileUploadRouter);

export default router;
