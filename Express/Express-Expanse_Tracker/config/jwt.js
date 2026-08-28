import "dotenv/config";

// Must be set in .env - the app refuses to start without it (see index.js),
// since a missing/guessable secret would let anyone forge login tokens.
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
