import { CodeBlock } from "@/components/ui/code-block";
import { Tabs } from "@/components/ui/tabs";

export default function DocsPage() {
  const installTabs = [
    {
      label: "npm",
      content: (
        <>
          <p className="leading-7 [&:not(:first-child)]:mt-6">Install Guardian globally using npm:</p>
          <CodeBlock code="npm install -g guardian" language="bash" />
        </>
      ),
    },
    {
      label: "pnpm",
      content: (
        <>
          <p className="leading-7 [&:not(:first-child)]:mt-6">Or with pnpm:</p>
          <CodeBlock code="pnpm add -g guardian" language="bash" />
        </>
      ),
    },
    {
      label: "bun",
      content: (
        <>
          <p className="leading-7 [&:not(:first-child)]:mt-6">Or with bun:</p>
          <CodeBlock code="bun add -g guardian" language="bash" />
        </>
      ),
    },
    {
      label: "yarn",
      content: (
        <>
          <p className="leading-7 [&:not(:first-child)]:mt-6">Or with Yarn:</p>
          <CodeBlock code="yarn global add guardian" language="bash" />
        </>
      ),
    },
  ];

  return (
    <div className="space-y-12 prose prose-neutral dark:prose-invert max-w-none">
      <div>
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Documentation</h1>
      </div>

      <div>
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight mt-8 mb-4">
          Introduction
        </h2>
        <p className="leading-7 text-muted-foreground">
          Guardian is a powerful CLI tool that ingests your codebase and allows you to ask questions about it using Retrieval-Augmented Generation (RAG). All data processing happens locally by default, ensuring your code stays private.
        </p>
      </div>

      <div>
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight mt-8 mb-4">
          Installation
        </h2>
        <Tabs tabs={installTabs} />
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground">
          Verify installation:
        </p>
        <CodeBlock code="guardian --version" language="bash" />
      </div>

      <div>
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight mt-8 mb-4">
          Quick Start
        </h2>
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground">
          1. Initialize Guardian in your project:
        </p>
        <CodeBlock code="guardian init" language="bash" />
        
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground">
          2. Ingest your codebase:
        </p>
        <CodeBlock code="guardian ingest" language="bash" />
        
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground">
          3. Ask questions about your code:
        </p>
        <CodeBlock code='guardian ask "How does authentication work?"' language="bash" />
      </div>

      <div>
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight mt-8 mb-4">
          Configuration
        </h2>
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground">
          Guardian requires an LLM to generate answers. You can use either Groq (cloud - recommended) or Ollama (local).
        </p>
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground">
          <strong>For Groq (Recommended):</strong>
        </p>
        <ol className="list-decimal list-inside space-y-2 my-4 text-muted-foreground">
          <li>Get an API key from <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="underline">console.groq.com</a></li>
          <li>Set the environment variable: <code className="px-1.5 py-0.5 bg-muted rounded text-sm">export GROQ_API_KEY="gsk_your_key"</code></li>
          <li>Run <code className="px-1.5 py-0.5 bg-muted rounded text-sm">guardian init</code> (defaults to Groq)</li>
        </ol>
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground">
          <strong>For Ollama (Local):</strong>
        </p>
        <ol className="list-decimal list-inside space-y-2 my-4 text-muted-foreground">
          <li>Install Ollama from <a href="https://ollama.com" target="_blank" rel="noopener noreferrer" className="underline">ollama.com</a></li>
          <li>Start Ollama: <code className="px-1.5 py-0.5 bg-muted rounded text-sm">ollama serve</code></li>
          <li>Pull a model: <code className="px-1.5 py-0.5 bg-muted rounded text-sm">ollama pull qwen2.5:3b-instruct</code></li>
          <li>Update <code className="px-1.5 py-0.5 bg-muted rounded text-sm">.guardianrc.json</code> to set <code className="px-1.5 py-0.5 bg-muted rounded text-sm">"modelProvider": "local"</code></li>
        </ol>
      </div>

      <div>
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight mt-8 mb-4">
          Commands
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mt-6 mb-2">init</h3>
            <p className="leading-7 text-muted-foreground">
              Creates a <code className="px-1.5 py-0.5 bg-muted rounded text-sm">.guardianrc.json</code> configuration file with default settings.
            </p>
            <CodeBlock code="guardian init" language="bash" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mt-6 mb-2">ingest</h3>
            <p className="leading-7 text-muted-foreground">
              Indexes your codebase and generates embeddings for semantic search.
            </p>
            <CodeBlock code="guardian ingest" language="bash" />
            <p className="leading-7 [&:not(:first-child)]:mt-4 text-sm text-muted-foreground">
              Use <code className="px-1.5 py-0.5 bg-muted rounded text-sm">--force</code> to rebuild from scratch.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mt-6 mb-2">ask</h3>
            <p className="leading-7 text-muted-foreground">
              Ask natural language questions about your codebase.
            </p>
            <CodeBlock code='guardian ask "How does user authentication work?"' language="bash" />
            <p className="leading-7 [&:not(:first-child)]:mt-4 text-sm text-muted-foreground">
              Use <code className="px-1.5 py-0.5 bg-muted rounded text-sm">--session &lt;name&gt;</code> to maintain conversation context.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight mt-8 mb-4">
          Learn More
        </h2>
        <p className="leading-7 text-muted-foreground">
          For more detailed documentation, visit the <a href="https://github.com/sahitya-chandra/guardian" target="_blank" rel="noopener noreferrer" className="underline">GitHub repository</a>.
        </p>
      </div>
    </div>
  );
}
