import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined. AI features will not work.");
}

const genAI = new GoogleGenAI({ apiKey: apiKey || "" });

export const getGeminiModel = (model: string = "gemini-3-flash-preview") => {
  return genAI.models.generateContent.bind(null, { model });
};

// Simple chat function using local server proxy
export async function* streamChat(message: string, history: any[] = []) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: errorText || "Unknown server error" };
      }
      yield { text: errorData.error || "Failed to communicate with AI server." };
      return;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      yield { text: "Failed to read stream from server." };
      return;
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield { text: decoder.decode(value, { stream: true }) };
    }
  } catch (error) {
    console.error("Chat Proxy Error:", error);
    yield { text: "Network error. Please ensure the server is running." };
  }
}

export async function generateNotes(transcript: string) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        message: `Convert the following transcript into structured, beautiful markdown notes: ${transcript}`,
        systemInstruction: "You are Lutherio, a specialized note-taking AI. Convert transcripts into structured markdown with key points, summaries, and action items."
      }),
    });

    if (!response.ok) return "Failed to generate notes.";

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    if (!reader) return "Failed to read stream.";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullText += decoder.decode(value, { stream: true });
    }
    return fullText;
  } catch (error) {
    console.error("Notes Error:", error);
    return "Failed to generate notes. Please try again.";
  }
}
