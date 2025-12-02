import Link from "next/link";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="text-lg font-semibold hover:opacity-80 transition-opacity">
            Guardian
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/docs" className="text-foreground font-medium">
              Docs
            </Link>
          </nav>
        </div>
      </header>

      {/* Simple Content Area */}
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 md:px-6 py-12">
          {children}
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-center gap-8 text-sm">
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
          </div>
        </div>
      </footer>
    </div>
  );
}
