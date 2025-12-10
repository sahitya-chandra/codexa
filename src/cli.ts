#!/usr/bin/env node
import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import path from 'node:path';
import fs from 'fs-extra';
import { ensureConfig, loadConfig, saveConfig, CONFIG_FILENAME } from './config';
import { ingestRepository } from './ingest';
import { askQuestion } from './agent';
import { log } from './utils/logger';
import { formatQuestion } from './utils/formatter';
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';
import gradient from 'gradient-string';
import boxen from 'boxen';

marked.setOptions({
  renderer: new TerminalRenderer({
    tab: 2,
  }),
});

function showBanner() {
  const asciiArt = `
    ╔════════════════════════════════════════════════════════╗
    ║                                                        ║
    ║     ██████╗ ██████╗ ██████╗ ███████╗██╗  ██╗ █████╗    ║
    ║    ██╔════╝██╔═══██╗██╔══██╗██╔════╝╚██╗██╔╝██╔══██╗   ║
    ║    ██║     ██║   ██║██║  ██║█████╗   ╚███╔╝ ███████║   ║
    ║    ██║     ██║   ██║██║  ██║██╔══╝   ██╔██╗ ██╔══██║   ║
    ║    ╚██████╗╚██████╔╝██████╔╝███████╗██╔╝ ██╗██║  ██║   ║
    ║     ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝   ║
    ║                                                        ║
    ╚════════════════════════════════════════════════════════╝
  `;
  try {
    const gradientArt = gradient('cyan', 'blue', 'magenta')(asciiArt);
    console.log(gradientArt);

    const message = boxen(
      `${chalk.bold('🎉 Codexa installed successfully!')}\n\n` +
        `${chalk.dim('Codexa is a CLI tool that helps you understand your codebase using AI.')}\n\n` +
        `${chalk.bold('Quick Start:')}\n\n` +
        `${chalk.dim('1.')} ${chalk.white('Navigate to your project directory')}\n` +
        `${chalk.dim('2.')} ${chalk.white('Initialize Codexa:')} ${chalk.cyan('codexa init')}\n` +
        `${chalk.dim('3.')} ${chalk.white('Set your GROQ API Key:')} ` +
        `${getAPIKeyStep()}\n` +
        `${chalk.dim('4.')} ${chalk.white('Index your codebase:')} ${chalk.cyan('codexa ingest')}\n` +
        `${chalk.dim('5.')} ${chalk.white('Ask questions:')} ${chalk.cyan('codexa ask "your question"')}\n\n` +
        `${chalk.dim('For help, run:')} ${chalk.cyan('codexa --help')}\n` +
        `${chalk.dim('Or visit:')} ${chalk.cyan('https://github.com/sahitya-chandra/codexa')}`,
      {
        title: '🚀 Welcome to Codexa',
        borderColor: 'cyan',
        padding: 1,
        margin: 1,
      },
    );

    console.log(message);
  } catch {
    console.log('\n🎉 Codexa installed successfully!\n');
    console.log('Quick Start:');
    console.log('1. Navigate to your project directory');
    console.log('2. Initialize Codexa: codexa init');
    console.log('3. Set your GROQ API Key');
    console.log('4. Index your codebase: codexa ingest');
    console.log('5. Ask questions: codexa ask "your question"\n');
  }
}

function getAPIKeyStep() {
  return `${chalk.cyan('codexa config set GROQ_API_KEY <your-groq-key>')}`;
}

const program = new Command();

program
  .name('codexa')
  .description('Ask questions about any local repository from the command line.')
  .version('1.2.2')
  .action(() => {
    showBanner();
  });

program
  .command('init')
  .description('Create a local .codexarc.json with sensible defaults.')
  .action(async () => {
    const cwd = process.cwd();
    await ensureConfig(cwd);
    console.log('\n');
    log.success('Created .codexarc.json with optimized settings for your codebase!');
    console.log('\n');
    log.box(
      `${chalk.bold('Next Steps:')}\n\n` +
        `${chalk.dim('1.')} ${chalk.white('Review .codexarc.json')} - Update provider keys if needed\n` +
        `${chalk.dim('2.')} ${chalk.white('Set your GROQ API Key:')} ` +
        `${getAPIKeyStep()}\n` +
        `${chalk.dim('3.')} ${chalk.white('Run:')} ${chalk.cyan('codexa ingest')} ${chalk.dim('- Start indexing your codebase')}\n` +
        `${chalk.dim('4.')} ${chalk.white('Run:')} ${chalk.cyan('codexa ask "your question"')} ${chalk.dim('- Ask questions about your code')}`,
      '🚀 Setup Complete',
    );
    console.log('\n');
  });

program
  .command('ingest')
  .option('-f, --force', 'clear the previous index before ingesting', false)
  .description('Chunk the current repository and store embeddings locally.')
  .action(async (options: { force?: boolean }) => {
    const cwd = process.cwd();
    const config = await ensureConfig(cwd);
    try {
      await ingestRepository({ cwd, config, force: options.force });
    } catch (error) {
      console.log('Ingestion failed.');
      handleError(error);
    }
  });

program
  .command('ask')
  .description('Ask a natural-language question about the current repo.')
  .argument('<question...>', 'Question to ask about the codebase.')
  .option('-s, --session <name>', 'session identifier to keep conversation context', 'default')
  .option('--stream', 'enable streaming output')
  .action(async (question: string[], options: { session?: string; stream?: boolean }) => {
    const cwd = process.cwd();
    const config = await loadConfig(cwd);
    const prompt = question.join(' ');

    // dfefault: non-streamed output
    const stream = options.stream === true;

    console.log(formatQuestion(prompt));
    const spinner = ora('Extracting Response...').start();

    try {
      const answer = await askQuestion(cwd, config, {
        question: prompt,
        session: options.session,
        stream,
        onToken: stream
          ? (token) => {
              if (spinner.isSpinning) spinner.stop();
              process.stdout.write(token);
            }
          : undefined,
        onStatusUpdate: (status) => {
          if (!stream) spinner.text = status;
        },
      });

      if (!stream) {
        const rendered = marked.parse(answer.trim());
        spinner.stop();
        console.log('\n' + rendered + '\n');
      } else {
        spinner.stop();
        console.log('\n');
      }
    } catch (error) {
      spinner.fail('Question failed.');
      handleError(error);
    }
  });

program
  .command('config')
  .description('Manage configuration values')
  .argument('[action]', 'Action to perform (set, get, list)')
  .argument('[key]', 'Configuration key')
  .argument('[value]', 'Configuration value')
  .action(async (action, key, value) => {
    const cwd = process.cwd();
    const configPath = path.join(cwd, CONFIG_FILENAME);

    if (!(await fs.pathExists(configPath))) {
      log.error(`Configuration file not found. Please run ${chalk.cyan('codexa init')} first.`);
      return;
    }

    const config = await loadConfig(cwd);

    if (action === 'set') {
      if (!key || !value) {
        log.error('Usage: codexa config set <key> <value>');
        return;
      }
      if (key === 'GROQ_API_KEY') {
        config.groqApiKey = value;
        await saveConfig(cwd, config);
        log.success(`Updated ${key}`);
      } else {
        log.error(`Unknown config key: ${key}`);
      }
    } else if (action === 'get') {
      if (!key) {
        log.error('Usage: codexa config get <key>');
        return;
      }
      if (key === 'GROQ_API_KEY') {
        console.log(config.groqApiKey || 'Not set');
      } else {
        log.error(`Unknown config key: ${key}`);
      }
    } else if (action === 'list') {
      console.log(config);
    } else {
      log.error('Usage: codexa config <set|get|list> [key] [value]');
    }
  });

program.parseAsync(process.argv).catch(handleError);

function handleError(error: unknown): void {
  if (error instanceof Error) {
    log.error(error.message);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
}
