import { env } from "../config/env";
import { Client } from "minio";

const minio = new Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});

export async function ensureBucketExists() {
  const bucketName = env.MINIO_BUCKET_NAME;
  try {
    const bucketExists = await minio.bucketExists(bucketName);
    if (bucketExists) {
      console.log(`[MinIO] Bucket "${bucketName}" already exists.`);
      return;
    }
    await minio.makeBucket(bucketName);
    console.log(`[MinIO] Created bucket "${bucketName}".`);
  } catch (e) {
    console.error(`[MinIO] Failed to initialize bucket "${bucketName}".`, e);
    throw e;
  }
}

export default minio;
