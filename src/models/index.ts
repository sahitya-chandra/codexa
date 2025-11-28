import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import fetch from 'node-fetch';
import { AgentConfig } from '../types';
import { Readable } from 'stream';

export interface LLMClient {
  generate(
    messages: ChatCompletionMessageParam[],
    options?: { stream?: boolean; onToken?: (token: string) => void },
  ): Promise<string>;
}

class OllamaLLM implements LLMClient {
  constructor(private model: string, private baseURL: string) {}

  async generate(
    messages: ChatCompletionMessageParam[],
    options?: { stream?: boolean; onToken?: (token: string) => void },
  ): Promise<string> {

    const prompt = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');

    const body = {
      model: this.model,
      prompt,
      stream: options?.stream ?? false,
    };

    const resp = await fetch(`${this.baseURL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Ollama request failed: ${resp.status} ${text}`);
    }

    if (!options?.stream) {
      const json: any = await resp.json();
      return json.response ?? json.output ?? '';
    }

    const stream = resp.body as unknown as Readable;
    if (!stream) {
      throw new Error('Streaming not supported on this response body.');
    }

    let full = '';

    for await (const chunk of stream) {
      const text = chunk.toString();

      const lines = text
        .split('\n')
        .map((l: any) => l.trim())
        .filter(Boolean);

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          const token: string = parsed.response ?? '';
          if (token) {
            full += token;
            options.onToken?.(token);
          }
        } catch {
          // Ignore partial JSON chunks
        }
      }
    }

    return full;
  }
}

export function createLLMClient(config: AgentConfig): LLMClient {
  if (config.modelProvider === 'local') {
    const base = config.localModelUrl?.replace(/\/$/, '') || 'http://localhost:11434';
    console.error("Using Ollama client", config.model, config.localModelUrl);
    return new OllamaLLM(config.model, base);
  }

  throw new Error('Only local provider supported for now.');
}
