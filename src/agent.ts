import path from "node:path";
import fs from "fs-extra";
import { retrieveContext, formatContext } from "./retriever";
import { createLLMClient } from "./models";
import type { AgentConfig, AskOptions } from "./types";

const SYSTEM_PROMPT = `
You are RepoSage.
You answer questions about a codebase using ONLY the provided code snippets.

Rules:
- Use the CODE_SNIPPET sections only.
- Do NOT hallucinate missing files.
- If the context does not contain enough information, say:
  "The provided context does not contain that information."
- Keep answers short, direct, and technical.
`;

export async function askQuestion(
  cwd: string,
  config: AgentConfig,
  options: AskOptions,
): Promise<string> {
  const { question, session = "default", stream } = options;

  const history = await loadHistory(config.historyDir, session);

  const matches = await retrieveContext(question, config);
  if (matches.length === 0) {
    throw new Error("No chunks found. Run `agent ingest` first.");
  }

  const context = formatContext(matches);

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    {
      role: "user",
      content: `CONTEXT:\n${context}\n\nQUESTION: ${question}\nANSWER:`
    }
  ];

  const llm = createLLMClient(config);
  let finalAnswer = "";

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

async function saveHistory(dir: string, id: string, messages: any[]) {
  await fs.ensureDir(dir);
  const file = path.join(dir, `${id}.json`);
  await fs.writeJson(file, messages, { spaces: 2 });
}
