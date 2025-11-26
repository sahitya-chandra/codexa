import path from "node:path";
import os from "os";
import { globby } from "globby";
import ora from "ora";
import { AgentConfig, FileChunk } from "./types";
import { chunkFile } from "./chunker";
import { createEmbedder } from "./embeddings";
import { VectorStore } from "./db";

function compressText(text: string, cap = 450) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, cap);
}

export async function ingestRepository({
  cwd,
  config,
  force = false,
}: {
  cwd: string;
  config: AgentConfig;
  force?: boolean;
}) {
  const spinner = ora("Scanning project files...").start();

  // 1. Scan files
  const files = await globby(config.includeGlobs, {
    cwd,
    gitignore: true,
    ignore: config.excludeGlobs,
    absolute: true,
    onlyFiles: true,
  });

  if (!files.length) {
    spinner.fail("No matching files found.");
    return;
  }

  spinner.succeed(`Found ${files.length} files`);
  console.log("");

  // 2. Chunk
  console.log("📦 [1/4] Chunking files...");
  const chunks: FileChunk[] = [];
  for (let i = 0; i < files.length; i++) {
    process.stdout.write(`   - ${i + 1}/${files.length} ${path.basename(files[i])}   \r`);

    const ch = await chunkFile(files[i], config.maxChunkSize, config.chunkOverlap);
    ch.forEach((c) => (c.filePath = path.relative(cwd, c.filePath)));
    chunks.push(...ch);
  }
  process.stdout.write("\n");
  console.log(`   → Created ${chunks.length} chunks\n`);

  // 3. Compression
  console.log("✂️ [2/4] Compressing chunks...");
  chunks.forEach((c) => (c.compressed = compressText(c.content)));
  console.log("   → Compression done\n");

  // 4. Embedding
  console.log("🧠 [3/4] Embedding chunks...");
  const embedder = await createEmbedder(config);

  const batchSize = 32;
  let done = 0;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const texts = batch.map((c) => c.compressed!);

    const vectors = await embedder.embed(texts);
    batch.forEach((c, idx) => (c.embedding = vectors[idx]));

    done += batch.length;
    process.stdout.write(`   - ${done}/${chunks.length} embedded   \r`);
  }

  process.stdout.write("\n");
  console.log("   → Embedding complete\n");

  // 5. Store in DB
  console.log("💾 [4/4] Storing chunks...");
  const store = new VectorStore(config.dbPath);
  store.init();
  if (force) store.clear();
  store.insertChunks(chunks);

  console.log("   → Stored in SQLite");
  console.log("\n🎉 Ingestion complete!\n");
}
