---
title: Introduction
description: Codexa is a powerful CLI tool that ingests your codebase and allows you to ask questions about it using Retrieval-Augmented Generation (RAG).
---

## Features

- 🔒 **Privacy-First**: All data processing happens locally by default
- ⚡ **Fast & Efficient**: Local embeddings and optimized vector search
- 🤖 **Multiple LLM Support**: Works with Groq (cloud)
- 💾 **Local Storage**: SQLite database for embeddings and context
- 🎯 **Smart Chunking**: Intelligent code splitting with configurable overlap
- 🔄 **Session Management**: Maintain conversation context across queries
- 📊 **Streaming Output**: Real-time response streaming for better UX
- 🎨 **Multiple File Types**: Supports TypeScript, JavaScript, Python, Go, Rust, Java, and more
- ⚙️ **Highly Configurable**: Fine-tune chunking, retrieval, and model parameters
- 🚀 **Zero Setup**: Works out of the box with sensible defaults

## How It Works

Codexa uses Retrieval-Augmented Generation (RAG) to answer questions about your codebase:

### 1. Ingestion Phase

When you run `codexa ingest`:

1. **File Discovery**: Scans your repository using glob patterns (`includeGlobs`/`excludeGlobs`)
2. **Code Chunking**: Splits files into manageable chunks with configurable overlap
3. **Embedding Generation**: Creates vector embeddings for each chunk using local transformers
4. **Storage**: Stores chunks and embeddings in a SQLite database (`.codexa/index.db`)

### 2. Query Phase

When you run `codexa ask`:

1. **Question Embedding**: Converts your question into a vector embedding
2. **Vector Search**: Finds the most similar code chunks using cosine similarity
3. **Context Retrieval**: Selects top-K most relevant chunks as context
4. **LLM Generation**: Sends question + context to your configured LLM
5. **Response**: Returns an answer grounded in your actual codebase

### Benefits

- **Privacy**: All processing happens locally by default
- **Speed**: Local embeddings and vector search are very fast
- **Accuracy**: Answers are based on your actual code, not generic responses
- **Context-Aware**: Understands relationships across your codebase

## Architecture

```
┌─────────────────┐
│   User Query    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│  Embedding      │────▶│   Vector     │
│  Generation     │     │   Search     │
└─────────────────┘     └──────┬───────┘
                               │
                               ▼
                        ┌──────────────┐
                        │   Context    │
                        │   Retrieval  │
                        └──────┬───────┘
                               │
                               ▼
┌─────────────────┐     ┌──────────────┐
│   SQLite DB     │◀────│   LLM        │
│   (Chunks +     │     │   (Groq)     │
│   Embeddings)   │     └──────┬───────┘
└─────────────────┘            │
                               ▼
                        ┌──────────────┐
                        │   Answer     │
                        └──────────────┘
```

**Key Components:**
- **Chunker**: Splits code files into semantic chunks
- **Embedder**: Generates vector embeddings (local transformers)
- **Retriever**: Finds relevant chunks using vector similarity
- **LLM Client**: Generates answers (Groq cloud)
- **Database**: SQLite for storing chunks and embeddings
