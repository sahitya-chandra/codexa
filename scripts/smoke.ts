import path from 'node:path';
import { ensureConfig, loadConfig } from '../src/config';
import { ingestRepository } from '../src/ingest';
import { retrieveContext } from '../src/retriever';

async function main(): Promise<void> {
  const sampleRoot = path.resolve(__dirname, '../examples/sample');
  await ensureConfig(sampleRoot);
  const config = await loadConfig(sampleRoot);
  await ingestRepository({ cwd: sampleRoot, config, force: true });
  const results = await retrieveContext('How do we greet someone?', config);
  if (results.length === 0) {
    throw new Error('Smoke test failed: no retrieval results.');
  }
  console.log('Top chunk:', results[0].filePath, `${results[0].startLine}-${results[0].endLine}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
