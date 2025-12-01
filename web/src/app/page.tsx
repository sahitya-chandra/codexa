import Link from "next/link";
import { ArrowRight, Zap, Shield, Globe, Cpu, Terminal as TerminalIcon, LayoutTemplate } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/feature-card";
import { CodeBlock } from "@/components/ui/code-block";
import { Terminal, TerminalLine, TerminalOutput } from "@/components/ui/terminal";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 md:pt-24 lg:pt-32 pb-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
              <div className="flex flex-col justify-center space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    The Ultimate CLI for Modern Developers
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Build, deploy, and manage your applications with speed and precision. 
                    Designed for efficiency, built for scale.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="https://github.com/sahitya-chandra/RepoMind" target="_blank">
                      View on GitHub
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="mx-auto w-full max-w-[500px] lg:max-w-none">
                <Terminal>
                  <TerminalLine delay={0.5}>guardian init my-project</TerminalLine>
                  <TerminalOutput delay={1.5}>
                    Initializing project structure...<br />
                    Installing dependencies...<br />
                    <span className="text-green-400">✔ Project created successfully!</span>
                  </TerminalOutput>
                  <TerminalLine delay={3}>guardian deploy</TerminalLine>
                  <TerminalOutput delay={4}>
                    Building application...<br />
                    Optimizing assets...<br />
                    Deploying to edge...<br />
                    <span className="text-green-400">✔ Deployed to https://guardian-cli.app</span>
                  </TerminalOutput>
                </Terminal>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 lg:py-32 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Everything you need to ship faster
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our CLI tool is packed with features designed to streamline your workflow and boost productivity.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                title="Lightning Fast"
                description="Built with Rust for incredible performance and near-instant startup times."
                icon={<Zap className="h-5 w-5" />}
              />
              <FeatureCard
                title="Secure by Default"
                description="Enterprise-grade security features built-in, keeping your code safe."
                icon={<Shield className="h-5 w-5" />}
              />
              <FeatureCard
                title="Global Edge Network"
                description="Deploy your applications to a global edge network in seconds."
                icon={<Globe className="h-5 w-5" />}
              />
              <FeatureCard
                title="Smart Automation"
                description="Automate repetitive tasks with our intelligent workflow engine."
                icon={<Cpu className="h-5 w-5" />}
              />
              <FeatureCard
                title="Interactive Mode"
                description="A rich interactive mode that guides you through complex configurations."
                icon={<TerminalIcon className="h-5 w-5" />}
              />
              <FeatureCard
                title="Template System"
                description="Start new projects quickly with our extensive library of templates."
                icon={<LayoutTemplate className="h-5 w-5" />}
              />
            </div>
          </div>
        </section>

        {/* Installation Section */}
        <section id="installation" className="py-16 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary w-fit">
                  Installation
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Get up and running in seconds
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Install the CLI globally using npm, yarn, or pnpm. It works on macOS, Windows, and Linux.
                </p>
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">NPM</h3>
                    <CodeBlock code="npm install -g guardian-cli" language="bash" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Yarn</h3>
                    <CodeBlock code="yarn global add guardian-cli" language="bash" />
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-10 blur-3xl rounded-full" />
                <div className="relative rounded-xl border bg-background p-8 shadow-lg">
                  <h3 className="text-xl font-bold mb-4">Quick Start</h3>
                  <ol className="space-y-4 list-decimal list-inside text-muted-foreground">
                    <li>
                      <span className="text-foreground font-medium">Install the CLI</span> using your preferred package manager.
                    </li>
                    <li>
                      <span className="text-foreground font-medium">Initialize a project</span> by running <code className="bg-muted px-1 py-0.5 rounded text-sm">guardian init</code>.
                    </li>
                    <li>
                      <span className="text-foreground font-medium">Configure your settings</span> in the generated config file.
                    </li>
                    <li>
                      <span className="text-foreground font-medium">Deploy your app</span> with a single command: <code className="bg-muted px-1 py-0.5 rounded text-sm">guardian deploy</code>.
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl mb-4">
              Ready to supercharge your workflow?
            </h2>
            <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl mb-8">
              Join thousands of developers who are building the future with GuardianCLI.
            </p>
            <Button size="lg" variant="secondary" className="gap-2">
              Get Started Now <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
