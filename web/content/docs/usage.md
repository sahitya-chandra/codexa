---
title: Usage
description: Learn how to use Codexa commands and explore examples.
---

## Commands

### `init`

Creates a `.codexarc.json` configuration file optimized for your codebase.

```bash
codexa init
```

**What it does:**
- **Analyzes your codebase** to detect languages, package managers, and frameworks
- **Creates optimized config** with language-specific include/exclude patterns
- **Generates `.codexarc.json`** in the project root with tailored settings
- Can be safely run multiple times (won't overwrite existing config)

**Detection Capabilities:**
- **Languages**: TypeScript, JavaScript, Python, Go, Rust, Java, Kotlin, Scala, C/C++, Ruby, PHP, Swift, Dart, and more
- **Package Managers**: npm, yarn, pnpm, pip, poetry, go, cargo, maven, gradle, sbt, bundler, composer, and more
- **Frameworks**: Next.js, React, Django, Flask, Rails, Laravel, Spring, Flutter, and more

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
2. **Filters files** - Automatically excludes binaries, large files (>5MB), and build artifacts
3. Chunks files into manageable segments
4. Generates vector embeddings for each chunk
5. Stores everything in `.codexa/index.db` (SQLite database)

**Smart Filtering:**
- Automatically skips binary files (executables, images, archives, etc.)
- Excludes files larger than the configured size limit (default: 5MB)
- Filters based on file content analysis (not just extensions)

**Note:** First ingestion may take a few minutes depending on your codebase size. Subsequent ingestions are faster as they only process changed files.

---

### `config`

Manage configuration values, including API keys.

```bash
codexa config <action> [key] [value]
```

**Actions:**
- `set <key> <value>` - Set a configuration value
- `get <key>` - Get a configuration value
- `list` - List all configuration values

**Examples:**
```bash
# Set Groq API Key
codexa config set GROQ_API_KEY "gsk_..."

# Check current key
codexa config get GROQ_API_KEY
```

---

### `ask`

Ask natural language questions about your codebase.

```bash
codexa ask <question...> [options]
```

**Arguments:**
- `<question...>` - Your question (can be multiple words)

**Options:**
- `--stream` - Enable streaming output

**Examples:**
```bash
# Basic question
codexa ask "How does user authentication work?"

# Question with multiple words
codexa ask "What is the main entry point of this application?"

# Enable streaming
codexa ask "Summarize the codebase structure" --stream
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

# 2. Set Groq Api Key
codexa config set GROQ_API_KEY <your-groq-key>

# 3. Index your codebase
codexa ingest

# 4. Ask questions
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
