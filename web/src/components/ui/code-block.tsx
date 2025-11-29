"use client";

import * as React from "react";
import { Highlight, themes, type Language } from "prism-react-renderer";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  code: string;
  language?: Language;
  filename?: string;
  className?: string;
}

export function CodeBlock({
  code,
  language = "bash",
  filename,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative overflow-hidden rounded-lg border bg-zinc-950 dark:bg-zinc-900", className)}>
      {filename && (
        <div className="flex items-center justify-between border-b bg-zinc-900 px-4 py-2 text-xs text-zinc-400">
          <span>{filename}</span>
        </div>
      )}
      <div className="relative">
        <Highlight
          theme={themes.vsDark}
          code={code}
          language={language}
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={cn("overflow-x-auto p-4 text-sm", className)}
              style={{ ...style, background: "transparent" }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-2 top-2 h-8 w-8 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          onClick={copyToClipboard}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="sr-only">Copy code</span>
        </Button>
      </div>
    </div>
  );
}
