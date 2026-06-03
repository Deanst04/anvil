import { Router } from "express";
import { createEvent, getEventsStats } from "../controllers/events.controller";
import validationMiddleware from "../middlewares/validation.middleware";
import { createEventSchema } from "../validations/event.validation";

const router = Router();

router.post("/", validationMiddleware(createEventSchema, "body"), createEvent);
router.get("/stats", getEventsStats);

export default router;
