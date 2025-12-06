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

Codexa requires an LLM to generate answers. You can use Groq (cloud).

### Option 1: Using Groq (Cloud)

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


