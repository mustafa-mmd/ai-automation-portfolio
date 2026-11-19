import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

// 1. Pull and validate credentials safely from environment variables
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const INDEX_NAME = process.env.PINECONE_INDEX_NAME;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!PINECONE_API_KEY || !INDEX_NAME || !GEMINI_API_KEY) {
  console.error(
    "❌ Critical Error: Missing environment variables in your .env file.",
  );
  console.error(
    "Ensure PINECONE_API_KEY, PINECONE_INDEX_NAME, and GEMINI_API_KEY are all defined.",
  );
  process.exit(1);
}

// 2. Instantiate our official infrastructure clients
const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function setupDatabase() {
  try {
    // 3. Fetch existing indexes and check if ours exists
    const indexList = await pc.listIndexes();
    const exists = indexList.indexes?.some((idx) => idx.name === INDEX_NAME);

    if (!exists) {
      console.log(
        `📡 Creating serverless index "${INDEX_NAME}" for your CV Chatbot... Please wait a moment.`,
      );

      // Provision a vector space matched perfectly to your index layout requirements
      await pc.createIndex({
        name: INDEX_NAME,
        dimension: 1024, // Calibrated to 1024 to support high-fidelity resume matching
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1",
          },
        },
      });
      console.log(`✅ Index "${INDEX_NAME}" successfully created!`);
    } else {
      console.log(
        `ℹ️ Index "${INDEX_NAME}" already exists and is ready for your CV data.`,
      );
    }

    // 4. Reference our active database index
    const index = pc.index(INDEX_NAME);
    console.log("🚀 Pinecone vector memory connection verified: Successful.");

    // 5. Run a live test with Gemini using a CV-themed text query!
    console.log(
      "🧪 Testing Gemini connection with a sample profile embedding...",
    );
    const testResult = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents:
        "Reviewing professional history, core software skills, and project experience.",
      config: {
        outputDimensionality: 1024, // Matches your 1024-dim Pinecone index perfectly!
      },
    });

    const vectorDimensions = testResult.embeddings[0].values.length;
    console.log(
      `✅ Gemini Embedding Test: Success! Generated a CV semantic vector with ${vectorDimensions} dimensions.`,
    );
    console.log(
      "\n⭐️ Personal CV Chatbot infrastructure is beautifully configured. Your vector space is optimized!",
    );
  } catch (error) {
    console.error("❌ Infrastructure Setup Failed:", error);
  }
}

setupDatabase();
