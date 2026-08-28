/*
// Setup
# Initialize project
npm init -y

# Install the official Google Gen AI SDK
npm install @google/genai

npm install dotenv

"type": "module"
*/

import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

// Initialize the client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      model: "gemini-3.7-flash",
      contents: "Explain the benefits of Node.js in one sentence.",
    });

    console.log(response.text);
  } catch (error) {
    console.error("Error generating content:", error);
  }
}

main();
