# Guardian CLI

A powerful, local-first CLI tool that ingests your codebase and allows you to ask questions about it using Retrieval-Augmented Generation (RAG). It is designed to run completely locally using Ollama for LLMs and local embeddings, but also supports OpenAI for embeddings if preferred.

## 🚀 Features

- **Local-First Ingestion**: Indexes your repository locally using SQLite and vector embeddings.
- **Local LLM Support**: Uses [Ollama](https://ollama.com/) to answer questions about your code, ensuring your data stays private.
- **Flexible Embeddings**:
  - **Local**: Built-in support for local embeddings using `@xenova/transformers` (no API key needed).
  - **OpenAI**: Option to use OpenAI's embedding models for higher accuracy.
- **Smart Context Retrieval**: Uses vector similarity search to find relevant code chunks for your questions.
- **Configurable**: Customize file inclusion/exclusion, chunking strategies, and model parameters via `.agentrc.json`.
- **Conversation History**: Maintains session history for context-aware follow-up questions.

## 📂 Project Structure

The project is organized as follows:

```
guardian-cli/
├── bin/                # CLI entry point
├── src/
│   ├── embeddings/     # Embedding provider implementations (Local & OpenAI)
│   ├── models/         # LLM provider implementations (Local/Ollama)
│   ├── utils/          # Utility functions
│   ├── agent.ts        # Core agent logic (RAG pipeline)
│   ├── chunker.ts      # File chunking logic
│   ├── cli.ts          # CLI command definitions (init, ingest, ask)
│   ├── config.ts       # Configuration loading and validation
│   ├── db.ts           # Vector store implementation (SQLite)
│   ├── ingest.ts       # Repository ingestion orchestration
│   ├── retriever.ts    # Context retrieval logic
│   └── types.ts        # TypeScript interfaces and types
├── .guardianrc.json       # Default configuration file
└── package.json        # Dependencies and scripts
```

## 🛠️ Architecture

The Guardian CLI operates in two main phases:

1.  **Ingestion Phase**:
    - **Scan**: Traverses the repository based on glob patterns.
    - **Chunk**: Splits files into manageable text chunks (configurable size and overlap).
    - **Embed**: Generates vector embeddings for each chunk using the specified provider.
    - **Store**: Saves chunks and embeddings into a local SQLite database (`.guardian/index.db`).

2.  **Query Phase**:
    - **Embed Query**: Converts your question into a vector.
    - **Retrieve**: Finds the most similar code chunks from the database.
    - **Generate**: Constructs a prompt with the retrieved context and conversation history, then queries the local LLM (Ollama) for an answer.

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- [Ollama](https://ollama.com/) (Required for running the LLM)

### Installation

```bash
git clone https://github.com/sahitya-chandra/guardian-cli.git
cd guardian-cli
npm install
npm run build
npm link # Optional: exposes `guardian` command globally
```

### Usage

1.  **Initialize**: Run this in the root of the repository you want to analyze.

    ```bash
    guardian init
    ```

    This creates an `.guardianrc.json` configuration file.

2.  **Ingest**: Index the codebase.

    ```bash
    guardian ingest
    ```

    Use `--force` to rebuild the index from scratch.

3.  **Ask**: Start asking questions.

    ```bash
    guardian ask "How does the authentication flow work?"
    ```

    **Note**: Ensure Ollama is running and the configured model (default: `qwen2.5:3b-instruct`) is pulled:

    ```bash
    ollama pull qwen2.5:3b-instruct
    ```

## ⚙️ Configuration

The `.guardianrc.json` file allows you to fine-tune the agent's behavior:

| Field               | Description                               | Default                       |
| :------------------ | :---------------------------------------- | :---------------------------- |
| `modelProvider`     | `local` (Only local supported currently). | `local`                       |
| `model`             | Model ID (e.g., `qwen2.5:3b-instruct`).   | `qwen2.5:3b-instruct`         |
| `localModelUrl`     | Base URL for local model server.          | `http://localhost:11434`      |
| `embeddingProvider` | `openai` or `local`.                      | `local`                       |
| `embeddingModel`    | Embedding model ID.                       | `Xenova/all-MiniLM-L6-v2`     |
| `includeGlobs`      | Patterns for files to include.            | `["**/*.ts", "**/*.js", ...]` |
| `excludeGlobs`      | Patterns for files to exclude.            | `["**/node_modules/**", ...]` |
| `maxChunkSize`      | Maximum characters per chunk.             | `600`                         |
| `chunkOverlap`      | Overlap between chunks.                   | `80`                          |
| `topK`              | Number of chunks to retrieve.             | `8`                           |

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
