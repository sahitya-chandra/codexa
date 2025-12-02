---
title: Usage
description: Learn how to use Codexa commands and explore examples.
---

## Commands

### `init`

Creates a `.codexarc.json` configuration file in the current directory with default settings.

```bash
codexa init
```

**What it does:**
- Creates `.codexarc.json` in the project root
- Uses sensible defaults for all configuration options
- Can be safely run multiple times (won't overwrite existing config)

---

### `ingest`

Indexes the codebase and generates embeddings for semantic search.

```bash
codexa ingest [options]
```

**Options:**
- `-f, --force` - Clear existing index and rebuild from scratch

**Examples:**
```bash
# Standard ingestion
codexa ingest

# Force rebuild (useful if you've updated code significantly)
codexa ingest --force
```

**What it does:**
1. Scans your repository based on `includeGlobs` and `excludeGlobs` patterns
2. Chunks files into manageable segments
3. Generates vector embeddings for each chunk
4. Stores everything in `.codexa/index.db` (SQLite database)

**Note:** First ingestion may take a few minutes depending on your codebase size. Subsequent ingestions are faster as they only process changed files.

---

### `ask`

Ask natural language questions about your codebase.

```bash
codexa ask <question...> [options]
```

**Arguments:**
- `<question...>` - Your question (can be multiple words)

**Options:**
- `-s, --session <name>` - Session identifier to maintain conversation context (default: `"default"`)
- `--no-stream` - Disable streaming output (show full response at once)

**Examples:**
```bash
# Basic question
codexa ask "How does user authentication work?"

# Question with multiple words
codexa ask "What is the main entry point of this application?"

# Use a specific session for context
codexa ask "How does the login function work?" --session my-analysis

# Disable streaming
codexa ask "Summarize the codebase structure" --no-stream

# Follow-up question in the same session
codexa ask "Can you explain that in more detail?" --session my-analysis
```

**How it works:**
1. Converts your question to a vector embedding
2. Searches the codebase for relevant chunks using vector similarity
3. Retrieves the top-K most relevant code sections
4. Sends question + context to the LLM
5. Returns a contextual answer about your codebase

## Examples

### Basic Workflow

```bash
# 1. Initialize in your project
cd my-project
codexa init

# 2. Index your codebase
codexa ingest

# 3. Ask questions
codexa ask "What is the main purpose of this codebase?"
codexa ask "How does the user authentication work?"
codexa ask "Where is the API routing configured?"
```

### Force Re-indexing

```bash
# After significant code changes
codexa ingest --force
```

### Working with Specific File Types

Update `.codexarc.json` to focus on specific languages:

```json
{
  "includeGlobs": [
    "**/*.ts",
    "**/*.tsx"
  ],
  "excludeGlobs": [
    "node_modules/**",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```
