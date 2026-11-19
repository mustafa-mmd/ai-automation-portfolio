import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import "dotenv/config";

// 🚀 Clean, native ESM import for the modern pdf-parse library
import { PDFParse } from "pdf-parse";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const index = pc.index(process.env.PINECONE_INDEX_NAME);

// Helper function to hit Gemini and generate a 1024-dimensional vector array
async function getGeminiEmbedding(text) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config: { outputDimensionality: 1024 },
  });
  return response.embeddings[0].values;
}

async function runIngestionPipeline() {
  try {
    console.log("📄 Reading data.pdf file...");
    const dataBuffer = fs.readFileSync("./data/data.pdf");

    // 🧠 Initialize the parser using a modern native Uint8Array buffer
    const parser = new PDFParse({ data: new Uint8Array(dataBuffer) });
    const parsedPdf = await parser.getText();

    // Split the PDF text into paragraphs/chunks
    const rawChunks = parsedPdf.text
      .split("\n\n")
      .map((chunk) => chunk.trim())
      .filter((chunk) => chunk.length > 20);

    console.log(
      `📡 Starting ingestion pipeline for ${rawChunks.length} PDF chunks...`,
    );
    const recordsToUpsert = [];

    for (let i = 0; i < rawChunks.length; i++) {
      const textChunk = rawChunks[i];
      const uniqueId = `pdf-chunk-${i}`;

      console.log(`🧠 Generating embedding for chunk ${i}...`);
      const embeddingVector = await getGeminiEmbedding(textChunk);

      recordsToUpsert.push({
        id: uniqueId,
        values: embeddingVector,
        metadata: { text: textChunk },
      });
    }

    console.log("⬆️ Uploading real PDF vectors to Pinecone...");
    await index.upsert({ records: recordsToUpsert });

    console.log(
      "🚀 Success! Your real PDF data is vectorized and live in the cloud.",
    );
  } catch (error) {
    console.error("❌ Ingestion Failure:", error);
  }
}

runIngestionPipeline();
