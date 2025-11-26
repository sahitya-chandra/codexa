import { describe, it, expect, vi, afterEach } from 'vitest';
import { ensureConfig, loadConfig } from '../src/config';
import fs from 'fs-extra';
import path from 'node:path';

vi.mock('fs-extra');

describe('config', () => {
  const mockCwd = '/test/cwd';

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create default config if not exists', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false as any);
    vi.mocked(fs.writeJson).mockResolvedValue(undefined);
    vi.mocked(fs.readJson).mockResolvedValue({}); // Mock readJson to return empty object for merging

    await ensureConfig(mockCwd);

    expect(fs.writeJson).toHaveBeenCalledWith(
      path.join(mockCwd, '.agentrc.json'),
      expect.objectContaining({ modelProvider: 'local' }),
      expect.anything()
    );
  });

  it('should load existing config', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true as any);
    vi.mocked(fs.readJson).mockResolvedValue({
      modelProvider: 'openai',
    });

    const config = await loadConfig(mockCwd);

    expect(config.modelProvider).toBe('openai');
    expect(config.dbPath).toContain(mockCwd); // Check hydration
  });
});
