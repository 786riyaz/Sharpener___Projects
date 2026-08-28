import logger from "../utils/logger.js";
import nodemailer from "nodemailer";
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_SECURE = process.env.SMTP_SECURE === "true"; // true only for port 465
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
logger.warn(
"Warning: SMTP_HOST / SMTP_USER / SMTP_PASS are not set. " +
"Add them to a .env file before trying the forgot-password flow. " +
"See .env.example.",
);
}
const transporter = nodemailer.createTransport({
host: SMTP_HOST,
port: SMTP_PORT,
secure: SMTP_SECURE,
auth: {
user: SMTP_USER,
pass: SMTP_PASS,
},
});
export default transporter;
