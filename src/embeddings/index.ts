import OpenAI from 'openai';
import type { FeatureExtractionPipeline } from '@xenova/transformers';
import { AgentConfig } from '../types';

export interface Embedder {
  embed(texts: string[]): Promise<number[][]>;
  preload?(): Promise<void>;
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
  private pipelinePromise?: Promise<FeatureExtractionPipeline>;

  constructor(private model: string) {}

  private async getPipeline(): Promise<FeatureExtractionPipeline> {
    if (this.pipeline) {
      return this.pipeline;
    }
    if (!this.pipelinePromise) {
      this.pipelinePromise = (async () => {
        try {
          console.error(`[DEBUG] Importing @xenova/transformers...`);
          const transformersModule = await import('@xenova/transformers');
          const { pipeline } = transformersModule;
          console.error(`[DEBUG] Creating pipeline for model: ${this.model}`);
          this.pipeline = await pipeline('feature-extraction', this.model);
          console.error(`[DEBUG] Pipeline created successfully`);
          return this.pipeline;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          throw new Error(`Failed to load embedding model "${this.model}": ${errorMessage}`);
        }
      })();
    }
    return this.pipelinePromise;
  }

  async preload(): Promise<void> {
    console.error(`[DEBUG] Preloading embedding model...`);
    await this.getPipeline();
    console.error(`[DEBUG] Embedding model preloaded`);
  }

  async embed(texts: string[]): Promise<number[][]> {
    const pipe = await this.getPipeline();
    
    // Process all texts in parallel for much better performance
    const embeddingPromises = texts.map(async (text) => {
      const output = await pipe(text, {
        pooling: 'mean',
        normalize: true
      });
      return this.extractEmbedding(output);
    });
    
    return Promise.all(embeddingPromises);
  }

  private extractEmbedding(output: any): number[] {
    const data = output?.data;
    if (data) {
      if (Array.isArray(data)) {
        return data;
      } else if (data instanceof Float32Array || data instanceof Float64Array) {
        return Array.from(data);
      } else if (typeof data === 'object' && 'tolist' in data) {
        return (data as any).tolist();
      } else {
        return Array.from(data as any);
      }
    } else if (Array.isArray(output)) {
      return output;
    } else {
      throw new Error(`Unexpected output format from embedding model`);
    }
  }
}

export async function createEmbedder(config: AgentConfig): Promise<Embedder> {
  if (config.embeddingProvider === 'local') {
    return new LocalEmbedder(config.embeddingModel);
  }
  return new OpenAIEmbedder(config.embeddingModel, process.env.OPENAI_API_KEY);
}

