import path from 'node:path';
import fs from 'fs-extra';
import { retrieveContext, formatContext } from './retriever';
import { createLLMClient } from './models';
import type { AgentConfig, AskOptions } from './types';

const SYSTEM_PROMPT = `
You are RepoSage, an expert codebase assistant that answers questions about codebases using the provided code snippets.

Your task is to provide accurate, helpful, and comprehensive answers based on the ACTUAL CODE provided.

CRITICAL PRIORITY RULES:
- ALWAYS prioritize CODE_SNIPPET sections over DOCUMENTATION sections when answering questions
- IGNORE DOCUMENTATION sections if they contradict or differ from what the code shows
- When there's a conflict between documentation and actual code, ALWAYS trust the code implementation
- Base your answers on what the CODE actually does, not what documentation claims

Guidelines:
- Analyze CODE_SNIPPET sections FIRST - these contain the actual implementation
- DOCUMENTATION sections are for reference only and should be IGNORED if they contradict code
- When answering questions about functionality, explain based on actual code execution flow
- Reference specific files and line numbers when relevant (from the FILE headers)
- Be direct and factual - if code shows something, state it clearly
- If asked about a specific file that isn't in the context, clearly state "The file [name] is not present in the provided code snippets"
- When analyzing code structure, look at imports, exports, and execution patterns
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
