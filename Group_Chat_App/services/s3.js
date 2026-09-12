const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const required = ["AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "S3_BUCKET_NAME"];
function assertAwsConfig() {
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
throw new Error(`Missing AWS configuration: ${missing.join(", ")}`);
}
}
const s3 = new S3Client({
region: process.env.AWS_REGION,
credentials: {
accessKeyId: process.env.AWS_ACCESS_KEY_ID,
secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
}
});
function sanitizeFileName(fileName) {
return String(fileName || "file")
.replace(/[^a-zA-Z0-9._-]/g, "_")
.slice(-120);
}
async function uploadMedia(file) {
assertAwsConfig();
const key = `chat-media/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${sanitizeFileName(file.originalname)}`;
await s3.send(new PutObjectCommand({
Bucket: process.env.S3_BUCKET_NAME,
Key: key,
Body: file.buffer,
ContentType: file.mimetype,
ContentDisposition: "inline"
}));
const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(key).replace(/%2F/g, "/")}`;
return {
key,
url,
originalName: file.originalname,
mimeType: file.mimetype,
size: file.size
};
}
module.exports = { uploadMedia };