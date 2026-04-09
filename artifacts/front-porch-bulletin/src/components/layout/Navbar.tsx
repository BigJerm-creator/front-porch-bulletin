import { Link, useLocation } from "wouter";

export function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="border-t-2 border-b-2 border-foreground py-2 mb-8">
      <ul className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 font-headline font-bold text-sm tracking-widest uppercase">
        <li>
          <Link href="/" className={`hover:underline hover:text-primary transition-colors ${location === "/" ? "underline text-primary" : ""}`}>
            Front Page
          </Link>
        </li>
        <li>
          <Link href="/about" className={`hover:underline hover:text-primary transition-colors ${location === "/about" ? "underline text-primary" : ""}`}>
            About
          </Link>
        </li>
        <li>
          <Link href="/categories" className={`hover:underline hover:text-primary transition-colors ${location === "/categories" ? "underline text-primary" : ""}`}>
            Letters to the Editor
          </Link>
        </li>
        <li className="ml-auto">
          <Link href="/submit" className={`hover:underline transition-colors ${location === "/submit" ? "bg-foreground text-background" : "bg-primary text-background"} px-3 py-1`}>
            Make a Submission
          </Link>
        </li>
      </ul>
    </nav>
  );
}
