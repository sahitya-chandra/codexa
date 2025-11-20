import path from 'node:path';
import fs from 'fs-extra';
import Database from 'better-sqlite3';
import { FileChunk, RetrievalResult } from './types';

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    const ai = a[i];
    const bi = b[i];
    dot += ai * bi;
    normA += ai * ai;
    normB += bi * bi;
  }
  if (normA === 0 || normB === 0) {
    return 0;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

interface ChunkRow {
  id: number;
  file_path: string;
  start_line: number;
  end_line: number;
  content: string;
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
          embedding TEXT NOT NULL
        )`
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
      `INSERT INTO chunks (file_path, start_line, end_line, content, embedding)
       VALUES (@filePath, @startLine, @endLine, @content, @embedding)`
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
          embedding: JSON.stringify(chunk.embedding)
        });
      });
    });
    tx(chunks);
  }

  search(queryEmbedding: number[], topK: number): RetrievalResult[] {
    const db = this.connection;
    const rows = db.prepare('SELECT * FROM chunks').all() as ChunkRow[];
    const results: RetrievalResult[] = rows.map((row) => {
      const embedding = JSON.parse(row.embedding) as number[];
      const score = cosineSimilarity(queryEmbedding, embedding);
      return {
        filePath: row.file_path,
        startLine: row.start_line,
        endLine: row.end_line,
        content: row.content,
        embedding,
        score
      };
    });
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  private get connection(): Database.Database {
    if (!this.db) {
      this.init();
    }
    return this.db!;
  }
}

