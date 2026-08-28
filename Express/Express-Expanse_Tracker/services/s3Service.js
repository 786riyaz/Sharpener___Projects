import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3, { S3_BUCKET_NAME } from "../config/s3.js";

// The bucket stays private - we never make objects public. Every download
// link is a time-limited presigned URL, generated on demand (both right
// after upload and again whenever report history is viewed later, since
// a URL saved at generation time would eventually expire).
const PRESIGNED_URL_EXPIRY_SECONDS = 60 * 60; // 1 hour

export async function uploadReportToS3(key, csvContent) {
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: csvContent,
      ContentType: "text/csv",
    }),
  );
}

export async function getReportDownloadUrl(key) {
  const command = new GetObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key });
  return getSignedUrl(s3, command, { expiresIn: PRESIGNED_URL_EXPIRY_SECONDS });
}
