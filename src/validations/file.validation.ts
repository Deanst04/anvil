import { z } from "zod";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "text/plain",
] as const;

export const fileUploadSchema = z.object({
  fieldname: z.literal("file"),
  originalname: z.string().min(1, "Original filename is required"),
  filename: z.string().min(1, "Generated filename is required"),
  mimetype: z.enum(ALLOWED_MIME_TYPES),
  path: z.string().min(1, "File path is required"),
  size: z
    .number()
    .positive("File size must be greater than 0")
    .max(MAX_FILE_SIZE, `File size must not exceed ${MAX_FILE_SIZE} bytes`),
});
