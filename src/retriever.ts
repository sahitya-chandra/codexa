import { AgentConfig, RetrievalResult } from './types';
import { createEmbedder } from './embeddings';
import { VectorStore } from './db';

// helper to determine file type and priority
function extractFileMentions(question: string): string[] {
  const filePattern = /[\w\/\-\.]+\.(ts|tsx|js|jsx|py|go|rs|java|mjs|cjs|md|mdx)/gi;
  const matches = question.match(filePattern) || [];

  const bareFilenamePattern = /\b(\w+\.(ts|tsx|js|jsx|py|go|rs|java|mjs|cjs|md|mdx))\b/gi;
  const bareMatches = (question.match(bareFilenamePattern) || []).map((m) => m.toLowerCase());

  const markdownMentions = [];
  if (question.toLowerCase().includes('readme')) markdownMentions.push('readme.md');
  if (question.toLowerCase().includes('contributing')) markdownMentions.push('contributing.md');
  if (question.toLowerCase().includes('changelog')) markdownMentions.push('changelog.md');

  const allMatches = [...matches, ...bareMatches, ...markdownMentions].map((m) =>
    m.toLowerCase().trim(),
  );

  // remove duplicates
  return [...new Set(allMatches)];
}

// helper to match file paths flexibly
function matchesFilePattern(filePath: string, pattern: string): boolean {
  const lowerPath = filePath.toLowerCase();
  const lowerPattern = pattern.toLowerCase();

  if (lowerPath === lowerPattern) return true;

  if (lowerPath.endsWith(lowerPattern)) return true;

  if (lowerPath.includes(lowerPattern)) return true;

  // match just the filename part
  const pathParts = lowerPath.split('/');
  const fileName = pathParts[pathParts.length - 1];
  const patternFileName = lowerPattern.split('/').pop() || lowerPattern;

  if (fileName === patternFileName) return true;

  return false;
}

function getFileTypePriority(filePath: string, question: string, mentionedFiles: string[]): number {
  const lowerPath = filePath.toLowerCase();
  const ext = lowerPath.split('.').pop() || '';
  const fileName = filePath.split('/').pop()?.toLowerCase() || '';

  const isMentioned = mentionedFiles.some((mentioned) => {
    const mentionedLower = mentioned.toLowerCase();
    return (
      lowerPath.includes(mentionedLower) ||
      fileName === mentionedLower ||
      lowerPath.endsWith(mentionedLower)
    );
  });

  if (isMentioned) {
    return 3.0;
  }

  const codeExtensions = ['ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'java'];
  if (codeExtensions.includes(ext)) {
    return 1.3;
  }

  // md files - heavy penalty
  if (ext === 'md' || lowerPath.includes('readme')) {
    return 0.05;
  }

  return 1.0;
}

export async function retrieveContext(
  question: string,
  config: AgentConfig,
): Promise<RetrievalResult[]> {
  const embedder = await createEmbedder(config);
  const [qvec] = await embedder.embed([question]);

  const mentionedFiles = extractFileMentions(question);

  const store = new VectorStore(config.dbPath);
  store.init();

  const directFileResults: RetrievalResult[] = [];
  if (mentionedFiles.length > 0) {
    for (const mentionedFile of mentionedFiles) {
      const chunks = store.getChunksByFilePath(mentionedFile, 5);
      const matchingChunks = chunks.filter((r) => matchesFilePattern(r.filePath, mentionedFile));
      directFileResults.push(...matchingChunks);
    }
  }

  const vectorResults = store.search(qvec, config.topK * 4);

  // Combine direct file lookups with vector search results
  // map to deduplicate by file path and line range
  const resultMap = new Map<string, RetrievalResult>();

  directFileResults.forEach((result) => {
    const key = `${result.filePath}:${result.startLine}-${result.endLine}`;
    if (!resultMap.has(key)) {
      resultMap.set(key, {
        ...result,
        score: result.score * 3.0,
      });
    }
  });

  vectorResults.forEach((result) => {
    const key = `${result.filePath}:${result.startLine}-${result.endLine}`;
    const existing = resultMap.get(key);
    if (existing) {
      const newScore =
        result.score * getFileTypePriority(result.filePath, question, mentionedFiles);
      if (newScore > existing.score) {
        resultMap.set(key, { ...result, score: newScore });
      }
    } else {
      resultMap.set(key, {
        ...result,
        score: result.score * getFileTypePriority(result.filePath, question, mentionedFiles),
      });
    }
  });

  const allResults = Array.from(resultMap.values());
  allResults.sort((a, b) => b.score - a.score);

  const mentionedMarkdownFiles = mentionedFiles.filter(
    (f) => f.toLowerCase().endsWith('.md') || f.toLowerCase().includes('readme'),
  );

  const codeResults = allResults.filter((r) => {
    const ext = r.filePath.toLowerCase().split('.').pop() || '';
    return !['md', 'txt'].includes(ext) && !r.filePath.toLowerCase().includes('readme');
  });

  const mentionedMarkdownResults =
    mentionedMarkdownFiles.length > 0
      ? allResults.filter((r) => {
          const ext = r.filePath.toLowerCase().split('.').pop() || '';
          const isMarkdown = ext === 'md' || r.filePath.toLowerCase().includes('readme');
          if (!isMarkdown) return false;
          return mentionedFiles.some((mentioned) => matchesFilePattern(r.filePath, mentioned));
        })
      : [];

  if (mentionedMarkdownResults.length > 0) {
    const combined = [...codeResults, ...mentionedMarkdownResults];
    // remove duplicates
    const uniqueResults = Array.from(
      new Map(combined.map((r) => [`${r.filePath}:${r.startLine}-${r.endLine}`, r])).values(),
    );
    return uniqueResults.slice(0, config.topK);
  }

  if (codeResults.length >= Math.ceil(config.topK / 2)) {
    return codeResults.slice(0, config.topK);
  }

  return allResults.slice(0, config.topK);
}

export function formatContext(results: RetrievalResult[]): string {
  const MAX_CHUNK_DISPLAY_LENGTH = 1500;

  const codeSnippets: RetrievalResult[] = [];
  const docs: RetrievalResult[] = [];

  results.forEach((r) => {
    const isDoc =
      r.filePath.toLowerCase().endsWith('.md') || r.filePath.toLowerCase().includes('readme');
    if (isDoc) {
      docs.push(r);
    } else {
      codeSnippets.push(r);
    }
  });

  const codeSection = codeSnippets
    .map((r, index) => {
      let content = r.content || '';
      if (content.length > MAX_CHUNK_DISPLAY_LENGTH) {
        content = content.slice(0, MAX_CHUNK_DISPLAY_LENGTH) + '\n... (truncated)';
      }
      return `[${index + 1}] CODE FILE: ${r.filePath}:${r.startLine}-${r.endLine}
CODE_SNIPPET:
${content}`;
    })
    .join('\n\n---\n\n');

  const docsSection =
    docs.length > 0
      ? '\n\n=== DOCUMENTATION (for reference only, prioritize CODE above) ===\n\n' +
        docs
          .map((r, index) => {
            let content = r.content || '';
            if (content.length > MAX_CHUNK_DISPLAY_LENGTH) {
              content = content.slice(0, MAX_CHUNK_DISPLAY_LENGTH) + '\n... (truncated)';
            }
            return `DOC [${index + 1}] FILE: ${r.filePath}:${r.startLine}-${r.endLine}
DOCUMENTATION:
${content}`;
          })
          .join('\n\n---\n\n')
      : '';

  return codeSection + docsSection;
}
