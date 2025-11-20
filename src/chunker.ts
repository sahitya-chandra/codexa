import fs from 'fs-extra';
import readline from 'node:readline';
import { FileChunk } from './types';

export async function chunkFile(
  filePath: string,
  maxChunkSize: number,
  overlap: number
): Promise<FileChunk[]> {
  const chunks: FileChunk[] = [];
  const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const buffer: string[] = [];
  let currentSize = 0;
  let startLine = 1;
  let lineNumber = 0;

  for await (const line of rl) {
    lineNumber += 1;
    buffer.push(line);
    currentSize += line.length;
    const shouldFlush = currentSize >= maxChunkSize;
    if (shouldFlush) {
      const content = buffer.join('\n');
      chunks.push({
        filePath,
        startLine,
        endLine: lineNumber,
        content
      });

      const overlapStart = Math.max(0, buffer.length - overlap);
      const overlapBuffer = buffer.slice(overlapStart);
      startLine = lineNumber - overlapBuffer.length + 1;
      buffer.length = 0;
      buffer.push(...overlapBuffer);
      currentSize = buffer.reduce((acc, curr) => acc + curr.length, 0);
    }
  }

  if (buffer.length > 0) {
    chunks.push({
      filePath,
      startLine,
      endLine: lineNumber,
      content: buffer.join('\n')
    });
  }

  return chunks;
}

