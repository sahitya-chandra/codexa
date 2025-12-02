import { Badge } from "@/components/ui/badge";
import { CopyCommand } from "@/components/copy-command";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 relative">
      {/* Top Bar */}
      <div className="absolute top-0 w-full flex justify-center items-center p-6">
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-normal">
          v0.1.0 is out!
        </Badge>
      </div>

      {/* Hero Section */}
      <main className="flex flex-col items-center text-center gap-8 max-w-3xl mx-auto z-10">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Ask questions about <br />
            your codebase
          </h1>
        </div>

        <div className="flex flex-col items-center gap-6">
          <CopyCommand />
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 w-full p-6 flex justify-center gap-8 text-sm">
        <Link 
          href="/docs" 
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          [docs]
        </Link>
        <Link 
          href="https://github.com/sahitya-chandra/guardian" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          [github]
        </Link>
        <Link 
          href="https://www.npmjs.com/package/guardian" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          [npm]
        </Link>
      </footer>
    </div>
  );
}
