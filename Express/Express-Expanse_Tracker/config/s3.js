import { S3Client } from "@aws-sdk/client-s3";
import "dotenv/config";
import logger from "../utils/logger.js";

const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !S3_BUCKET_NAME) {
  logger.warn(
    "Warning: AWS_REGION / AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / S3_BUCKET_NAME are not fully set. " +
      "Add them to .env before trying the report-download feature. See .env.example.",
  );
}

// Never hardcode real AWS keys in source - always via .env (see .env.example).
const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export default s3;
