import { Link } from "wouter";
import { Show } from "@clerk/react";
import { formatDate } from "@/lib/format";
import logoSrc from "@assets/The_1775669458963.png";

export function Header() {
  const today = new Date().toISOString();

  return (
    <header className="mb-4">
      <div className="flex justify-between items-center border-b border-foreground pb-2 mb-2 text-xs font-mono uppercase tracking-widest">
        <span>Vol. CXXIV... No. 42</span>
        <span>{formatDate(today)}</span>
        <Show when="signed-in">
          <Link href="/admin" className="border border-foreground px-2 py-0.5 hover:bg-foreground hover:text-background transition-colors" data-testid="link-admin">
            Admin
          </Link>
        </Show>
        <Show when="signed-out">
          <Link href="/sign-in" className="border border-foreground px-2 py-0.5 hover:bg-foreground hover:text-background transition-colors" data-testid="link-staff-login">
            Staff Login
          </Link>
        </Show>
      </div>
      <div className="text-center py-4">
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
          <img
            src={logoSrc}
            alt="The Front Porch Bulletin — Where Community Comes to Gather"
            className="max-w-full mx-auto"
            style={{ maxHeight: "180px", mixBlendMode: "multiply" }}
            data-testid="header-logo"
          />
        </Link>
      </div>
    </header>
  );
}
