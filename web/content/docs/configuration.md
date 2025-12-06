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

**Type:** `"groq"`
**Default:** `"groq"`

The LLM provider to use for generating answers.

- `"groq"` - Uses Groq's cloud API (requires `GROQ_API_KEY`)

### `model`

**Type:** `string`
**Type:** `string`
**Default:** `"llama-3.1-8b-instant"`

The model identifier to use.



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

### Groq Cloud Provider (Default)

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



### Optimized for Large Codebases

```json
{
  "modelProvider": "groq",
  "model": "llama-3.1-8b-instant",
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
