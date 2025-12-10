---
title: Configuration
description: Configure Codexa to suit your needs.
---

## Configuration File

Codexa uses a `.codexarc.json` file in your project root for configuration. This file is automatically created when you run `codexa init`.

**Location:** `.codexarc.json` (project root)

**Format:** JSON

## Dynamic Configuration Generation

When you run `codexa init`, Codexa automatically analyzes your codebase and generates an optimized configuration:

### What Gets Detected

- **Languages**: TypeScript, JavaScript, Python, Go, Rust, Java, Kotlin, Scala, C/C++, Ruby, PHP, Swift, Dart, and more
- **Package Managers**: npm, yarn, pnpm, pip, poetry, go, cargo, maven, gradle, sbt, bundler, composer, and more
- **Frameworks**: Next.js, React, Django, Flask, Rails, Laravel, Spring, Flutter, and more

### What Gets Optimized

- **Include Patterns**: Only file extensions relevant to detected languages
- **Exclude Patterns**: Language-specific build artifacts, dependency directories, and cache folders
- **Smart Defaults**: File size limits and binary filtering based on best practices

This ensures your config is tailored to your project from the start, providing optimal indexing performance!

## Environment Variables

Some settings can be configured via environment variables:

| Variable | Description | Required For |
|----------|-------------|--------------|
| `GROQ_API_KEY` | Groq API key for cloud LLM | Groq provider |

**Example:**
```bash
# Using config command (Recommended)
codexa config set GROQ_API_KEY "gsk_your_key_here"

# Or using environment variables
export GROQ_API_KEY="gsk_your_key_here"
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
**Default:** `"openai/gpt-oss-120b"`

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

### `maxFileSize`

**Type:** `number`
**Default:** `5242880` (5MB)

Maximum file size in bytes. Files larger than this will be excluded from indexing. Helps avoid processing large binary files or generated artifacts.

**Example:**
```json
{
  "maxFileSize": 10485760  // 10MB
}
```

### `skipBinaryFiles`

**Type:** `boolean`
**Default:** `true`

Whether to automatically skip binary files during indexing. Binary detection uses both file extension and content analysis.

**Example:**
```json
{
  "skipBinaryFiles": true
}
```

### `skipLargeFiles`

**Type:** `boolean`
**Default:** `true`

Whether to skip files exceeding `maxFileSize` during indexing. Set to `false` if you want to include all files regardless of size.

**Example:**
```json
{
  "skipLargeFiles": true,
  "maxFileSize": 10485760  // 10MB
}
```

## Example Configurations

### Groq Cloud Provider (Default)

```json
{
  "modelProvider": "groq",
  "model": "openai/gpt-oss-120b",
  "embeddingProvider": "local",
  "embeddingModel": "Xenova/all-MiniLM-L6-v2",
  "maxChunkSize": 300,
  "chunkOverlap": 20,
  "temperature": 0.2,
  "topK": 4
}
```

**Remember:** Set `GROQ_API_KEY`:
```bash
codexa config set GROQ_API_KEY "your-api-key"
```



### Optimized for Large Codebases

```json
{
  "modelProvider": "groq",
  "model": "openai/gpt-oss-120b",
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
