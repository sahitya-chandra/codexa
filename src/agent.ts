import path from 'node:path';
import fs from 'fs-extra';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { AgentConfig, AskOptions } from './types';
import { retrieveContext, formatContext } from './retriever';
import { createLLMClient } from './models';

type ConversationMessage = ChatCompletionMessageParam;

const SYSTEM_PROMPT = `You are Repo Sage, a senior engineer and documentation expert.
Use the supplied code context to answer questions precisely.
When referencing files, mention the file path and line range.
If information is missing from the context, say so and suggest running ingestion again.`;

export async function askQuestion(
  cwd: string,
  config: AgentConfig,
  options: AskOptions
): Promise<string> {
  const sessionId = options.session ?? 'default';
  const history = await loadHistory(config.historyDir, sessionId);
  const matches = await retrieveContext(options.question, config);
  if (matches.length === 0) {
    throw new Error(
      'No chunks were found in the vector store. Please run `agent ingest` first.'
    );
  }

  const context = formatContext(matches);
  const messages: ConversationMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    {
      role: 'user',
      content: `Context:\n${context}\n\nQuestion: ${options.question}\nAnswer:`
    }
  ];

  const llm = createLLMClient(config);
  const answer = await llm.generate(messages, {
    stream: options.stream,
    onToken: options.stream ? (token) => process.stdout.write(token) : undefined
  });

  await saveHistory(config.historyDir, sessionId, [
    ...history,
    { role: 'user', content: options.question },
    { role: 'assistant', content: answer }
  ]);

  return answer;
}

async function loadHistory(
  historyDir: string,
  sessionId: string
): Promise<ConversationMessage[]> {
  await fs.ensureDir(historyDir);
  const filePath = path.join(historyDir, `${sessionId}.json`);
  if (!(await fs.pathExists(filePath))) {
    return [];
  }
  return (await fs.readJson(filePath)) as ConversationMessage[];
}

async function saveHistory(
  historyDir: string,
  sessionId: string,
  messages: ConversationMessage[]
): Promise<void> {
  await fs.ensureDir(historyDir);
  const filePath = path.join(historyDir, `${sessionId}.json`);
  await fs.writeJson(filePath, messages, { spaces: 2 });
}

