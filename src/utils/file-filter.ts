import fs from 'fs-extra';
import { promises as fsPromises } from 'node:fs';

// Default maximum file size (5MB)
const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024;

// Binary file extensions that should always be excluded
const BINARY_EXTENSIONS = new Set([
  '.exe',
  '.dll',
  '.so',
  '.dylib',
  '.bin',
  '.o',
  '.obj',
  '.a',
  '.lib',
  '.jar',
  '.war',
  '.ear',
  '.zip',
  '.tar',
  '.gz',
  '.bz2',
  '.xz',
  '.rar',
  '.7z',
  '.deb',
  '.rpm',
  '.dmg',
  '.iso',
  '.img',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.bmp',
  '.tiff',
  '.ico',
  '.svg', // Can be text but often large/binary-like
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.otf',
  '.mp3',
  '.mp4',
  '.avi',
  '.mov',
  '.wmv',
  '.flv',
  '.webm',
  '.mkv',
]);

/**
 * Checks if a file extension indicates a binary file
 */
function isBinaryExtension(filePath: string): boolean {
  const ext = filePath.toLowerCase().split('.').pop();
  return ext ? BINARY_EXTENSIONS.has(`.${ext}`) : false;
}

/**
 * Checks if file content appears to be binary
 * Reads first 512 bytes and checks for null bytes or high percentage of non-text characters
 */
async function isBinaryContent(filePath: string): Promise<boolean> {
  try {
    const buffer = Buffer.alloc(512);
    const fd = await fsPromises.open(filePath, 'r');
    const { bytesRead } = await fd.read(buffer, 0, 512, 0);
    await fd.close();

    if (bytesRead === 0) {
      return false; // Empty file, treat as text
    }

    let nullBytes = 0;
    let nonTextChars = 0;

    for (let i = 0; i < bytesRead; i++) {
      const byte = buffer[i];
      if (byte === 0) {
        nullBytes++;
      }
      // Check for non-printable ASCII (excluding common whitespace: \t, \n, \r)
      if (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) {
        nonTextChars++;
      }
    }

    // If we find null bytes, it's definitely binary
    if (nullBytes > 0) {
      return true;
    }

    // If more than 30% of bytes are non-text, likely binary
    const nonTextRatio = nonTextChars / bytesRead;
    return nonTextRatio > 0.3;
  } catch {
    // On error, assume text (safer to include than exclude)
    return false;
  }
}

/**
 * Gets file size in bytes
 */
async function getFileSize(filePath: string): Promise<number> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

export interface FileFilterOptions {
  maxFileSize?: number; // in bytes
  skipBinary?: boolean;
  skipLargeFiles?: boolean;
}

export interface FileFilterResult {
  shouldInclude: boolean;
  reason?: string;
  size?: number;
}

/**
 * Determines if a file should be included in indexing
 */
export async function shouldIncludeFile(
  filePath: string,
  options: FileFilterOptions = {},
): Promise<FileFilterResult> {
  const { maxFileSize = DEFAULT_MAX_FILE_SIZE, skipBinary = true, skipLargeFiles = true } = options;

  // Check file size first (fastest check)
  if (skipLargeFiles) {
    const size = await getFileSize(filePath);
    if (size > maxFileSize) {
      return {
        shouldInclude: false,
        reason: `File size (${(size / 1024 / 1024).toFixed(2)}MB) exceeds maximum (${(maxFileSize / 1024 / 1024).toFixed(2)}MB)`,
        size,
      };
    }
  }

  // Check binary extension (fast check)
  if (skipBinary && isBinaryExtension(filePath)) {
    return {
      shouldInclude: false,
      reason: 'Binary file extension',
    };
  }

  // Check binary content (slower, but more accurate)
  if (skipBinary) {
    const isBinary = await isBinaryContent(filePath);
    if (isBinary) {
      return {
        shouldInclude: false,
        reason: 'Binary file content detected',
      };
    }
  }

  return {
    shouldInclude: true,
  };
}

/**
 * Filters an array of file paths, removing those that should be excluded
 */
export async function filterFiles(
  filePaths: string[],
  options: FileFilterOptions = {},
): Promise<{ included: string[]; excluded: Array<{ path: string; reason: string }> }> {
  const included: string[] = [];
  const excluded: Array<{ path: string; reason: string }> = [];

  for (const filePath of filePaths) {
    const result = await shouldIncludeFile(filePath, options);
    if (result.shouldInclude) {
      included.push(filePath);
    } else if (result.reason) {
      excluded.push({ path: filePath, reason: result.reason });
    }
  }

  return { included, excluded };
}
