#!/usr/bin/env node
import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { ensureConfig, loadConfig } from './config';
import { ingestRepository } from './ingest';
import { askQuestion } from './agent';
import { log } from './utils/logger';
import { formatQuestion } from './utils/formatter';
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';

marked.setOptions({
  renderer: new TerminalRenderer({
    tab: 2,
  }),
});

const program = new Command();

program
  .name('codexa')
  .description('Ask questions about any local repository from the command line.')
  .version('1.1.1')
  .action(() => {
    console.log('\n');
    log.box(
      `${chalk.bold('Welcome to Codexa!')}\n\n` +
        `${chalk.dim('Codexa is a CLI tool that helps you understand your codebase using AI.')}\n\n` +
        `${chalk.bold('Getting Started:')}\n\n` +
        `${chalk.dim('1.')} ${chalk.white('Initialize Codexa in your project:')}\n` +
        `   ${chalk.cyan('codexa init')}\n\n` +
        `${chalk.dim('2.')} ${chalk.white('Index your codebase:')}\n` +
        `   ${chalk.cyan('codexa ingest')}\n\n` +
        `${chalk.dim('3.')} ${chalk.white('Ask questions:')}\n` +
        `   ${chalk.cyan('codexa ask "your question"')}\n\n` +
        `${chalk.dim('For more help, run:')} ${chalk.cyan('codexa --help')}`,
      '🚀 Codexa',
    );
    console.log('\n');
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
        `${chalk.dim('2.')} ${chalk.white('Run:')} ${chalk.cyan('codexa ingest')} ${chalk.dim('- Start indexing your codebase')}\n` +
        `${chalk.dim('3.')} ${chalk.white('Run:')} ${chalk.cyan('codexa ask "your question"')} ${chalk.dim('- Ask questions about your code')}`,
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

program.parseAsync(process.argv).catch(handleError);

function handleError(error: unknown): void {
  if (error instanceof Error) {
    log.error(error.message);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
}
