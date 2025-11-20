"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = __importDefault(require("node:path"));
const config_1 = require("../src/config");
const ingest_1 = require("../src/ingest");
const retriever_1 = require("../src/retriever");
async function main() {
    const sampleRoot = node_path_1.default.resolve(__dirname, '../examples/sample');
    await (0, config_1.ensureConfig)(sampleRoot);
    const config = await (0, config_1.loadConfig)(sampleRoot);
    await (0, ingest_1.ingestRepository)({ cwd: sampleRoot, config, force: true });
    const results = await (0, retriever_1.retrieveContext)('How do we greet someone?', config);
    if (results.length === 0) {
        throw new Error('Smoke test failed: no retrieval results.');
    }
    console.log('Top chunk:', results[0].filePath, `${results[0].startLine}-${results[0].endLine}`);
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
