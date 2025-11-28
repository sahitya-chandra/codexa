import path from 'node:path';
import fs from 'fs-extra';
import Database from 'better-sqlite3';
import { FileChunk, RetrievalResult } from './types';

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    return 0;
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;

  const len = a.length;
  for (let i = 0; i < len; i++) {
    const ai = a[i];
    const bi = b[i];
    dot += ai * bi;
    normA += ai * ai;
    normB += bi * bi;
  }
  if (normA === 0 || normB === 0) {
    return 0;
  }

  const sqrtNormA = Math.sqrt(normA);
  const sqrtNormB = Math.sqrt(normB);
  return dot / (sqrtNormA * sqrtNormB);
}

interface ChunkRow {
  id: number;
  file_path: string;
  start_line: number;
  end_line: number;
  content: string;
  compressed: string | null;
  embedding: string;
}

export class VectorStore {
  private db: Database.Database | null = null;

  constructor(private dbPath: string) {}

  init(): void {
    if (this.db) {
      return;
    }
    const dir = path.dirname(this.dbPath);
    fs.ensureDirSync(dir);
    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db
      .prepare(
        `CREATE TABLE IF NOT EXISTS chunks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          file_path TEXT NOT NULL,
          start_line INTEGER NOT NULL,
          end_line INTEGER NOT NULL,
          content TEXT NOT NULL,
          compressed TEXT,
          embedding TEXT NOT NULL
        )`,
      )
      .run();
  }

  clear(): void {
    const db = this.connection;
    db.prepare('DELETE FROM chunks').run();
  }

  insertChunks(chunks: FileChunk[]): void {
    const db = this.connection;
    const insert = db.prepare(
      `INSERT INTO chunks (file_path, start_line, end_line, content, compressed, embedding)
      VALUES (@filePath, @startLine, @endLine, @content, @compressed, @embedding)`,
    );
    const tx = db.transaction((rows: FileChunk[]) => {
      rows.forEach((chunk) => {
        if (!chunk.embedding) {
          throw new Error(`Chunk missing embedding for ${chunk.filePath}`);
        }
        insert.run({
          filePath: chunk.filePath,
          startLine: chunk.startLine,
          endLine: chunk.endLine,
          content: chunk.content,
          compressed: chunk.compressed ?? '',
          embedding: JSON.stringify(chunk.embedding),
        });
      });
    });
    tx(chunks);
  }

  search(queryEmbedding: number[], topK: number): RetrievalResult[] {
    const db = this.connection;
    const rows = db.prepare('SELECT * FROM chunks').all() as ChunkRow[];

    if (rows.length === 0) {
      return [];
    }

    // if (rows.length > 1000) {
    //   console.error(`Searching through ${rows.length} chunks...`);
    // }

    // min-heap approach: keep only the top K results
    // avoids sorting all results
    const topResults: RetrievalResult[] = [];
    const minScore = { value: -Infinity };

    for (const row of rows) {
      const embedding = JSON.parse(row.embedding) as number[];
      const score = cosineSimilarity(queryEmbedding, embedding);

      if (topResults.length >= topK && score <= minScore.value) {
        continue;
      }

      const result: RetrievalResult = {
        filePath: row.file_path,
        startLine: row.start_line,
        endLine: row.end_line,
        content: row.content,
        compressed: row.compressed ?? '',
        embedding,
        score,
      };

      if (topResults.length < topK) {
        topResults.push(result);

        if (result.score < minScore.value) {
          minScore.value = result.score;
        }

        if (topResults.length === topK) {
          topResults.sort((a, b) => a.score - b.score);
          minScore.value = topResults[0].score;
        }
      } else if (score > minScore.value) {
        topResults[0] = result;
        topResults.sort((a, b) => a.score - b.score);
        minScore.value = topResults[0].score;
      }
    }

    const finalResults = topResults.sort((a, b) => b.score - a.score);
    // if (rows.length > 1000) {
    //   console.error(`Search complete, returning top ${finalResults.length} results`);
    // }
    return finalResults;
  }

  private get connection(): Database.Database {
    if (!this.db) {
      this.init();
    }
    return this.db!;
  }
}
