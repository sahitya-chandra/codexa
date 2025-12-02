# Contributing to Codexa

Thank you for your interest in contributing to Codexa! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs. actual behavior
- Environment details (OS, Node.js version, etc.)
- Relevant logs or error messages

### Suggesting Features

We welcome feature suggestions! Please open an issue with:
- A clear description of the feature
- Use case and motivation
- Possible implementation approach (if you have one)

### Pull Requests

1. **Fork the repository** and clone your fork
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following our coding standards
4. **Test your changes**:
   ```bash
   npm test
   npm run lint
   ```
5. **Commit your changes** with clear, descriptive messages:
   ```bash
   git commit -m "Add: description of your change"
   ```
6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request** with:
   - A clear title and description
   - Reference to related issues
   - Screenshots (if applicable)

## Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sahitya-chandra/codexa.git
   cd codexa
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Link for local development**:
   ```bash
   npm link
   ```

5. **Run tests**:
   ```bash
   npm test
   ```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Code Style

- Run the linter before committing:
  ```bash
  npm run lint
  ```
- Format code using Prettier:
  ```bash
  npm run format
  ```

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add support for custom embedding models
fix: resolve issue with large file ingestion
docs: update installation instructions
```

## Project Structure

```
codexa/
├── src/              # TypeScript source files
│   ├── agent.ts      # Main agent logic
│   ├── chunker.ts    # Code chunking
│   ├── cli.ts        # CLI interface
│   ├── config.ts     # Configuration management
│   ├── db.ts         # Database operations
│   ├── embeddings/   # Embedding providers
│   ├── ingest.ts     # Ingestion logic
│   ├── models/       # LLM providers
│   ├── retriever.ts  # Vector retrieval
│   └── utils/        # Utility functions
├── dist/             # Compiled JavaScript
├── tests/            # Test files
└── bin/              # Binary entry point
```

## Testing

- Write tests for new features
- Ensure all existing tests pass
- Maintain or improve test coverage
- Test edge cases and error handling

Run tests with:
```bash
npm test
```

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for new functions
- Update this CONTRIBUTING.md if needed
- Keep examples up to date

## Release Process

Releases are handled by maintainers. After your PR is merged:
1. Version will be updated
2. Changes will be included in the release notes
3. Package will be published to npm

## Getting Help

- Open an issue for questions
- Check existing issues and discussions
- Reach out to maintainers if needed

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Codexa! 🎉

