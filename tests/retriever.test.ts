import { describe, it, expect, vi, afterEach } from 'vitest';
import { retrieveContext, formatContext } from '../src/retriever';
import { createEmbedder } from '../src/embeddings';
import { VectorStore } from '../src/db';

vi.mock('../src/embeddings');
vi.mock('../src/db');

describe('retriever', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should retrieve context', async () => {
    const mockEmbedder = {
      embed: vi.fn().mockResolvedValue([[0.1, 0.2]]),
    };
    vi.mocked(createEmbedder).mockResolvedValue(
      mockEmbedder as unknown as import('../src/embeddings').Embedder,
    );

    const mockStore = {
      init: vi.fn(),
      search: vi.fn().mockReturnValue([{ content: 'match' }]),
    };
    (
      VectorStore as unknown as { mockImplementation: (fn: () => typeof mockStore) => void }
    ).mockImplementation(function () {
      return mockStore;
    });

    const config = {
      dbPath: 'test.db',
      topK: 5,
    } as unknown as import('../src/types').AgentConfig;

    const results = await retrieveContext('query', config);

    expect(mockEmbedder.embed).toHaveBeenCalledWith(['query']);
    expect(mockStore.search).toHaveBeenCalledWith([0.1, 0.2], 5);
    expect(results).toEqual([{ content: 'match' }]);
  });

  it('should format context', () => {
    const results = [
      {
        filePath: 'file1.ts',
        startLine: 1,
        endLine: 5,
        content: 'code1',
        compressed: 'code1',
        score: 0.9,
      },
      {
        filePath: 'file2.ts',
        startLine: 10,
        endLine: 15,
        content: 'code2',
        compressed: 'code2',
        score: 0.8,
      },
    ];

    const formatted = formatContext(results as unknown as import('../src/types').RetrievalResult[]);

    expect(formatted).toContain('FILE: file1.ts:1-5');
    expect(formatted).toContain('CODE_SNIPPET: code1');
    expect(formatted).toContain('FILE: file2.ts:10-15');
    expect(formatted).toContain('CODE_SNIPPET: code2');
  });
});
