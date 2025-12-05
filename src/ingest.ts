import { performance } from 'node:perf_hooks';
import path from 'node:path';
import cliProgress from 'cli-progress';
import { globby } from 'globby';
import { AgentConfig, FileChunk } from './types';
import { chunkFile } from './chunker';
import { createEmbedder } from './embeddings';
import { VectorStore } from './db';
import { formatStats } from './utils/formatter';
import ora from 'ora';

function compressText(text: string, cap = 800) {
  return text
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim()
    .slice(0, cap);
}

function tick() {
  return new Promise((resolve) => setImmediate(resolve));
}

// async function parallelizeBatches(
//   chunks: any,
//   batchSize: number,
//   concurrency: number,
//   embedFunc: any,
//   onProgress?: (processed: number, total: number) => void
// ) {
//   const totalChunks = chunks.length;

//   // Pre-create batches to avoid race conditions during batch creation
//   const batches: any[][] = [];
//   for (let i = 0; i < chunks.length; i += batchSize) {
//     const batch = chunks.slice(i, Math.min(i + batchSize, chunks.length));
//     if (batch.length > 0) {
//       batches.push(batch);
//     }
//   }

//   // Use a shared counter with proper synchronization
//   let batchIndex = 0;
//   let processedCount = 0;

//   // Helper to atomically get next batch index
//   function getNextBatchIndex(): number {
//     const current = batchIndex;
//     batchIndex++;
//     return current;
//   }

//   async function processBatch() {
//     while (true) {
//       const index = getNextBatchIndex();

//       if (index >= batches.length) {
//         return;
//       }

//       const currentBatch = batches[index];
//       if (!currentBatch || currentBatch.length === 0) {
//         return;
//       }

//       try {
//         // Use original content for embeddings to preserve semantic information
//         const texts = currentBatch.map((c: any) => c.content);
//         const vectors = await embedFunc(texts);
//         currentBatch.forEach((c: any, idx: number) => (c.embedding = vectors[idx]));

//         // Update progress atomically (JavaScript single-threaded, but good practice)
//         processedCount += currentBatch.length;
//         if (onProgress) {
//           onProgress(processedCount, totalChunks);
//         }
//       } catch (error) {
//         console.error(`Error processing batch: ${error}`);
//         throw error;
//       }
//     }
//   }

//   await Promise.all(Array.from({ length: concurrency }, processBatch));
// }

export async function ingestRepository({
  cwd,
  config,
  force = false,
}: {
  cwd: string;
  config: AgentConfig;
  force?: boolean;
}) {
  const startedAt = performance.now();
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

  const spinnerEmbed = ora('Preparing embeddings (this will take sometime)...').start();
  const embedder = await createEmbedder(config);

  const progress = new cliProgress.SingleBar(
    {
      format: 'Embedding |{bar}| {percentage}% | {value}/{total} chunks',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
    },
    cliProgress.Presets.shades_classic,
  );

  const batchSize = 32;
  progress.start(chunks.length, 0);
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const texts = batch.map((c) => c.content);
    const vectors = await embedder.embed(texts);
    batch.forEach((c, idx) => (c.embedding = vectors[idx]));

    progress.increment(batch.length);
    await tick();
  }
  progress.stop();
  spinnerEmbed.succeed('Embedding complete');

  const spinnerStore = ora('Storing chunks...').start();
  const store = new VectorStore(config.dbPath);
  store.init();
  if (force) store.clear();
  store.insertChunks(chunks);

  spinnerStore.succeed('Stored successfully');

  const durationSec = (performance.now() - startedAt) / 1000;
  ora().succeed('Ingestion complete!');
  const avgChunkSize =
    chunks.length === 0
      ? 0
      : chunks.reduce((sum, c) => sum + c.content.split('\n').length, 0) / chunks.length;

  console.log(
    formatStats({
      files: files.length,
      chunks: chunks.length,
      avgChunkSize,
      durationSec,
    }),
  );
}
