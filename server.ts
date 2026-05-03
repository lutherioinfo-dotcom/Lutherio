import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = apiKey && apiKey !== "undefined" ? new GoogleGenAI({ apiKey }) : null;

  if (!genAI) {
    console.warn("WARNING: GEMINI_API_KEY is not defined or invalid. AI proxy will fail.");
  }

  // AI Chat Proxy Route
  app.post("/api/chat", async (req, res) => {
    const { message, history, systemInstruction } = req.body;

    if (!genAI) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
    }

    try {
      // Build history contents if they exist
      const contents = history ? [...history.map((h: any) => ({
        role: h.role,
        parts: h.parts ? h.parts : [{ text: h.content || "" }]
      })), { role: 'user', parts: [{ text: message }] }] : [{ role: 'user', parts: [{ text: message }] }];

      const responseStream = await genAI.models.generateContentStream({
        model: "gemini-2.0-flash",
        contents,
        config: {
          systemInstruction: systemInstruction || "You are Professor Luther, a sophisticated canine-themed academic assistant. Precise, encouraging, and using academic elegance with occasional professional dog-related metaphors.",
        }
      });

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(chunk.text);
        }
      }
      res.end();
    } catch (error: any) {
      console.error("Gemini Error:", error);
      const statusCode = error.status || 500;
      res.status(statusCode).json({ 
        error: error.message || "Failed to communicate with AI service.",
        details: error.toString()
      });
    }
  });

  // API Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
