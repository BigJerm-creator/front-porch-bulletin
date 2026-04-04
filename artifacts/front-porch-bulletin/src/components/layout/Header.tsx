import { Link } from "wouter";
import { formatDate } from "@/lib/format";

export function Header() {
  const today = new Date().toISOString();

  return (
    <header className="mb-4">
      <div className="flex justify-between items-center border-b border-foreground pb-2 mb-2 text-xs font-mono uppercase tracking-widest">
        <span>Vol. CXXIV... No. 42</span>
        <span>{formatDate(today)}</span>
        <span>Fifty Cents</span>
      </div>
      <div className="text-center py-6">
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
          <h1 className="font-headline text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight text-foreground" style={{ transform: "scaleY(1.1)" }}>
            The Front Porch Bulletin
          </h1>
        </Link>
        <p className="mt-4 font-headline text-lg italic tracking-widest text-foreground/80">
          "All the news that's fit to print, and then some."
        </p>
      </div>
    </header>
  );
}
