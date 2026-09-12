const { GoogleGenAI } = require("@google/genai");
const { buildPredictiveTypingPrompt, buildSmartRepliesPrompt } = require("../prompts/geminiPrompts");
const enabled = () => String(process.env.AI_SUGGESTIONS_ENABLED || "false").toLowerCase() === "true";
const DEFAULT_MODEL = "gemini-3.5-flash-lite";
function getClient() {
if (!enabled()) return null;
if (!process.env.GEMINI_API_KEY) return null;
return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}
function sleep(ms) {
return new Promise((resolve) => setTimeout(resolve, ms));
}
function extractJson(text, fallback) {
try {
const cleaned = String(text || "")
.replace(/^```json\s*/i, "")
.replace(/^```\s*/i, "")
.replace(/```$/i, "")
.trim();
return JSON.parse(cleaned);
} catch {
return fallback;
}
}
function getErrorDetails(error) {
const message = String(error?.message || "");
const status = Number(error?.status || error?.statusCode || error?.code || 0);
return { message, status };
}
function shouldRetry(error) {
const { message, status } = getErrorDetails(error);
return status === 429 || status === 503 || /\b(429|503)\b/i.test(message) || /RESOURCE_EXHAUSTED|UNAVAILABLE|high demand/i.test(message);
}
async function generateJson(prompt, fallback) {
const client = getClient();
if (!client) return { available: false, data: fallback };
const attempts = 3;
let delay = 800;
let lastError;
for (let attempt = 1; attempt <= attempts; attempt += 1) {
try {
const response = await client.models.generateContent({
model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
contents: prompt,
config: {
temperature: 0.35,
responseMimeType: "application/json"
}
});
return { available: true, data: extractJson(response.text, fallback) };
} catch (error) {
lastError = error;
if (attempt === attempts || !shouldRetry(error)) break;
await sleep(delay);
delay *= 2;
}
}
throw lastError;
}
function normalizeList(value, max, maxLength) {
if (!Array.isArray(value)) return [];
const seen = new Set();
return value
.map((item) => String(item || "").replace(/\s+/g, " ").trim())
.filter(Boolean)
.filter((item) => {
const key = item.toLocaleLowerCase();
if (seen.has(key)) return false;
seen.add(key);
return true;
})
.slice(0, max)
.map((item) => item.slice(0, maxLength));
}
async function getPredictiveSuggestions({ draft, context, style }) {
const prompt = buildPredictiveTypingPrompt({ draft, context, style });
const result = await generateJson(prompt, { suggestions: [] });
return {
available: result.available,
suggestions: normalizeList(result.data?.suggestions, 3, 45)
};
}
async function getSmartReplies({ incomingMessage, context, style }) {
const prompt = buildSmartRepliesPrompt({ incomingMessage, context, style });
const result = await generateJson(prompt, { replies: [] });
return {
available: result.available,
replies: normalizeList(result.data?.replies, 3, 90)
};
}
module.exports = {
isAiEnabled: () => Boolean(getClient()),
getPredictiveSuggestions,
getSmartReplies
};