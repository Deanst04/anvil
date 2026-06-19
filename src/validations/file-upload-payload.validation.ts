import { z } from "zod";
import { ALLOWED_MIME_TYPES } from "./file.validation";

const UUID_FILE_NAME_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]+$/i;

const TEMP_FILE_PATH_REGEX =
  /^storage\/temp\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]+$/i;

const ORIGINAL_FILE_NAME_REGEX = /^.+\.[a-zA-Z0-9]+$/u;

export const fileUploadPayloadSchema = z.object({
  size: z.number().positive("File size must be greater than 0"),
  mimeType: z.enum(ALLOWED_MIME_TYPES),
  tempPath: z
    .string()
    .min(1, "Temporary file path is required")
    .regex(
      TEMP_FILE_PATH_REGEX,
      "Temporary file path must be in format: storage/temp/<uuid>.<extension>",
    ),
  objectKey: z
    .string()
    .min(1, "Object key is required")
    .regex(
      UUID_FILE_NAME_REGEX,
      "Object key must be in format: <uuid>.<extension>",
    ),
  originalName: z
    .string()
    .min(1, "Original filename is required")
    .regex(
      ORIGINAL_FILE_NAME_REGEX,
      "Original filename must include a file extension",
    ),
});

export type FileUploadPayload = z.infer<typeof fileUploadPayloadSchema>;
