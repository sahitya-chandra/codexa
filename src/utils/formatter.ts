import boxen from 'boxen';
import chalk from 'chalk';
import { highlight } from 'cli-highlight';
import gradient from 'gradient-string';

export function formatQuestion(question: string): string {
  return boxen(gradient.rainbow(question), {
    title: 'Question',
    borderColor: 'cyan',
    padding: 1,
    margin: { top: 1, bottom: 1 },
  });
}

export function formatAnswer(answer: string): string {
  let formatted = answer.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, lang, code) => {
    const highlighted = highlight(code.trim(), {
      language: lang || 'typescript',
      ignoreIllegals: true,
    });

    return (
      chalk.gray('┌─ Code ───────────────────────────────┐\n') +
      highlighted +
      '\n' +
      chalk.gray('└──────────────────────────────────────┘')
    );
  });

  // Emphasize file names and line references
  formatted = formatted
    .replace(/`([^`]+\.(ts|js|tsx|jsx|py|go|rs))`/g, (_m, file) => chalk.cyan.underline(file))
    .replace(/line (\d+)/gi, (_m, num) => chalk.yellow(`line ${num}`));

  return formatted;
}

export function formatStats(stats: {
  files: number;
  chunks: number;
  avgChunkSize: number;
  durationSec: number;
}): string {
  return boxen(
    [
      chalk.bold('Ingestion complete'),
      `${chalk.cyan('Files')}: ${stats.files}`,
      `${chalk.cyan('Chunks')}: ${stats.chunks}`,
      `${chalk.cyan('Avg chunk')}: ${stats.avgChunkSize.toFixed(1)} lines`,
      `${chalk.cyan('Duration')}: ${stats.durationSec.toFixed(1)}s`,
    ].join('\n'),
    { borderColor: 'green', padding: 1, margin: 1 },
  );
}
