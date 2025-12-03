import path from 'node:path';
import fs from 'fs-extra';
import { retrieveContext, formatContext } from './retriever';
import { createLLMClient } from './models';
import type { AgentConfig, AskOptions } from './types';

const SYSTEM_PROMPT = `
You are RepoSage, an expert codebase assistant that answers questions about codebases using the provided code snippets.

Your task is to provide accurate, helpful, and comprehensive answers based on the code context provided.

Guidelines:
- Analyze the CODE_SNIPPET sections carefully to understand the codebase structure and functionality
- When answering questions about entry points, look for main files, CLI files, index files, or package.json scripts
- When answering questions about functionality, explain how things work based on the actual code provided
- When asked for summaries, provide a comprehensive overview based on the files and code snippets you see
- Reference specific files and line numbers when relevant (from the FILE headers)
- If the context contains enough information, provide detailed and thorough answers
- Only say "The provided context does not contain that information" if you genuinely cannot find relevant information in the code snippets
- Be helpful and descriptive - explain concepts clearly, not just briefly
- You can combine information from multiple code snippets to provide a complete answer
`;

export async function askQuestion(
  cwd: string,
  config: AgentConfig,
  options: AskOptions,
): Promise<string> {
  const { question, session = 'default' } = options;

  const history = await loadHistory(config.historyDir, session);

  const matches = await retrieveContext(question, config);
  if (matches.length === 0) {
    throw new Error('No chunks found. Run `agent ingest` first.');
  }

  const context = formatContext(matches);

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
    {
      role: 'user',
      content: `Based on the following code snippets from the codebase, please answer the question.

      ${context}

      Question: ${question}

      Please provide a comprehensive and helpful answer based on the code context above.`,
    },
  ];

  const llm = createLLMClient(config);
  let finalAnswer = '';

  const answer = await llm.generate(messages, {
    stream: options.stream,
    onToken: (token) => {
      finalAnswer += token;
      if (options.onToken) options.onToken(token);
    },
  });

  if (!options.stream) {
    finalAnswer = answer;
  }

  return finalAnswer;
}

async function loadHistory(dir: string, id: string) {
  await fs.ensureDir(dir);
  const file = path.join(dir, `${id}.json`);
  if (!(await fs.pathExists(file))) return [];
  return fs.readJson(file);
}

// async function saveHistory(dir: string, id: string, messages: any[]) {
//   await fs.ensureDir(dir);
//   const file = path.join(dir, `${id}.json`);
//   await fs.writeJson(file, messages, { spaces: 2 });
// }
