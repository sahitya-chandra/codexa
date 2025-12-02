import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CopyCommand } from "@/components/copy-command";
import { Github, Book, Package } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[300px] bg-blue-500/5 rounded-full blur-3xl -z-10" />

      {/* Top Bar */}
      <div className="absolute top-0 w-full flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-normal">
            v1.0.0 is out!
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="#" className="hover:text-foreground transition-colors flex items-center gap-1">
            <span className="font-mono">12.5k</span> downloads
          </Link>
          <Link href="#" className="hover:text-foreground transition-colors flex items-center gap-1">
            <span className="font-mono">842</span> stars
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <main className="flex flex-col items-center text-center gap-8 max-w-3xl mx-auto z-10">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            The Ultimate CLI for <br />
            Modern Developers
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Build, deploy, and manage your applications with speed and precision.
            GuardianCLI is designed for efficiency and built for scale.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <CopyCommand />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Open Source</span>
            <Separator orientation="vertical" className="h-4" />
            <span>MIT License</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 w-full p-6 flex justify-center gap-8 text-muted-foreground">
        <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
          <Link href="#">
            <Book className="h-4 w-4 mr-2" />
            Docs
          </Link>
        </Button>
        <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
          <Link href="https://github.com/sahitya-chandra/Guardian">
            <Github className="h-4 w-4 mr-2" />
            GitHub
          </Link>
        </Button>
        <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
          <Link href="#">
            <Package className="h-4 w-4 mr-2" />
            NPM
          </Link>
        </Button>
      </footer>
    </div>
  );
}
