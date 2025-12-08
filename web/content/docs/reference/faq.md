---
title: FAQ
description: Common questions and troubleshooting for Codexa.
---

## Troubleshooting



### "GROQ_API_KEY not set" Error

**Problem:** Using Groq provider but API key is missing.

**Solutions:**
1. Set the API key using the config command (Recommended):
   ```bash
   codexa config set GROQ_API_KEY "your-api-key"
   ```
2. Or set the environment variable:
   ```bash
   export GROQ_API_KEY="your-api-key" #macOS/Linux
   ```
3. Verify it's set:
   ```bash
   codexa config get GROQ_API_KEY
   ```

### Ingestion is Very Slow

**Problem:** First ingestion takes too long.

**Solutions:**
1. The dynamic config should already optimize patterns - check your `.codexarc.json` was generated correctly
2. Reduce `maxFileSize` to exclude more large files
3. Reduce `maxChunkSize` to create more, smaller chunks
4. Add more patterns to `excludeGlobs` to skip unnecessary files
5. Be more specific with `includeGlobs` to focus on important files
6. Use `--force` only when necessary (incremental updates are faster)
7. Ensure `skipBinaryFiles` and `skipLargeFiles` are enabled (default)

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

## Common Questions

### Can I use Codexa with private/confidential code?
Yes! Codexa processes everything locally by default. Your code never leaves your machine unless you explicitly use cloud providers like Groq.

### How much disk space does Codexa use?
Typically 10-50MB per 1000 files, depending on file sizes. The SQLite database stores chunks and embeddings.

### Can I use Codexa in CI/CD?
Yes, but you'll need to ensure your LLM provider is accessible. For CI/CD, consider using Groq (cloud).

### Does Codexa work with monorepos?
Yes! Adjust `includeGlobs` and `excludeGlobs` to target specific packages or workspaces.

### Can I use multiple LLM providers?
You can switch providers by updating `modelProvider` in `.codexarc.json`. Each repository can have its own configuration.

### How often should I re-index?
Codexa only processes changed files on subsequent runs, so you can run `ingest` frequently. Use `--force` only when you need a complete rebuild.

### Is there a way to query the database directly?
The SQLite database (`.codexa/index.db`) can be queried directly, but the schema is internal. Use Codexa's commands for all operations.

### Can I customize the prompt sent to the LLM?
Currently, the prompt is fixed, but this may be configurable in future versions.
