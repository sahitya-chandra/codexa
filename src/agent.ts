import path from 'node:path';
import fs from 'fs-extra';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { AgentConfig, AskOptions } from './types';
import { retrieveContext, formatContext } from './retriever';
import { createLLMClient } from './models';

type ConversationMessage = ChatCompletionMessageParam;

const SYSTEM_PROMPT = `
You are Repo Sage, a senior engineer.
The code context has already been compressed for you.
Use the SUMMARY sections only. Ignore the content field.
Never hallucinate file names or functions not in SUMMARY.
If the answer is not in the summaries, say "context not found".
Be concise and cite file names.
`;

export async function askQuestion(
  cwd: string,
  config: AgentConfig,
  options: AskOptions,
): Promise<string> {
  const sessionId = options.session ?? 'default';
  const history = await loadHistory(config.historyDir, sessionId);
  const matches = await retrieveContext(options.question, config);
  if (matches.length === 0) {
    throw new Error('No chunks were found in the vector store. Please run `agent ingest` first.');
  }

  console.error(`[DEBUG] Retrieved ${matches.length} context chunks`);
  const context = formatContext(matches);
  const messages: ConversationMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    {
      role: 'user',
      content: `
        You are answering questions about code.

        CONTEXT:
        ${context}

        QUESTION:
        ${options.question}

        INSTRUCTIONS:
        - Use only the SUMMARY text.
        - If the answer is not found, say "context not found".
        - Be concise and cite file paths.

        ANSWER:
      `,
    },
  ];

  console.error(`[DEBUG] Creating LLM client for model: ${config.model}`);
  console.error("[DEBUG] PROMPT LENGTH:", JSON.stringify(messages).length);
  const llm = createLLMClient(config);
  console.error(`[DEBUG] Generating answer...`);
  const answer = await llm.generate(messages, {
    stream: options.stream,
    onToken: options.stream ? (token) => process.stdout.write(token) : undefined,
  });
  console.error(`[DEBUG] Answer generated`); 
  console.error("[DEBUG] ANSWER:", answer);

  await saveHistory(config.historyDir, sessionId, [
    ...history,
    { role: 'user', content: options.question },
    { role: 'assistant', content: answer },
  ]);

  return answer;
}

async function loadHistory(historyDir: string, sessionId: string): Promise<ConversationMessage[]> {
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
  messages: ConversationMessage[],
): Promise<void> {
  await fs.ensureDir(historyDir);
  const filePath = path.join(historyDir, `${sessionId}.json`);
  await fs.writeJson(filePath, messages, { spaces: 2 });
}
