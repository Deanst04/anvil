import { z } from "zod";

export const createEventSchema = z.object({
  type: z
    .string()
    .min(1, "type is required")
    .regex(/^[a-z]+\.[a-z]+$/, "type must be in format: resource.action"),
  payload: z
    .record(z.string(), z.unknown())
    .refine((payload) => Object.keys(payload).length > 0, {
      message: "payload must contain at least one key-value pair",
    }),
});
