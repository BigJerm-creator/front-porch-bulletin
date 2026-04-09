import { Link, useLocation } from "wouter";

export function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="border-t-2 border-b-2 border-foreground py-2 mb-8">
      <div className="flex items-center overflow-x-auto gap-x-5 gap-y-2 font-headline font-bold text-sm tracking-widest uppercase scrollbar-none">
        <Link
          href="/"
          className={`whitespace-nowrap hover:underline hover:text-primary transition-colors shrink-0 ${location === "/" ? "underline text-primary" : ""}`}
        >
          Front Page
        </Link>
        <Link
          href="/about"
          className={`whitespace-nowrap hover:underline hover:text-primary transition-colors shrink-0 ${location === "/about" ? "underline text-primary" : ""}`}
        >
          About
        </Link>
        <Link
          href="/submit"
          className={`whitespace-nowrap hover:underline hover:text-primary transition-colors shrink-0 ${location === "/submit" ? "underline text-primary" : ""}`}
        >
          Letter to the Editor
        </Link>
        <Link
          href="/newsletter"
          className={`whitespace-nowrap shrink-0 ml-auto transition-colors ${location === "/newsletter" ? "bg-foreground text-background" : "bg-primary text-background"} px-3 py-1`}
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
}
