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
  for (const absolutePath of files) {
    const fileChunks = await chunkFile(absolutePath, config.maxChunkSize, config.chunkOverlap);
    fileChunks.forEach((chunk) => {
      chunk.filePath = path.relative(cwd, chunk.filePath);
    });
    chunks.push(...fileChunks);
  }

  spinner.text = `Embedding ${chunks.length} chunks`;
  const embedder = await createEmbedder(config);
  const batchedChunks: FileChunk[] = [];
  const batchSize = 16;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const slice = chunks.slice(i, i + batchSize);
    const embeddings = await embedder.embed(slice.map((chunk) => chunk.content));
    slice.forEach((chunk, idx) => {
      chunk.embedding = embeddings[idx];
    });
    batchedChunks.push(...slice);
  }

  const store = new VectorStore(config.dbPath);
  store.init();
  if (force) {
    store.clear();
  }
  store.insertChunks(batchedChunks);
  spinner.succeed(`Stored ${batchedChunks.length} chunks for retrieval.`);
}

