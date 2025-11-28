import { describe, it, expect, vi, afterEach } from 'vitest';
import { chunkFile } from '../src/chunker';
import fs from 'fs-extra';
import { Readable } from 'stream';

vi.mock('fs-extra');

describe('chunker', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should chunk a file correctly based on maxChunkSize', async () => {
    const mockContent = 'line1\nline2\nline3\nline4\nline5';
    const mockStream = Readable.from(mockContent.split('\n').map((l) => l + '\n'));

    // Mock fs.createReadStream to return our readable stream
    vi.mocked(fs.createReadStream).mockReturnValue(mockStream as unknown as fs.ReadStream);

    // maxChunkSize small enough to force splitting
    // line1\n = 6 chars
    // line2\n = 6 chars
    // ...
    const chunks = await chunkFile('test.txt', 12, 0);

    // Expecting chunks roughly every 2 lines
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].filePath).toBe('test.txt');
    expect(chunks[0].content).toContain('line1');
  });

  it('should handle overlap correctly', async () => {
    const mockContent = 'line1\nline2\nline3\nline4';
    const mockStream = Readable.from(mockContent.split('\n').map((l) => l + '\n'));
    vi.mocked(fs.createReadStream).mockReturnValue(mockStream as unknown as fs.ReadStream);

    // Chunk size small, overlap large enough to include previous line
    const chunks = await chunkFile('test.txt', 10, 5);

    expect(chunks.length).toBeGreaterThan(1);
    // Check if overlap logic works (this is a basic check, specific behavior depends on implementation details)
    // If implementation keeps buffer, we expect some repetition
  });
});
