import logger from "../utils/logger.js";
//
// Central place for all Google Gemini calls used by the Expense Tracker.
// Replaces the old scratch file "Gemini Integration.js" (that file was
// just a standalone test script and was never wired into the app).
//
// Requires GEMINI_API_KEY in your .env file. Get a key at
// https://aistudio.google.com/apikey
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// Model choice: gemini-2.5-flash is fast + cheap, which is exactly what
// a "classify this one sentence" call needs. Swap to "gemini-3.7-flash"
// if you want the newer model - same API shape either way.
// const MODEL = "gemini-2.5-flash";
// const MODEL = "gemini-3.7-flash";
const MODEL = "gemini-3-flash-preview";
// Keeping this to a fixed, closed list (instead of letting the model
// invent categories) means the UI/filtering code never has to deal with
// unpredictable category strings.
const CATEGORIES = ["Food", "Groceries", "Travel", "Shopping", "Bills", "Entertainment", "Health", "Education", "Other"];
/**
* Given a free-text expense description (e.g. "Lunch at Domino's"),
* ask Gemini which category it belongs to.
* Always resolves to a valid category - falls back to "Other" on any
* empty input, unparseable response, or API error, so a Gemini outage
* never blocks someone from adding an expense.
*/
export async function suggestCategory(description) {
if (!description || !description.trim()) return "Other";
try {
const prompt = [
"You are an expense categorization assistant for a personal finance app.",
`Classify the expense description into EXACTLY ONE of these categories: ${CATEGORIES.join(", ")}.`,
"Reply with only the category word - no punctuation, no explanation.",
"",
`Expense description: "${description.trim()}"`,
"Category:",
].join("\n");
const response = await ai.models.generateContent({
model: MODEL,
contents: prompt,
});
const raw = (response.text ?? "").trim();
const match = CATEGORIES.find((c) => raw.toLowerCase() === c.toLowerCase()) ?? CATEGORIES.find((c) => raw.toLowerCase().includes(c.toLowerCase()));
return match ?? "Other";
} catch (error) {
logger.error("Gemini suggestCategory error:", { error: error?.message || error, stack: error?.stack });
return "Other";
}
}
/**
* Innovative extra: turns a user's recent expenses into a short,
* friendly spending observation/tip. Used by GET /expanse/insights.
*/
export async function getSpendingInsight(expenses) {
if (!expenses || expenses.length === 0) {
return "Add a few expenses and I'll start spotting patterns in your spending.";
}
try {
logger.info("Expanses :: ", expenses);
const summary = expenses
.slice(0, 30)
.map((e) => `- ${e.category}: ${e.amount} (${e.description})`)
.join("\n");
const prompt = [
"You are a friendly personal finance assistant inside an expense tracker app.",
"Here are a user's most recent expenses:",
summary,
"",
"In 2-3 short, conversational sentences, share one practical observation or",
"money-saving tip based on this spending pattern. Be encouraging, not preachy.",
"Do not just list the numbers back.",
].join("\n");
const response = await ai.models.generateContent({
model: MODEL,
contents: prompt,
});
return (response.text ?? "").trim() || "Keep tracking - patterns will emerge as you add more expenses.";
} catch (error) {
logger.error("Gemini getSpendingInsight error:", { error: error?.message || error, stack: error?.stack });
return "Insights are temporarily unavailable - please try again shortly.";
}
}
export { CATEGORIES };
