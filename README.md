<div align="center">
  <h1>
    <img src="https://github.com/sahitya-chandra/codexa/blob/main/.github/assets/logo.png" alt="Codexa Logo" width="90" align="absmiddle"> Codexa
  </h1>
  
  <p>
    <strong>A powerful CLI tool that ingests your codebase and allows you to ask questions about it using Retrieval-Augmented Generation (RAG).</strong>
  </p>
  
  <p>
    <a href="https://www.npmjs.com/package/codexa"><img src="https://img.shields.io/npm/v/codexa?style=flat-square" alt="npm version"></a>
    <a href="https://github.com/sahitya-chandra/codexa/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/language-TypeScript-blue.svg?style=flat-square" alt="TypeScript"></a>
    <img src="https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg?style=flat-square" alt="Node.js version">
  </p>
  
  <p>
    <a href="#installation">Installation</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#commands">Commands</a> •
    <a href="#configuration">Configuration</a> •
    <a href="#examples">Examples</a>
  </p>
</div>

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Installation Methods](#installation-methods)
  - [Updating Codexa](#updating-codexa)
  - [LLM Setup](#llm-setup)
- [Quick Start](#quick-start)
- [Commands](#commands)
- [Configuration](#configuration)
- [Examples](#examples)
- [How It Works](#how-it-works)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

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

## Installation

### Prerequisites

Before installing Codexa, ensure you have the following:

- **Node.js**: v20.0.0 or higher
  ```bash
  node --version  # Should be v20.0.0 or higher
  ```

- **For Cloud LLM (Groq)**: A Groq API key from [console.groq.com](https://console.groq.com/)

### Installation Methods

Choose the installation method that works best for your system:

#### Method 1: npm (Recommended)

Install Codexa globally using npm:

```bash
npm install -g codexa
```

Verify installation:

```bash
codexa --version
```

#### Method 2: Homebrew (macOS)

Install codexa using Homebrew on macOS:

First, add the tap:
```bash
brew tap sahitya-chandra/codexa
```

Then install:
```bash
brew install codexa
```

### Updating Codexa

To update codexa to the latest version:

**If installed via npm:**
```bash
npm install -g codexa@latest
```

**If installed via Homebrew:**
```bash
brew upgrade codexa
```

**Check your current version:**
```bash
codexa --version
```

**Check for updates:**
- Visit the [npm package page](https://www.npmjs.com/package/codexa) to see the latest version
- Or check the [GitHub releases](https://github.com/sahitya-chandra/codexa/releases)

> 💡 **Tip:** It's recommended to keep Codexa updated to get the latest features, bug fixes, and security updates.

### LLM Setup

Codexa requires an LLM to generate answers. You can use Groq (cloud).

Groq provides fast cloud-based LLMs with a generous free tier.

**Step 1: Get a Groq API Key**

1. Visit [console.groq.com](https://console.groq.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy your API key (starts with `gsk_`)

**Step 2: Set Environment Variable**

**macOS/Linux:**
```bash
# Add to your shell profile (~/.zshrc, ~/.bashrc, etc.)
export GROQ_API_KEY="gsk_your_api_key_here"

# Reload your shell or run:
source ~/.zshrc  # or ~/.bashrc
```

**Windows (PowerShell):**
```powershell
$env:GROQ_API_KEY="gsk_your_api_key_here"

# Or add permanently:
[System.Environment]::SetEnvironmentVariable('GROQ_API_KEY', 'gsk_your_api_key_here', 'User')
```

**Windows (Command Prompt):**
```cmd
setx GROQ_API_KEY "gsk_your_api_key_here"
```

**Step 3: Verify API Key is Set**

```bash
echo $GROQ_API_KEY  # macOS/Linux
echo %GROQ_API_KEY% # Windows CMD
```

**Step 4: Configure Codexa**

Codexa defaults to using Groq when you run `codexa init`. If you need to manually configure, edit `.codexarc.json`:

```json
{
  "modelProvider": "groq",
  "model": "llama-3.1-8b-instant",
  "embeddingProvider": "local",
  "embeddingModel": "Xenova/all-MiniLM-L6-v2"
}
```

**Available Groq Models:**
- `llama-3.1-8b-instant` - Fast responses (recommended, default)
- `llama-3.1-70b-versatile` - Higher quality, slower



#### Quick Setup Summary

**For Groq:**
```bash
# 1. Get API key from console.groq.com
# 2. Set environment variable
export GROQ_API_KEY="gsk_your_key"

# 3. Run codexa init (defaults to Groq)
codexa init

# 4. Ready to use!
```



## Quick Start

Once Codexa is installed and your LLM is configured, you're ready to use it:

1. **Navigate to your project directory:**
   ```bash
   cd /path/to/your/project
   ```

2. **Initialize Codexa:**
   ```bash
   codexa init
   ```
   This creates a `.codexarc.json` configuration file with sensible defaults.

3. **Ingest your codebase:**
   ```bash
   codexa ingest
   ```
   This indexes your codebase and creates embeddings. First run may take a few minutes.

4. **Ask questions:**
   ```bash
   codexa ask "How does the authentication flow work?"
   codexa ask "What is the main entry point of this application?"
   codexa ask "Show me how error handling is implemented"
   ```

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

## Configuration

### Configuration File

Codexa uses a `.codexarc.json` file in your project root for configuration. This file is automatically created when you run `codexa init`.

**Location:** `.codexarc.json` (project root)

**Format:** JSON

### Environment Variables

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

### Configuration Options

#### `modelProvider`

**Type:** `"groq"`  
**Default:** `"groq"`

The LLM provider to use for generating answers.

- `"groq"` - Uses Groq's cloud API (requires `GROQ_API_KEY`)

#### `model`

**Type:** `string`  
**Type:** `string`  
**Default:** `"llama-3.1-8b-instant"`

The model identifier to use.



#### `embeddingProvider`

**Type:** `"local"`  
**Default:** `"local"`

The embedding provider for vector search.

- `"local"` - Uses `@xenova/transformers` (runs entirely locally)

#### `embeddingModel`

**Type:** `string`  
**Default:** `"Xenova/all-MiniLM-L6-v2"`

The embedding model for generating vector representations. This model is downloaded automatically on first use.

#### `maxChunkSize`

**Type:** `number`  
**Default:** `200`

Maximum number of lines per code chunk. Larger values = more context per chunk but fewer chunks.

#### `chunkOverlap`

**Type:** `number`  
**Default:** `20`

Number of lines to overlap between consecutive chunks. Helps maintain context at chunk boundaries.

#### `includeGlobs`

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

#### `excludeGlobs`

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

#### `historyDir`

**Type:** `string`  
**Default:** `".codexa/sessions"`

Directory to store conversation history for session management.

#### `dbPath`

**Type:** `string`  
**Default:** `".codexa/index.db"`

Path to the SQLite database storing code chunks and embeddings.

#### `temperature`

**Type:** `number`  
**Default:** `0.2`

Controls randomness in LLM responses (0.0 = deterministic, 1.0 = creative).

- Lower values (0.0-0.3): More focused, deterministic answers
- Higher values (0.7-1.0): More creative, varied responses

#### `topK`

**Type:** `number`  
**Default:** `4`

Number of code chunks to retrieve and use as context for each question. Higher values provide more context but may include less relevant information.

### Example Configurations

#### Groq Cloud Provider (Default)

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



#### Optimized for Large Codebases

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

<!-- ### Using Sessions for Context

```bash
# Start a new analysis session
codexa ask "What does the UserService class do?" --session user-analysis

# Follow up with context from previous question
codexa ask "How does it handle errors?" --session user-analysis

# Ask about related functionality
codexa ask "Show me where it's used in the codebase" --session user-analysis
``` -->

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
│   Embeddings)   │     │              │
└─────────────────┘     └──────┬───────┘
                               │
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

## Troubleshooting



### "GROQ_API_KEY not set" Error

**Problem:** Using Groq provider but API key is missing.

**Solutions:**
1. Set the environment variable:
   ```bash
   export GROQ_API_KEY="your-api-key"
   ```
2. Or add it to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.)
3. Verify it's set:
   ```bash
   echo $GROQ_API_KEY
   ```

### Ingestion is Very Slow

**Problem:** First ingestion takes too long.

**Solutions:**
1. Reduce `maxChunkSize` to create more, smaller chunks
2. Add more patterns to `excludeGlobs` to skip unnecessary files
3. Be more specific with `includeGlobs` to focus on important files
4. Use `--force` only when necessary (incremental updates are faster)

### Poor Quality Answers

**Problem:** Answers are not relevant or accurate.

**Solutions:**
1. Increase `topK` to retrieve more context:
   ```json
   {
     "topK": 6
   }
   ```
2. Adjust `temperature` for more focused answers:
   ```json
   {
     "temperature": 0.1
   }
   ```
3. Re-index after significant code changes:
   ```bash
   codexa ingest --force
   ```

5. Ask more specific questions

### Database Locked Error

**Problem:** SQLite database is locked (multiple processes accessing it).

**Solutions:**
1. Ensure only one `codexa` process runs at a time
2. If using concurrent processes, each should use a different `dbPath`

### Missing Files in Index

**Problem:** Some files aren't being indexed.

**Solutions:**
1. Check `includeGlobs` patterns in `.codexarc.json`
2. Verify files aren't excluded by `excludeGlobs`
3. Run with `--force` to rebuild:
   ```bash
   codexa ingest --force
   ```
4. Check file permissions (ensure Codexa can read the files)

## FAQ

**Q: Can I use Codexa with private/confidential code?**  
A: Yes! Codexa processes everything locally by default. Your code never leaves your machine unless you explicitly use cloud providers like Groq.

**Q: How much disk space does Codexa use?**  
A: Typically 10-50MB per 1000 files, depending on file sizes. The SQLite database stores chunks and embeddings.

**Q: Can I use Codexa in CI/CD?**  
A: Yes, but you'll need to ensure your LLM provider is accessible. For CI/CD, consider using Groq (cloud).

**Q: Does Codexa work with monorepos?**  
A: Yes! Adjust `includeGlobs` and `excludeGlobs` to target specific packages or workspaces.

**Q: Can I use multiple LLM providers?**  
A: You can switch providers by updating `modelProvider` in `.codexarc.json`. Each repository can have its own configuration.

**Q: How often should I re-index?**  
A: Codexa only processes changed files on subsequent runs, so you can run `ingest` frequently. Use `--force` only when you need a complete rebuild.

**Q: Is there a way to query the database directly?**  
A: The SQLite database (`.codexa/index.db`) can be queried directly, but the schema is internal. Use Codexa's commands for all operations.

**Q: Can I customize the prompt sent to the LLM?**  
A: Currently, the prompt is fixed, but this may be configurable in future versions.

## Contributing

Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

Quick start:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For major changes, please open an issue first to discuss what you would like to change.

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Made with ❤️ by the Codexa team</p>
  <p>
    <a href="https://github.com/sahitya-chandra/codexa/issues">Report Bug</a> •
    <a href="https://github.com/sahitya-chandra/codexa/issues">Request Feature</a>
  </p>
</div>
