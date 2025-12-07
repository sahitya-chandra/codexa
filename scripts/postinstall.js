#!/usr/bin/env node

// Use dynamic import for ESM modules (chalk v5 is ESM-only)
(async () => {
  try {
    const chalk = (await import('chalk')).default;
    const boxen = (await import('boxen')).default;
    const gradient = (await import('gradient-string')).default;

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

    const gradientArt = gradient('cyan', 'blue', 'magenta')(asciiArt);

    console.log('\n');
    console.log(gradientArt);
    console.log('\n');

    const message = boxen(
      `${chalk.bold('🎉 Codexa installed successfully!')}\n\n` +
        `${chalk.dim('Codexa is a CLI tool that helps you understand your codebase using AI.')}\n\n` +
        `${chalk.bold('Quick Start:')}\n\n` +
        `${chalk.dim('1.')} ${chalk.white('Navigate to your project directory')}\n` +
        `${chalk.dim('2.')} ${chalk.white('Initialize Codexa:')} ${chalk.cyan('codexa init')}\n` +
        `${chalk.dim('3.')} ${chalk.white('Index your codebase:')} ${chalk.cyan('codexa ingest')}\n` +
        `${chalk.dim('4.')} ${chalk.white('Ask questions:')} ${chalk.cyan('codexa ask "your question"')}\n\n` +
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
    console.log('\n');
  } catch (error) {
    // Fallback if modules aren't available (shouldn't happen, but just in case)
    console.log('\n🎉 Codexa installed successfully!\n');
    console.log('Quick Start:');
    console.log('1. Navigate to your project directory');
    console.log('2. Initialize Codexa: codexa init');
    console.log('3. Index your codebase: codexa ingest');
    console.log('4. Ask questions: codexa ask "your question"\n');
  }
})();

