import { AgentConfig, RetrievalResult } from "./types";
import { createEmbedder } from "./embeddings";
import { VectorStore } from "./db";

export async function retrieveContext(
  question: string,
  config: AgentConfig
): Promise<RetrievalResult[]> {
  const embedder = await createEmbedder(config);
  const [qvec] = await embedder.embed([question]);

  const store = new VectorStore(config.dbPath);
  store.init();
  return store.search(qvec, config.topK);
}

export function formatContext(results: RetrievalResult[]): string {
  return results
    .map((r) => {
      const snippet = r.compressed ?? r.content.slice(0, 300);
      return `FILE: ${r.filePath}:${r.startLine}-${r.endLine}
CODE_SNIPPET: ${snippet}`;
    })
    .join("\n\n---\n\n");
}
