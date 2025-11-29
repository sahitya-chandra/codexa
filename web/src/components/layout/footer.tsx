import Link from "next/link";
import { Terminal } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Terminal className="h-6 w-6" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by{" "}
            <Link
              href="https://github.com/sahitya-chandra"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Sahitya Chandra
            </Link>
            . The source code is available on{" "}
            <Link
              href="https://github.com/sahitya-chandra/RepoMind"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </Link>
            .
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} AgentCLI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
