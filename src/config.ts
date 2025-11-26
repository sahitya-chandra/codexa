import path from 'node:path';
import fs from 'fs-extra';
import dotenv from 'dotenv';
import { AgentConfig } from './types';

dotenv.config();

const CONFIG_FILENAME = '.agentrc.json';

const DEFAULT_CONFIG: AgentConfig = {
  modelProvider: 'local',
  model: 'qwen2.5:3b-instruct',
  embeddingProvider: 'local',
  embeddingModel: 'Xenova/all-MiniLM-L6-v2',
  localModelUrl: 'http://localhost:11434',
  localModelApiKey: '',
  maxChunkSize: 600,
  chunkOverlap: 80,
  includeGlobs: [
    '**/*.ts',
    '**/*.tsx',
    '**/*.js',
    '**/*.jsx',
    '**/*.py',
    '**/*.go',
    '**/*.rs',
    '**/*.java',
    '**/*.md',
    '**/*.json',
  ],
  excludeGlobs: ['node_modules/**', '.git/**', 'dist/**', 'build/**', '.agent/**'],
  historyDir: '.agent/sessions',
  dbPath: '.agent/index.db',
  temperature: 0.2,
  topK: 8,
};

export async function ensureConfig(cwd: string): Promise<AgentConfig> {
  const configPath = path.join(cwd, CONFIG_FILENAME);
  if (!(await fs.pathExists(configPath))) {
    await fs.writeJson(configPath, DEFAULT_CONFIG, { spaces: 2 });
  }
  return loadConfig(cwd);
}

export async function loadConfig(cwd: string): Promise<AgentConfig> {
  const configPath = path.join(cwd, CONFIG_FILENAME);
  let config: AgentConfig;
  if (!(await fs.pathExists(configPath))) {
    config = { ...DEFAULT_CONFIG };
  } else {
    config = {
      ...DEFAULT_CONFIG,
      ...(await fs.readJson(configPath)),
    };
  }
  return hydratePaths(cwd, config);
}

export async function saveConfig(cwd: string, config: AgentConfig): Promise<void> {
  const configPath = path.join(cwd, CONFIG_FILENAME);
  const dehydrated = dehydratePaths(cwd, config);
  await fs.writeJson(configPath, dehydrated, { spaces: 2 });
}

function hydratePaths(cwd: string, config: AgentConfig): AgentConfig {
  const clone = { ...config };
  clone.dbPath = resolveDataPath(cwd, config.dbPath);
  clone.historyDir = resolveDataPath(cwd, config.historyDir);
  return clone;
}

function dehydratePaths(cwd: string, config: AgentConfig): AgentConfig {
  const clone = { ...config };
  clone.dbPath = makeRelative(cwd, config.dbPath);
  clone.historyDir = makeRelative(cwd, config.historyDir);
  return clone;
}

function resolveDataPath(cwd: string, maybeRelative: string): string {
  if (path.isAbsolute(maybeRelative)) {
    return maybeRelative;
  }
  return path.join(cwd, maybeRelative);
}

function makeRelative(cwd: string, maybeAbsolute: string): string {
  if (!path.isAbsolute(maybeAbsolute)) {
    return maybeAbsolute;
  }
  return path.relative(cwd, maybeAbsolute);
}
