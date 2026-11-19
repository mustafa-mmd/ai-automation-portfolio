# 🤖 Personal CV AI Chatbot Engine (RAG Architecture)

A high-performance, modular **Retrieval-Augmented Generation (RAG)** application that transforms a raw professional CV/Resume PDF into a secure vector space.

This system uses a multi-file architecture to separate data ingestion from real-time query execution. It features a premium, interactive dark-mode web UI equipped with native **Speech-to-Text (Voice) transcription** and real-time generative responses grounded entirely in your professional history.

---

## 📁 Project Structure

```text
Rag/
├── data/
│   └── data.pdf           # Your raw personal CV/Resume document
├── node_modules/          # Installed dependencies
├── .env                   # Hidden API credentials and configuration
├── index.html             # Voice-enabled dark UI frontend client
├── ingest.js              # Script to parse PDF and upload vectors
├── query.js               # Express web server and RAG logic
└── package.json           # Node.js project manifest
```
