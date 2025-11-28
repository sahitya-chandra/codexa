import path from 'node:path';
import { globby } from 'globby';
import { AgentConfig, FileChunk } from './types';
import { chunkFile } from './chunker';
import { createEmbedder } from './embeddings';
import { VectorStore } from './db';
import ora from 'ora';

function compressText(text: string, cap = 450) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, cap);
}

function tick() {
  return new Promise((resolve) => setImmediate(resolve));
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
  const spinnerFiles = ora('Finding files...').start();
  const files = await globby(config.includeGlobs, {
    cwd,
    gitignore: true,
    ignore: config.excludeGlobs,
    absolute: true,
    onlyFiles: true,
  });

  if (!files.length) {
    spinnerFiles.fail('No matching files found.');
    return;
  }
  spinnerFiles.succeed(`Found ${files.length} files`);

  const spinnerChunk = ora('Chunking files...').start();
  const chunks: FileChunk[] = [];

  for (const file of files) {
    const ch = await chunkFile(file, config.maxChunkSize, config.chunkOverlap);
    ch.forEach((c) => (c.filePath = path.relative(cwd, c.filePath)));
    chunks.push(...ch);

    await tick();
  }
  spinnerChunk.succeed(`Chunked files (${chunks.length} chunks)`);

  const spinnerCompress = ora('Compressing chunks...').start();
  chunks.forEach((c) => (c.compressed = compressText(c.content)));
  spinnerCompress.succeed('Compression complete');

  const spinnerEmbed = ora('Embedding chunks...').start();
  const embedder = await createEmbedder(config);

  const batchSize = 32;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const texts = batch.map((c) => c.compressed!);
    const vectors = await embedder.embed(texts);
    batch.forEach((c, idx) => (c.embedding = vectors[idx]));

    await tick();
  }
  spinnerEmbed.succeed('Embedding complete');

  const spinnerStore = ora('Storing chunks...').start();
  const store = new VectorStore(config.dbPath);
  store.init();
  if (force) store.clear();
  store.insertChunks(chunks);

  spinnerStore.succeed('Stored successfully');

  ora().succeed('Ingestion complete!');
}
