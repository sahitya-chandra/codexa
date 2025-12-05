import boxen from 'boxen';
import chalk from 'chalk';

export const log = {
  info: (msg: string) => console.log(chalk.cyan('ℹ'), msg),
  success: (msg: string) => console.log(chalk.green('✓'), msg),
  warn: (msg: string) => console.log(chalk.yellow('⚠'), msg),
  error: (msg: string) => console.log(chalk.red('✗'), msg),
  box: (content: string, title?: string) =>
    console.log(
      boxen(content, {
        title,
        borderColor: 'cyan',
        padding: 1,
      }),
    ),
};
