import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { AgentConfig } from '../types';

export interface LLMClient {
  generate(
    messages: ChatCompletionMessageParam[],
    options?: { stream?: boolean; onToken?: (token: string) => void }
  ): Promise<string>;
}

class OpenAILLM implements LLMClient {
  private client: OpenAI;

  constructor(
    private model: string,
    apiKey?: string,
    baseURL?: string
  ) {
    this.client = new OpenAI({
      apiKey,
      baseURL
    });
  }

  async generate(
    messages: ChatCompletionMessageParam[],
    options?: { stream?: boolean; onToken?: (token: string) => void }
  ): Promise<string> {
    if (options?.stream) {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.2,
        stream: true
      });
      let full = '';
      for await (const part of stream) {
        const delta = part.choices[0]?.delta?.content ?? '';
        if (delta) {
          full += delta;
          options.onToken?.(delta);
        }
      }
      return full;
    }

    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: 0.2
    });
    return completion.choices[0]?.message?.content ?? '';
  }
}

export function createLLMClient(config: AgentConfig): LLMClient {
  if (config.modelProvider === 'local') {
    const baseURL = config.localModelUrl?.trim();
    if (!baseURL) {
      throw new Error('localModelUrl is required when using the local provider.');
    }
    return new OpenAILLM(config.model, config.localModelApiKey ?? 'local-key', baseURL);
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for the openai provider.');
  }
  return new OpenAILLM(config.model, apiKey);
}

