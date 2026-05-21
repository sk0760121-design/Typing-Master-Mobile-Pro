import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with custom User-Agent configuration for AI Studio build telemetry
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient && apiKey) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// REST route to generate smart AI practice paragraphs custom-fit to weak keys
app.post("/api/generate-text", async (req, res) => {
  const { weakKeys = [], difficulty = "beginner", category = "general" } = req.body;

  const weakKeysStr = weakKeys.length > 0 ? weakKeys.join(", ") : "no specific letters";
  
  // Custom fallback text options in case the API key is not configured yet or has rate limits
  const fallbackTexts: Record<string, string[]> = {
    beginner: [
      "asdf jkl; asdf jkl; a; sldk fjgh a; sldk fjgh",
      "sad lass falls; ask dad; a salad; a glass flask",
      "dad led a glad lad; falls as fast as a flash",
      "jess asked dad for a salad that had fresh kale",
    ],
    intermediate: [
      "The quick brown fox jumps over the lazy dog in a spectacular display of speed.",
      "Typing with your fingers resting correctly on the home row keys will boost accuracy, speed, and overall performance.",
      "Navigate standard layouts like QWERTY dynamically, keeping wrists level and looking straight at the high-contrast screen.",
      "In modern programming, writing clean code quickly is a superpower. Practice these sentences repeatedly daily.",
    ],
    advanced: [
      "const calculateWpm = (chars, time) => Math.round((chars / 5) / (time / 60)); // Check this formula!",
      "import { useState, useEffect } from 'react'; export default function TypeMaster() { const [wpm, setWpm] = useState(0); }",
      "A fast-paced digital landscape necessitates impeccable keyboarding; speed-burst exercises and rhythmic drills refine fluid execution.",
      "Neon indicators flashed in the twilight, revealing: 100% accuracy, speed 120 WPM, and zero microsecond key-release latency.",
    ],
  };

  const difficultyKey = difficulty.toLowerCase();
  const list = fallbackTexts[difficultyKey] || fallbackTexts["intermediate"];
  const baselineFallback = list[Math.floor(Math.random() * list.length)];

  if (!apiKey) {
    // If no key is set, log and return high-fidelity fallback text mimicking Gemini
    console.log("No GEMINI_API_KEY env variable set. Returning custom pre-compiled smart fallback text.");
    return res.json({
      text: baselineFallback,
      isAiGenerated: false,
      message: "Showing custom responsive practice text. Add your Gemini API key in Settings > Secrets to unlock full generative smart custom-text drills!"
    });
  }

  try {
    const activeAi = getAiClient();
    if (!activeAi) {
      throw new Error("Failed to initialize Google Gen AI client.");
    }

    const promptMessage = `Generate a dynamic and cohesive typing practice paragraph.
Requirements:
- Difficulty Level: ${difficulty}
- Focus letters (mistyped keys): contain these heavily if possible: [${weakKeysStr}]
- Subject Category / Style: ${category}
- Constraints: Exact text only, do not include any quotes, intro, explanation, markdown formatting. Keep it between 120 to 250 characters. Maintain natural readable sentences (unless doing keyboard exercise drills). Let's make it exciting, modern, and engaging.`;

    const response = await activeAi.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptMessage,
      config: {
        temperature: 0.8,
        systemInstruction: "You are an expert interactive gaming typing coach. Your sole duty is to output flawless typing drills or paragraphs without markdown, wrapper quotes, or introductory thoughts. Directly output the test text itself.",
      }
    });

    const generatedText = response.text ? response.text.trim() : baselineFallback;

    return res.json({
      text: generatedText,
      isAiGenerated: true,
      message: "Successfully generated premium customized smart drill using Gemini!"
    });
  } catch (error: any) {
    console.error("Gemini text generation failed:", error);
    return res.json({
      text: baselineFallback,
      isAiGenerated: false,
      error: error.message,
      message: "Failed to generate AI text due to rate limits or connection. Defaulting to local drills."
    });
  }
});

// Setup Vite Dev Server / Static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TypeMaster Pro full-stack server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
