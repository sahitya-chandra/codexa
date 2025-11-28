import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VectorStore } from '../src/db';

const mockDbInstance = {
  pragma: vi.fn(),
  prepare: vi.fn().mockReturnThis(),
  run: vi.fn(),
  all: vi.fn().mockReturnValue([]),
  transaction: vi.fn((fn) => fn),
};

// Mock better-sqlite3
vi.mock('better-sqlite3', () => {
  return {
    default: vi.fn(function () {
      return mockDbInstance;
    }),
  };
});

describe('VectorStore', () => {
  let store: VectorStore;

  beforeEach(() => {
    vi.clearAllMocks();
    store = new VectorStore(':memory:');
  });

  it('should initialize the database', () => {
    store.init();
    expect(mockDbInstance.prepare).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS chunks'),
    );
  });

  it('should insert chunks', () => {
    store.init(); // Initialize first
    const chunks = [
      {
        filePath: 'test.ts',
        startLine: 1,
        endLine: 10,
        content: 'code',
        compressed: 'code',
        embedding: [0.1, 0.2],
      },
    ];

    store.insertChunks(chunks);
    expect(mockDbInstance.prepare).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO chunks'),
    );
  });

  it('should search for chunks', () => {
    store.init();
    // Mock return value for search
    mockDbInstance.all.mockReturnValue([
      {
        id: 1,
        file_path: 'test.ts',
        start_line: 1,
        end_line: 10,
        content: 'code',
        compressed: 'code',
        embedding: JSON.stringify([0.1, 0.2]),
      },
    ]);

    const results = store.search([0.1, 0.2], 1);
    expect(results.length).toBe(1);
    expect(results[0].filePath).toBe('test.ts');
  });
});
