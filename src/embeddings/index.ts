import OpenAI from 'openai';
import type { FeatureExtractionPipeline } from '@xenova/transformers';
import { AgentConfig } from '../types';

export interface Embedder {
  embed(texts: string[]): Promise<number[][]>;
}

class OpenAIEmbedder implements Embedder {
  private client: OpenAI;

  constructor(private model: string, apiKey?: string) {
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required for the OpenAI embedding provider.');
    }
    this.client = new OpenAI({
      apiKey
    });
  }

  async embed(texts: string[]): Promise<number[][]> {
    const res = await this.client.embeddings.create({
      model: this.model,
      input: texts
    });
    return res.data.map((item) => item.embedding as number[]);
  }
}

class LocalEmbedder implements Embedder {
  private pipeline?: FeatureExtractionPipeline;

  constructor(private model: string) {}

  private async getPipeline(): Promise<FeatureExtractionPipeline> {
    if (!this.pipeline) {
      const { pipeline } = await import('@xenova/transformers');
      this.pipeline = await pipeline('feature-extraction', this.model);
    }
    return this.pipeline;
  }

  async embed(texts: string[]): Promise<number[][]> {
    const pipe = await this.getPipeline();
    const embeddings: number[][] = [];
    for (const text of texts) {
      const output = await pipe(text, {
        pooling: 'mean',
        normalize: true
      });
      embeddings.push(Array.from(output.data));
    }
    return embeddings;
  }
}

export async function createEmbedder(config: AgentConfig): Promise<Embedder> {
  if (config.embeddingProvider === 'local') {
    return new LocalEmbedder(config.embeddingModel);
  }
  return new OpenAIEmbedder(config.embeddingModel, process.env.OPENAI_API_KEY);
}

