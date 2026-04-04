import { Link, useLocation } from "wouter";
import { useListCategories } from "@workspace/api-client-react";

export function Navbar() {
  const [location] = useLocation();
  const { data: categoriesData } = useListCategories();

  return (
    <nav className="border-t-2 border-b-2 border-foreground py-2 mb-8">
      <ul className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 font-headline font-bold text-sm tracking-widest uppercase">
        <li>
          <Link href="/" className={`hover:underline hover:text-primary transition-colors ${location === "/" ? "underline text-primary" : ""}`}>
            Front Page
          </Link>
        </li>
        <li>
          <Link href="/articles" className={`hover:underline hover:text-primary transition-colors ${location === "/articles" ? "underline text-primary" : ""}`}>
            All Stories
          </Link>
        </li>
        {categoriesData?.categories.slice(0, 5).map((category) => (
          <li key={category.id} className="hidden sm:block">
            <Link href={`/categories`} className="hover:underline hover:text-primary transition-colors">
              {category.name}
            </Link>
          </li>
        ))}
        <li>
          <Link href="/about" className={`hover:underline hover:text-primary transition-colors ${location === "/about" ? "underline text-primary" : ""}`}>
            About
          </Link>
        </li>
        <li className="ml-auto">
          <Link href="/submit" className={`hover:underline transition-colors ${location === "/submit" ? "bg-foreground text-background" : "bg-primary text-background"} px-3 py-1`}>
            Submit a Story
          </Link>
        </li>
      </ul>
    </nav>
  );
}
