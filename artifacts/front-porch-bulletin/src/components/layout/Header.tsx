import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Show } from "@clerk/react";
import logoSrc from "@assets/The_(1)_1775854639167.png";

const EMAIL = "TheFrontPorchBulletin@gmail.com";
const BASE   = import.meta.env.BASE_URL.replace(/\/$/, "");

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export function Header() {
  const [issueNum,  setIssueNum]  = useState("01");
  const [issueDate, setIssueDate] = useState("May 2026");

  useEffect(() => {
    fetch(`${BASE}/api/issue-settings`)
      .then(r => r.json())
      .then(data => {
        setIssueNum(data.issueNumber ?? "01");
        const yr = data.issueYear ?? 2026;
        const mo = data.issueMonth ?? 5;
        setIssueDate(`${MONTH_NAMES[mo - 1]} ${yr}`);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="mb-6">
      {/* ── Issue / page bar ── */}
      <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest border-t-2 border-b border-foreground py-1 mb-0">
        <span className="shrink-0 whitespace-nowrap">Issue {issueNum} / {issueDate}</span>
        <span className="flex-1 border-t border-foreground mt-0.5" />
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
        <span className="flex-1 border-t border-foreground mt-0.5" />
        <span className="shrink-0 whitespace-nowrap">Page 01</span>
      </div>

      {/* ── Masthead logo ── */}
      <div className="py-3 md:py-5 text-center border-b border-foreground">
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
          <img
            src={logoSrc}
            alt="The Front Porch Bulletin"
            className="mx-auto"
            style={{ maxHeight: "220px", width: "100%", objectFit: "contain" }}
            data-testid="header-logo"
          />
        </Link>
      </div>

      {/* ── Email ── */}
      <div className="text-center font-mono text-xs uppercase tracking-widest py-1.5 border-b border-foreground/30">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-3.5 h-3.5 rounded-full border border-foreground text-[8px] leading-none flex items-center justify-center">✉</span>
          {EMAIL}
        </span>
      </div>
    </header>
  );
}
