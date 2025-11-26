import { AgentConfig, RetrievalResult } from './types';
import { createEmbedder } from './embeddings';
import { VectorStore } from './db';

export async function retrieveContext(
  question: string,
  config: AgentConfig,
): Promise<RetrievalResult[]> {
  const embedder = await createEmbedder(config);
  const [questionEmbedding] = await embedder.embed([question]);
  const store = new VectorStore(config.dbPath);
  store.init();
  const results = store.search(questionEmbedding, config.topK);
  return results;
}

export function formatContext(results: RetrievalResult[]): string {
  return results
    .map((result) => {
      const header = `${result.filePath}:${result.startLine}-${result.endLine}`;
      return `File: ${header}\n${result.content}`;
    })
    .join('\n\n---\n\n');
}
