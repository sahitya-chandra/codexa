import path from 'node:path';
import fs from 'fs-extra';
import dotenv from 'dotenv';
import ora from 'ora';
import { AgentConfig } from './types';
import { analyzeProject } from './config/detector';
import { generateConfig } from './config/generator';

dotenv.config();

export const CONFIG_FILENAME = '.codexarc.json';

const DEFAULT_CONFIG: AgentConfig = {
  modelProvider: 'groq',
  model: 'llama-3.1-8b-instant', // can also use llama-3.3-70b-versatile for better perf
  embeddingProvider: 'local',
  embeddingModel: 'Xenova/all-MiniLM-L6-v2',
  // localModelUrl: 'http://localhost:11434',
  // localModelApiKey: '',
  maxChunkSize: 800,
  chunkOverlap: 100,
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
  ],
  excludeGlobs: [
    'node_modules/**',
    '.git/**',
    'dist/**',
    'build/**',
    '.codexa/**',
    'package-lock.json',
  ],
  historyDir: '.codexa/sessions',
  dbPath: '.codexa/index.db',
  temperature: 0.2,
  topK: 10,
  maxFileSize: 5 * 1024 * 1024,
  skipBinaryFiles: true,
  skipLargeFiles: true,
};

/**
 * Generates a dynamic config by analyzing the codebase
 */
async function generateDynamicConfig(cwd: string): Promise<AgentConfig> {
  const spinner = ora('Analyzing codebase...').start();
  try {
    const analysis = await analyzeProject(cwd);
    spinner.succeed(
      `Detected: ${analysis.languages.length > 0 ? analysis.languages.join(', ') : 'no languages'} ${analysis.packageManagers.length > 0 ? `(${analysis.packageManagers.join(', ')})` : ''}`,
    );
    return generateConfig(analysis);
  } catch (error) {
    spinner.warn(
      `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}. Using default config.`,
    );
    return DEFAULT_CONFIG;
  }
}

export async function ensureConfig(cwd: string): Promise<AgentConfig> {
  const configPath = path.join(cwd, CONFIG_FILENAME);
  if (!(await fs.pathExists(configPath))) {
    const dynamicConfig = await generateDynamicConfig(cwd);
    await fs.writeJson(configPath, dynamicConfig, { spaces: 2 });
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
