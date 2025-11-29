"use client";
import { CodeBlock } from "@/components/ui/code-block";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs } from "@/components/ui/tabs";

export default function DocsPage() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#features") {
      router.replace("/docs");
    }
  }, [router]);

  const installTabs = [
    {
      label: "npm",
      content: (
        <>
          <p className="leading-7 [&:not(:first-child)]:mt-6">To get started, install the CLI globally:</p>
          <CodeBlock code="npm install -g agent-cli" language="bash" />
        </>
      ),
    },
    {
      label: "pnpm",
      content: (
        <>
          <p className="leading-7 [&:not(:first-child)]:mt-6">Or with pnpm:</p>
          <CodeBlock code="pnpm add -g agent-cli" language="bash" />
        </>
      ),
    },
    {
      label: "bun",
      content: (
        <>
          <p className="leading-7 [&:not(:first-child)]:mt-6">Or with bun:</p>
          <CodeBlock code="bun add -g agent-cli" language="bash" />
        </>
      ),
    },
    {
      label: "yarn",
      content: (
        <>
          <p className="leading-7 [&:not(:first-child)]:mt-6">Or with Yarn:</p>
          <CodeBlock code="yarn global add agent-cli" language="bash" />
        </>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Documentation</h1>
        <Button asChild variant="ghost" size="sm">
          <a href="https://github.com/sahitya-chandra/agent-cli" target="_blank" rel="noopener noreferrer">
            <Star className="mr-2 h-4 w-4" /> Give a star
          </a>
        </Button>
      </div>
      <div>
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Introduction</h1>
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-lg text-muted-foreground">
          Welcome to the AgentCLI documentation. This guide will help you get started with building and deploying applications using our command-line interface.
        </p>
      </div>
      <div className="space-y-4">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          What is AgentCLI?
        </h2>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          AgentCLI is a powerful tool designed to streamline your development workflow. It helps you initialize projects, manage dependencies, and deploy to the cloud with ease.
        </p>
      </div>
      <div className="space-y-4">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
          Quick Start
        </h2>
        <Tabs tabs={installTabs} />
        <p className="leading-7 [&:not(:first-child)]:mt-6">Then, initialize a new project:</p>
        <CodeBlock code="agent init my-new-project" language="bash" />
      </div>
    </div>
  );
}
