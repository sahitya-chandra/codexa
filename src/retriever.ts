import { AgentConfig, RetrievalResult } from './types';
import { createEmbedder } from './embeddings';
import { VectorStore } from './db';

export async function retrieveContext(
  question: string,
  config: AgentConfig,
): Promise<RetrievalResult[]> {
  const embedder = await createEmbedder(config);
  const [qvec] = await embedder.embed([question]);

  const store = new VectorStore(config.dbPath);
  store.init();
  return store.search(qvec, config.topK);
}

export function formatContext(results: RetrievalResult[]): string {
  // Max characters per chunk to avoid token limit issues
  const MAX_CHUNK_DISPLAY_LENGTH = 1500;
  
  return results
    .map((r, index) => {
      let content = r.content || '';
      if (content.length > MAX_CHUNK_DISPLAY_LENGTH) {
        content = content.slice(0, MAX_CHUNK_DISPLAY_LENGTH) + '\n... (truncated)';
      }
      return `[${index + 1}] FILE: ${r.filePath}:${r.startLine}-${r.endLine}
CODE_SNIPPET:
${content}`;
    })
    .join('\n\n---\n\n');
}
