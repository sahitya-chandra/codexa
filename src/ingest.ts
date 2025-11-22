import path from 'node:path';
import { globby } from 'globby';
import ora from 'ora';
import { AgentConfig, FileChunk } from './types';
import { chunkFile } from './chunker';
import { createEmbedder } from './embeddings';
import { VectorStore } from './db';

interface IngestOptions {
  cwd: string;
  config: AgentConfig;
  force?: boolean;
}

export async function ingestRepository({ cwd, config, force = false }: IngestOptions): Promise<void> {
  const spinner = ora('Scanning project files').start();
  const files = await globby(config.includeGlobs, {
    cwd,
    gitignore: true,
    ignore: config.excludeGlobs,
    absolute: true,
    onlyFiles: true
  });

  if (files.length === 0) {
    spinner.fail('No source files matched the current config globs.');
    return;
  }

  spinner.text = `Chunking ${files.length} files`;
  const chunks: FileChunk[] = [];
  for (let i = 0; i < files.length; i++) {
    const absolutePath = files[i];
    spinner.text = `Chunking file ${i + 1}/${files.length}: ${path.basename(absolutePath)}`;
    const fileChunks = await chunkFile(absolutePath, config.maxChunkSize, config.chunkOverlap);
    fileChunks.forEach((chunk) => {
      chunk.filePath = path.relative(cwd, chunk.filePath);
    });
    chunks.push(...fileChunks);
  }

  spinner.text = `Created ${chunks.length} chunks from ${files.length} files`;
  spinner.text = `Loading embedding model...`;

  let embedder;
  try {
    embedder = await createEmbedder(config);
    if (embedder.preload) {
      spinner.text = `Loading embedding model (this may take a minute on first run)...`;
      await embedder.preload();
    }
  } catch (error) {
    spinner.fail('Failed to load embedding model.');
    throw error;
  }
  const batchedChunks: FileChunk[] = [];
  const batchSize = 16;
  const totalBatches = Math.ceil(chunks.length / batchSize);
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batchNum = Math.floor(i / batchSize) + 1;
    spinner.text = `Embedding chunks ${i + 1}-${Math.min(i + batchSize, chunks.length)} of ${chunks.length} (batch ${batchNum}/${totalBatches})`;
    
    await new Promise(resolve => setImmediate(resolve));
    
    const slice = chunks.slice(i, i + batchSize);
    const embeddings = await embedder.embed(slice.map((chunk) => chunk.content));
    slice.forEach((chunk, idx) => {
      chunk.embedding = embeddings[idx];
    });
    batchedChunks.push(...slice);
    
    spinner.text = `Embedded batch ${batchNum}/${totalBatches} (${batchedChunks.length}/${chunks.length} chunks)`;
  }

  spinner.text = `Storing ${batchedChunks.length} chunks in database...`;
  const store = new VectorStore(config.dbPath);
  store.init();
  if (force) {
    store.clear();
  }
  store.insertChunks(batchedChunks);
  spinner.succeed(`Stored ${batchedChunks.length} chunks for retrieval.`);
}

