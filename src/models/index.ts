import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import fetch from 'node-fetch';
import { AgentConfig } from '../types';

export interface LLMClient {
  generate(
    messages: ChatCompletionMessageParam[],
    options?: { stream?: boolean; onToken?: (token: string) => void },
  ): Promise<string>;
}

/**
 * OLLAMA CLIENT (OpenAI-compatible wrapper)
 */
class OllamaLLM implements LLMClient {
  constructor(
    private model: string,
    private baseURL: string, // example: http://localhost:11434
  ) {}

  async generate(
    messages: ChatCompletionMessageParam[],
    options?: { stream?: boolean; onToken?: (token: string) => void },
  ): Promise<string> {
    // Turn messages into a single prompt
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
      throw new Error(
        `Ollama request failed: ${resp.status} ${await resp.text()}`,
      );
    }

    // Non-streaming mode
    if (!options?.stream) {
      const json = await resp.json();
      return json.response ?? json.output ?? '';
    }

    // Streaming mode
    const reader = resp.body!.getReader();
    const decoder = new TextDecoder();
    let full = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);

      const lines = text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      for (const line of lines) {
        try {
          const obj = JSON.parse(line);
          const token = obj.response ?? '';
          if (token) {
            full += token;
            options.onToken?.(token);
          }
        } catch {
          // ignore partial chunks
        }
      }
    }
    return full;
  }
}

export function createLLMClient(config: AgentConfig): LLMClient {
  if (config.modelProvider === 'local') {
    return new OllamaLLM(config.model, config.localModelUrl || 'http://localhost:11434');
  }

  throw new Error('Only local model provider is supported right now.');
}
