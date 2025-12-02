import fetch from 'node-fetch';
import { AgentConfig } from '../types';
import { Readable } from 'stream';
import { generateText, ModelMessage, streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

export interface LLMClient {
  generate(
    messages: ModelMessage[],
    options?: { stream?: boolean; onToken?: (token: string) => void },
  ): Promise<string>;
}

class OllamaLLM implements LLMClient {
  constructor(
    private model: string,
    private baseURL: string,
  ) {}

  async generate(
    messages: ModelMessage[],
    options?: { stream?: boolean; onToken?: (token: string) => void },
  ): Promise<string> {
    const prompt = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

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
      const json: unknown = await resp.json();
      return (
        (json as { response?: string; output?: string }).response ??
        (json as { response?: string; output?: string }).output ??
        ''
      );
    }

    const stream = resp.body as unknown as Readable;
    if (!stream) {
      throw new Error('Streaming not supported on this response body.');
    }

    let full = '';

    let buffer = '';

    for await (const chunk of stream) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const parsed = JSON.parse(trimmed);
          const token: string = parsed.response ?? '';
          if (token) {
            full += token;
            options.onToken?.(token);
          }
        } catch {
          // Should not happen with proper buffering, but ignore if it does
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      try {
        const parsed = JSON.parse(buffer.trim());
        const token: string = parsed.response ?? '';
        if (token) {
          full += token;
          options.onToken?.(token);
        }
      } catch {
        // Ignore incomplete final chunk
      }
    }

    return full;
  }
}

class GroqLLM implements LLMClient {
  private groq: ReturnType<typeof createGroq>;

  constructor(
    private model: string,
    private apiKey?: string,
  ) {
    this.groq = createGroq({
      apiKey: this.apiKey,
    });
  }

  async generate(
    messages: ModelMessage[],
    options?: { stream?: boolean; onToken?: (token: string) => void },
  ): Promise<string> {
    const modelId = this.model;

    if (!options?.stream) {
      const { text } = await generateText({
        model: this.groq(modelId),
        messages,
      });
      return text;
    }

    const result = streamText({
      model: this.groq(modelId),
      messages,
    });

    let fullText = '';
    for await (const textPart of result.textStream) {
      fullText += textPart;
      options.onToken?.(textPart);
    }

    return fullText;
  }
}

export function createLLMClient(config: AgentConfig): LLMClient {
  if (config.modelProvider === 'local') {
    const base = config.localModelUrl?.replace(/\/$/, '') || 'http://localhost:11434';
    if (process.env.AGENT_DEBUG) {
      console.error('Using Ollama client:', config.model, config.localModelUrl);
    }

    return new OllamaLLM(config.model, base);
  }

  if (config.modelProvider === 'groq') {
    if (process.env.AGENT_DEBUG) {
      console.error('Using Groq client:', config.model);
    }

    return new GroqLLM(config.model, process.env.GROQ_API_KEY);
  }

  throw new Error('Only local provider supported for now.');
}
