#!/usr/bin/env node
import { Command } from 'commander';
import ora from 'ora';
import { ensureConfig, loadConfig } from './config';
import { ingestRepository } from './ingest';
import { askQuestion } from './agent';
import { log } from './utils/logger';

const program = new Command();

program
  .name('guardian')
  .description('Ask questions about any local repository from the command line.')
  .version('0.1.0');

program
  .command('init')
  .description('Create a local .guardianrc.json with sensible defaults.')
  .action(async () => {
    const cwd = process.cwd();
    await ensureConfig(cwd);
    log.success('Created .guardianrc.json. Update it with your provider keys if needed.');
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
  .option('--no-stream', 'disable streaming output')
  .action(async (question: string[], options: { session?: string; stream?: boolean }) => {
    const cwd = process.cwd();
    const config = await loadConfig(cwd);
    const prompt = question.join(' ');

    // Commander behavior:
    //   default: stream = true
    //   --no-stream => stream = false
    const stream = options.stream !== false;

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

      spinner.stop();

      if (!stream) {
        console.log('\n' + answer.trim() + '\n');
      } else {
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
