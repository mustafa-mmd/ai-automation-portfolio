import { GoogleGenAI } from "@google/genai";
import { Pinecone } from "@pinecone-database/pinecone";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Serve a basic frontend web page right from this directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(__dirname));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index(process.env.PINECONE_INDEX_NAME);

// API endpoint for your web interface to talk to
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // 1. Vectorize user query
    const embedResponse = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: message,
      config: { outputDimensionality: 1024 },
    });
    const queryEmbedding = embedResponse.embeddings[0].values;

    // 2. Query Pinecone
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true,
    });

    // 3. Extract Context
    const contextText = queryResponse.matches
      .map((match) => match.metadata.text)
      .join("\n\n---\n\n");

    // 4. Prompt construction
    const prompt = `Answer the user's question based strictly on the context below. If you don't know, say you don't know.\n\nContext:\n${contextText}\n\nQuestion: ${message}`;

    // 5. Generate with Gemini Flash
    const genResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ response: genResponse.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 4000;
app.listen(PORT, () =>
  console.log(`🌍 Interactive app running at http://localhost:${PORT}`),
);
