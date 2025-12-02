---
title: Installation
description: How to install and set up Codexa.
---

## Prerequisites

Before installing Codexa, ensure you have the following:

- **Node.js**: v20.0.0 or higher
  ```bash
  node --version  # Should be v20.0.0 or higher
  ```

- **For Local LLM (Ollama)**: [Ollama](https://ollama.com/) must be installed
- **For Cloud LLM (Groq)**: A Groq API key from [console.groq.com](https://console.groq.com/)

## Installation Methods

Choose the installation method that works best for your system:

### Method 1: npm (Recommended)

Install Codexa globally using npm:

```bash
npm install -g codexa
```

Verify installation:

```bash
codexa --version
```

### Method 2: Homebrew (macOS)

Install codexa using Homebrew on macOS:

First, add the tap:
```bash
brew tap sahitya-chandra/codexa
```

Then install:
```bash
brew install codexa
```

## Updating Codexa

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

## LLM Setup

Codexa requires an LLM to generate answers. You can use either Groq (cloud - recommended) or Ollama (local). Groq is recommended for its speed and reliability.

### Option 1: Using Groq (Cloud - Recommended)

Groq provides fast cloud-based LLMs with a generous free tier and is the recommended option for most users.

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

### Option 2: Using Ollama (Local - Alternative)

Ollama runs LLMs locally on your machine, keeping your code completely private. This is an alternative option if you prefer local processing.

> ⚠️ **Note:** Models with more than 3 billion parameters may not work reliably with local Ollama setup. We recommend using 3B parameter models for best compatibility, or use Groq (Option 1) for better reliability.

**Step 1: Install Ollama**

- **macOS/Linux**: Visit [ollama.com](https://ollama.com/) and follow the installation instructions
- **Or use Homebrew on macOS**:
  ```bash
  brew install ollama
  ```

**Step 2: Start Ollama Service**

```bash
# Start Ollama (usually starts automatically after installation)
ollama serve

# Verify Ollama is running
curl http://localhost:11434/api/tags
```

**Step 3: Download a Model**

Pull a model that Codexa can use:

```bash
# Recommended: Fast and lightweight - 3B parameters
ollama pull qwen2.5:3b-instruct

# Alternative 3B options:
ollama pull qwen2.5:1.5b-instruct    # Even faster, smaller
ollama pull phi3:mini                # Microsoft Phi-3 Mini

# ⚠️ Note: Larger models (8B+ like llama3:8b, mistral:7b) may not work locally
# If you encounter issues, try using a 3B model instead, or switch to Groq
```

**Step 4: Verify Model is Available**

```bash
ollama list
```

You should see your downloaded model in the list.

**Step 5: Configure Codexa**

Edit `.codexarc.json` after running `codexa init`:

```json
{
  "modelProvider": "local",
  "model": "qwen2.5:3b-instruct",
  "localModelUrl": "http://localhost:11434"
}
```
