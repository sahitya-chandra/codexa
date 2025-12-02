---
title: Configuration
description: Configure Codexa to suit your needs.
---

## Configuration File

Codexa uses a `.codexarc.json` file in your project root for configuration. This file is automatically created when you run `codexa init`.

**Location:** `.codexarc.json` (project root)

**Format:** JSON

## Environment Variables

Some settings can be configured via environment variables:

| Variable | Description | Required For |
|----------|-------------|--------------|
| `GROQ_API_KEY` | Groq API key for cloud LLM | Groq provider |
| `OPENAI_API_KEY` | OpenAI API key (for embeddings) | OpenAI embeddings |

**Example:**
```bash
export GROQ_API_KEY="gsk_your_key_here"
export OPENAI_API_KEY="sk-your_key_here"  # If using OpenAI embeddings
```

## Configuration Options

### `modelProvider`

**Type:** `"local" | "groq"`
**Default:** `"groq"` (recommended)

The LLM provider to use for generating answers.

- `"groq"` - Uses Groq's cloud API (recommended, requires `GROQ_API_KEY`)
- `"local"` - Uses Ollama running on your machine (alternative option)

### `model`

**Type:** `string`
**Default:** `"llama-3.1-8b-instant"` (groq, recommended) or `"qwen2.5:3b-instruct"` (local)

The model identifier to use.

**Common Groq Models (Recommended):**
- `llama-3.1-8b-instant` - Fast responses (default, recommended)
- `llama-3.1-70b-versatile` - Higher quality, slower

**Common Local Models (Alternative):**
- `qwen2.5:3b-instruct` - Fast, lightweight - **3B parameters**
- `qwen2.5:1.5b-instruct` - Even faster, smaller - **1.5B parameters**
- `phi3:mini` - Microsoft Phi-3 Mini - **3.8B parameters**

> ⚠️ **Warning:** Models with more than 3 billion parameters (like `llama3:8b`, `mistral:7b`) may not work reliably with local Ollama setup. If you encounter issues, please try using a 3B parameter model instead, or switch to Groq.

### `localModelUrl`

**Type:** `string`
**Default:** `"http://localhost:11434"`

Base URL for your local Ollama instance. Change this if Ollama runs on a different host or port.

### `embeddingProvider`

**Type:** `"local"`
**Default:** `"local"`

The embedding provider for vector search.

- `"local"` - Uses `@xenova/transformers` (runs entirely locally)

### `embeddingModel`

**Type:** `string`
**Default:** `"Xenova/all-MiniLM-L6-v2"`

The embedding model for generating vector representations. This model is downloaded automatically on first use.

### `maxChunkSize`

**Type:** `number`
**Default:** `200`

Maximum number of lines per code chunk. Larger values = more context per chunk but fewer chunks.

### `chunkOverlap`

**Type:** `number`
**Default:** `20`

Number of lines to overlap between consecutive chunks. Helps maintain context at chunk boundaries.

### `includeGlobs`

**Type:** `string[]`
**Default:** `["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.py", "**/*.go", "**/*.rs", "**/*.java", "**/*.md", "**/*.json"]`

File patterns to include in indexing. Supports glob patterns.

**Examples:**
```json
{
  "includeGlobs": [
    "**/*.ts",
    "**/*.tsx",
    "src/**/*.js",
    "lib/**/*.py"
  ]
}
```

### `excludeGlobs`

**Type:** `string[]`
**Default:** `["node_modules/**", ".git/**", "dist/**", "build/**", ".codexa/**", "package-lock.json"]`

File patterns to exclude from indexing.

**Examples:**
```json
{
  "excludeGlobs": [
    "node_modules/**",
    ".git/**",
    "dist/**",
    "**/*.test.ts",
    "coverage/**"
  ]
}
```

### `historyDir`

**Type:** `string`
**Default:** `".codexa/sessions"`

Directory to store conversation history for session management.

### `dbPath`

**Type:** `string`
**Default:** `".codexa/index.db"`

Path to the SQLite database storing code chunks and embeddings.

### `temperature`

**Type:** `number`
**Default:** `0.2`

Controls randomness in LLM responses (0.0 = deterministic, 1.0 = creative).

- Lower values (0.0-0.3): More focused, deterministic answers
- Higher values (0.7-1.0): More creative, varied responses

### `topK`

**Type:** `number`
**Default:** `4`

Number of code chunks to retrieve and use as context for each question. Higher values provide more context but may include less relevant information.

## Example Configurations

### Groq Cloud Provider (Recommended - Default)

```json
{
  "modelProvider": "groq",
  "model": "llama-3.1-8b-instant",
  "embeddingProvider": "local",
  "embeddingModel": "Xenova/all-MiniLM-L6-v2",
  "maxChunkSize": 300,
  "chunkOverlap": 20,
  "temperature": 0.2,
  "topK": 4
}
```

**Remember:** Set `GROQ_API_KEY` environment variable:
```bash
export GROQ_API_KEY="your-api-key"
```

### Local Development (Alternative)

```json
{
  "modelProvider": "local",
  "model": "qwen2.5:3b-instruct",
  "localModelUrl": "http://localhost:11434",
  "embeddingProvider": "local",
  "embeddingModel": "Xenova/all-MiniLM-L6-v2",
  "maxChunkSize": 200,
  "chunkOverlap": 20,
  "temperature": 0.2,
  "topK": 4
}
```

### Optimized for Large Codebases

```json
{
  "modelProvider": "local",
  "model": "qwen2.5:3b-instruct",
  "maxChunkSize": 150,
  "chunkOverlap": 15,
  "topK": 6,
  "temperature": 0.1,
  "includeGlobs": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "lib/**/*.ts"
  ],
  "excludeGlobs": [
    "node_modules/**",
    "dist/**",
    "**/*.test.ts",
    "**/*.spec.ts",
    "coverage/**"
  ]
}
```
