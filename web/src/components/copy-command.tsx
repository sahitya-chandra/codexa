"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyCommand() {
  const [copied, setCopied] = useState(false);
  const command = "npm install -g guardian-cli";

  const onCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 p-1 pl-4 bg-muted/50 rounded-lg border border-border/50 hover:border-border/100 transition-colors">
      <code className="text-sm font-mono text-muted-foreground">
        {command}
      </code>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-background/50"
        onClick={onCopy}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        <span className="sr-only">Copy command</span>
      </Button>
    </div>
  );
}
