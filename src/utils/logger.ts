import chalk from 'chalk';

export const log = {
  info: (msg: string) => console.log(chalk.cyan('info'), msg),
  success: (msg: string) => console.log(chalk.green('success'), msg),
  warn: (msg: string) => console.log(chalk.yellow('warn'), msg),
  error: (msg: string) => console.log(chalk.red('error'), msg),
};
