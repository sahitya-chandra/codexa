import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { AgentConfig } from '../types';

export interface LLMClient {
  generate(
    messages: ChatCompletionMessageParam[],
    options?: { stream?: boolean; onToken?: (token: string) => void },
  ): Promise<string>;
}

class OpenAILLM implements LLMClient {
  private client: OpenAI;

  constructor(
    private model: string,
    apiKey?: string,
    baseURL?: string,
  ) {
    this.client = new OpenAI({
      apiKey,
      baseURL,
    });
  }

  async generate(
    messages: ChatCompletionMessageParam[],
    options?: { stream?: boolean; onToken?: (token: string) => void },
  ): Promise<string> {
    if (options?.stream) {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.2,
        stream: true,
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
      temperature: 0.2,
    });
    return completion.choices[0]?.message?.content ?? '';
  }
}

export function createLLMClient(config: AgentConfig): LLMClient {
  if (config.modelProvider === 'local') {
    const baseURL = config.localModelUrl?.trim();
    if (!baseURL) {
      throw new Error(
        'localModelUrl is required when using the local provider.\n' +
          '\n' +
          'To use a free local language model, you need to set up an OpenAI-compatible server:\n' +
          '  1. Install Ollama: https://ollama.ai\n' +
          '  2. Pull a code model: ollama pull qwen2.5-coder:14b\n' +
          '  3. Set localModelUrl in .agentrc.json: "http://localhost:11434/v1"\n' +
          '\n' +
          'Alternatively, you can use any OpenAI-compatible API server by setting localModelUrl to its base URL.\n' +
          'For OpenAI API, set modelProvider to "openai" and provide OPENAI_API_KEY environment variable.',
      );
    }
    return new OpenAILLM(config.model, config.localModelApiKey ?? 'local-key', baseURL);
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is required for the openai provider.\n' +
        '\n' +
        'To use OpenAI API:\n' +
        '  1. Get an API key from https://platform.openai.com/api-keys\n' +
        '  2. Set it as an environment variable: export OPENAI_API_KEY=your-key-here\n' +
        '\n' +
        'For a free alternative, use the local provider with an OpenAI-compatible server like Ollama.\n' +
        'See the error message above for setup instructions.',
    );
  }
  return new OpenAILLM(config.model, apiKey);
}
