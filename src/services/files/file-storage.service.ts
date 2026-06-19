import minio from "../../infrastructure/minio";
import { createReadStream } from "fs";
import { env } from "../../config/env";

export default async function uploadFile(tempPath: string, objectKey: string) {
  const bucket = env.MINIO_BUCKET_NAME;
  const stream = createReadStream(tempPath);
  await minio.putObject(bucket, objectKey, stream);
  const protocol = env.MINIO_USE_SSL ? "https" : "http";
  const url = `${protocol}://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}/${env.MINIO_BUCKET_NAME}/${objectKey}`;
  return {
    objectKey,
    bucket,
    url,
    uploadedAt: new Date().toISOString(),
  };
}
