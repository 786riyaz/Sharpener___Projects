import morgan from "morgan";
import logger from "../utils/logger.js";

// Streams every HTTP request line into logs/combined.log through Winston,
// so request traffic and application logs both land in the same file.
const stream = {
  write: (message) => logger.info(message.trim()),
};

const requestLogger = morgan("combined", { stream });

export default requestLogger;
