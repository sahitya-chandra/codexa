# AI Repo Copilot CLI

Local-first CLI that ingests any repo on disk and answers questions through Retrieval-Augmented Generation (RAG). Point it at a cloned project, build an index, then chat about the code using either hosted APIs (OpenAI) or a local OpenAI-compatible server (llama.cpp, Ollama, etc.).

## Features

- Node.js CLI with `agent init`, `agent ingest`, and `agent ask` commands.
- Configurable chunking, globs, embedding + LLM providers per repo via `.agentrc.json`.
- Embedding storage in a lightweight SQLite vector store (`.agent/index.db`).
- Retrieval + context packing before each answer, including optional conversation sessions.
- Optional local embeddings via `@xenova/transformers` (no API key required).
- Smoke-test script + sample repo under `examples/sample`.

## Getting Started

```bash
cd /path/to/agent-cli
npm install
npm run build
npm link   # optional, exposes `agent` globally
```

Inside any cloned repo you want to explore:

```bash
agent init             # writes .agentrc.json
agent ingest --force   # build/rebuild the local vector store
agent ask "How do HTTP requests flow through the API?"
```

### Configuration

`.agentrc.json` lives at the repo root you run the CLI from (defaults provided on `agent init`). Key fields:

| Field | Description |
| --- | --- |
| `modelProvider` | `openai` or `local` (OpenAI-compatible server). |
| `model` | Chat/completion model ID (e.g., `gpt-4o-mini`, `qwen2.5-coder`). |
| `localModelUrl` | Base URL when `modelProvider` is `local` (e.g., `http://localhost:11434/v1`). |
| `embeddingProvider` | `openai` or `local` (uses `@xenova/transformers`). |
| `embeddingModel` | OpenAI embedding ID or local transformer (e.g., `Xenova/all-MiniLM-L6-v2`). |
| `includeGlobs` / `excludeGlobs` | File selection rules relative to the repo root. |
| `maxChunkSize` / `chunkOverlap` | Chunker settings (characters). |
| `dbPath` | SQLite database location (default `.agent/index.db`). |
| `historyDir` | Conversation history directory (default `.agent/sessions`). |
| `topK` | Number of chunks retrieved per question. |

Hosted providers pull secrets from environment variables (`OPENAI_API_KEY`). Local providers can omit keys or set `localModelApiKey`.

### Local Model Support

- **llama.cpp / Ollama**: start their OpenAI-compatible HTTP server and set `modelProvider: "local"` with `localModelUrl` to the server’s `/v1` endpoint.
- **Embeddings**: set `embeddingProvider: "local"` to use `@xenova/transformers` models that download on first run.

### Smoke Test

```bash
npm run smoke
```

Runs ingestion + retrieval on `examples/sample` using local embeddings to verify the pipeline without external APIs.

## Development

- `npm run dev` runs the CLI via `tsx` (no build step).
- `npm run build` compiles TypeScript to `dist/`.
- `npm run clean` removes build artifacts.

## Roadmap

- Hybrid BM25 + vector scoring (current implementation uses cosine similarity on stored embeddings).
- Pluggable vector databases (Pinecone, pgvector, LanceDB).
- Git history + blame aware context selection.
- Fine-grained tool-augmented workflows (summaries, dependency graphing, TODO extraction).
