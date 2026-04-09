import { Link, useLocation } from "wouter";

export function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="border-t-2 border-b-2 border-foreground py-2 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 sm:gap-y-0 sm:gap-x-5 font-headline font-bold text-sm tracking-widest uppercase">
        <Link
          href="/"
          className={`hover:underline hover:text-primary transition-colors ${location === "/" ? "underline text-primary" : ""}`}
        >
          Front Page
        </Link>
        <Link
          href="/about"
          className={`hover:underline hover:text-primary transition-colors ${location === "/about" ? "underline text-primary" : ""}`}
        >
          About
        </Link>
        <Link
          href="/submit"
          className={`hover:underline hover:text-primary transition-colors ${location === "/submit" ? "underline text-primary" : ""}`}
        >
          Letter to the Editor
        </Link>
        <Link
          href="/newsletter"
          className={`sm:ml-auto transition-colors text-center ${location === "/newsletter" ? "bg-foreground text-background" : "bg-primary text-background"} px-3 py-1`}
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
}
