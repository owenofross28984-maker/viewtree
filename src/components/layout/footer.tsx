import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-8 px-4 border-t border-border">
      <div className="max-w-viewtree mx-auto">
        <p className="text-sm text-muted-foreground mb-4">
          Made by one person who got tired of Twitter threads.
        </p>
        <div className="flex gap-4 text-sm">
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
