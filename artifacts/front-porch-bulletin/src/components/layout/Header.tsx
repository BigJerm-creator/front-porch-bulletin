import { Link } from "wouter";
import { Show } from "@clerk/react";
import { formatDate } from "@/lib/format";
import logoSrc from "@assets/The_1775669458963.png";

export function Header() {
  const today = new Date().toISOString();

  return (
    <header className="mb-4">
      <div className="flex justify-between items-center border-b border-foreground pb-2 mb-2 text-xs font-mono uppercase tracking-widest">
        <div className="print:hidden shrink-0">
          <Show when="signed-in">
            <Link href="/admin" className="border border-foreground px-2 py-0.5 hover:bg-foreground hover:text-background transition-colors whitespace-nowrap" data-testid="link-admin">
              Admin
            </Link>
          </Show>
          <Show when="signed-out">
            <Link href="/sign-in" className="border border-foreground px-2 py-0.5 hover:bg-foreground hover:text-background transition-colors whitespace-nowrap" data-testid="link-staff-login">
              Staff Login
            </Link>
          </Show>
        </div>
        <span className="whitespace-nowrap px-2 text-center">{formatDate(today)}</span>
        <span className="whitespace-nowrap shrink-0 hidden sm:inline">Page 1</span>
      </div>
      <div className="text-center py-2 md:py-4">
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
          <img
            src={logoSrc}
            alt="The Front Porch Bulletin — Where Community Comes to Gather"
            className="max-w-full mx-auto"
            style={{ maxHeight: "400px", width: "100%", objectFit: "contain", mixBlendMode: "multiply" }}
            data-testid="header-logo"
          />
        </Link>
      </div>
    </header>
  );
}
