import dotenv from "dotenv";
import z from "zod";
import {
  NODE_ENV_VALUES,
  NODE_ENVS,
  type NodeEnv,
} from "../constants/node-env";

function isNodeEnv(value: string): value is NodeEnv {
  return (NODE_ENV_VALUES as readonly string[]).includes(value);
}
let currentNodeEnv = process.env.NODE_ENV;
if (!currentNodeEnv) {
  currentNodeEnv = NODE_ENVS.DEVELOPMENT;
} else if (!isNodeEnv(currentNodeEnv)) {
  throw new Error(`Invalid NODE_ENV value: ${currentNodeEnv}`);
}
const envFile =
  currentNodeEnv === NODE_ENVS.DEVELOPMENT ? ".env" : `.env.${currentNodeEnv}`;

dotenv.config({ path: envFile });

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string(),
  EVENT_WORKER_COUNT: z.coerce.number().int().min(1).default(3),
  NODE_ENV: z.enum(NODE_ENV_VALUES).default(NODE_ENVS.DEVELOPMENT),
  EVENT_WORKER_INTERVAL_MS: z.coerce.number().int().min(100).default(4000),
  EVENT_PROCESSING_TIME_MS: z.coerce.number().int().min(100).default(4000),
  EVENT_STUCK_TIMEOUT_MS: z.coerce.number().int().min(1000).default(10000),
  EVENT_MAX_CLAIM_ATTEMPTS: z.coerce.number().int().min(1).default(3),
  MINIO_ENDPOINT: z.string().default("localhost"),
  MINIO_PORT: z.coerce.number().int().default(9000),
  MINIO_ACCESS_KEY: z.string(),
  MINIO_SECRET_KEY: z.string(),
  MINIO_BUCKET_NAME: z.string(),
  MINIO_USE_SSL: z
    .preprocess((bool) => bool === "true", z.boolean())
    .default(false),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables", parsedEnv.error.flatten());
  process.exit(1);
}

export const env = parsedEnv.data;
