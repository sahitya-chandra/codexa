# Agent CLI

A powerful, local-first CLI tool that ingests your codebase and allows you to ask questions about it using Retrieval-Augmented Generation (RAG). It supports both hosted LLMs (like OpenAI) and local models (via Ollama, etc.), making it a versatile tool for code exploration and understanding.

## 🚀 Features

- **Local-First Ingestion**: Indexes your repository locally using SQLite and vector embeddings.
- **Flexible LLM Support**:
  - **Hosted**: Works seamlessly with OpenAI's GPT models.
  - **Local**: Supports local LLMs via OpenAI-compatible servers (e.g., Ollama, llama.cpp).
- **Smart Context Retrieval**: Uses vector similarity search to find relevant code chunks for your questions.
- **Configurable**: Customize file inclusion/exclusion, chunking strategies, and model parameters via `.agentrc.json`.
- **Conversation History**: Maintains session history for context-aware follow-up questions.
- **Free Embeddings**: Built-in support for local embeddings using `@xenova/transformers` (no API key needed).

## 📂 Project Structure

The project is organized as follows:

```
agent-cli/
├── bin/                # CLI entry point
├── src/
│   ├── embeddings/     # Embedding provider implementations (Local & OpenAI)
│   ├── models/         # LLM provider implementations (OpenAI & Local)
│   ├── utils/          # Utility functions
│   ├── agent.ts        # Core agent logic (RAG pipeline)
│   ├── chunker.ts      # File chunking logic
│   ├── cli.ts          # CLI command definitions (init, ingest, ask)
│   ├── config.ts       # Configuration loading and validation
│   ├── db.ts           # Vector store implementation (SQLite)
│   ├── ingest.ts       # Repository ingestion orchestration
│   ├── retriever.ts    # Context retrieval logic
│   └── types.ts        # TypeScript interfaces and types
├── .agentrc.json       # Default configuration file
└── package.json        # Dependencies and scripts
```

## 🛠️ Architecture

The Agent CLI operates in two main phases:

1.  **Ingestion Phase**:
    - **Scan**: Traverses the repository based on glob patterns.
    - **Chunk**: Splits files into manageable text chunks (configurable size and overlap).
    - **Embed**: Generates vector embeddings for each chunk using the specified provider.
    - **Store**: Saves chunks and embeddings into a local SQLite database (`.agent/index.db`).

2.  **Query Phase**:
    - **Embed Query**: Converts your question into a vector.
    - **Retrieve**: Finds the most similar code chunks from the database.
    - **Generate**: Constructs a prompt with the retrieved context and conversation history, then queries the LLM for an answer.

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

```bash
git clone https://github.com/sahitya-chandra/agent-cli.git
cd agent-cli
npm install
npm run build
npm link # Optional: exposes `agent` command globally
```

### Usage

1.  **Initialize**: Run this in the root of the repository you want to analyze.

    ```bash
    agent init
    ```

    This creates an `.agentrc.json` configuration file.

2.  **Ingest**: Index the codebase.

    ```bash
    agent ingest
    ```

    Use `--force` to rebuild the index from scratch.

3.  **Ask**: Start asking questions.
    ```bash
    agent ask "How does the authentication flow work?"
    ```

## ⚙️ Configuration

The `.agentrc.json` file allows you to fine-tune the agent's behavior:

| Field               | Description                                      | Default                       |
| :------------------ | :----------------------------------------------- | :---------------------------- |
| `modelProvider`     | `openai` or `local`.                             | `openai`                      |
| `model`             | Model ID (e.g., `gpt-4o-mini`, `qwen2.5-coder`). | `gpt-4o-mini`                 |
| `localModelUrl`     | Base URL for local model server.                 | `http://localhost:11434/v1`   |
| `embeddingProvider` | `openai` or `local`.                             | `local`                       |
| `embeddingModel`    | Embedding model ID.                              | `Xenova/all-mpnet-base-v2`    |
| `includeGlobs`      | Patterns for files to include.                   | `["**/*.ts", "**/*.js", ...]` |
| `excludeGlobs`      | Patterns for files to exclude.                   | `["**/node_modules/**", ...]` |
| `maxChunkSize`      | Maximum characters per chunk.                    | `1000`                        |
| `chunkOverlap`      | Overlap between chunks.                          | `200`                         |
| `topK`              | Number of chunks to retrieve.                    | `10`                          |

## 🧪 Development

- `npm run dev`: Run the CLI using `tsx` (no build required).
- `npm run build`: Compile TypeScript to `dist/`.
- `npm run lint`: Run ESLint.
- `npm run format`: Format code with Prettier.
- `npm run smoke`: Run a smoke test on the `examples/sample` repo.

## 🗺️ Roadmap

- [ ] Hybrid Search (BM25 + Vector).
- [ ] Support for additional vector databases (Pinecone, pgvector).
- [ ] Git history context integration.
- [ ] Advanced tool use (dependency graphs, summarization).
