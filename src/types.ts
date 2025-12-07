export type ModelProvider = 'groq';
export type EmbeddingProvider = 'local';

export interface AgentConfig {
  modelProvider: ModelProvider;
  model: string;
  localModelUrl?: string;
  localModelApiKey?: string;
  apiBaseUrl?: string;
  apiKey?: string;
  embeddingProvider: EmbeddingProvider;
  embeddingModel: string;
  maxChunkSize: number;
  chunkOverlap: number;
  includeGlobs: string[];
  excludeGlobs: string[];
  historyDir: string;
  dbPath: string;
  temperature: number;
  topK: number;
  prioritizeCodeFiles?: boolean;
  excludeMarkdownFiles?: boolean;
  codeFileBoost?: number;
  markdownFilePenalty?: number;
  maxFileSize?: number;
  skipBinaryFiles?: boolean;
  skipLargeFiles?: boolean;
}

export interface FileChunk {
  filePath: string;
  startLine: number;
  endLine: number;
  content: string;
  compressed?: string;
  embedding?: number[];
}

export interface RetrievalResult extends FileChunk {
  score: number;
}

export interface AskOptions {
  question: string;
  stream: boolean;
  session?: string;
  onStatusUpdate?: (status: string) => void;
  onToken?: (token: string) => void;
}
