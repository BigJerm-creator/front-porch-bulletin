import { Header } from "./Header";
import { Navbar } from "./Navbar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto selection:bg-primary/30 selection:text-foreground">
      <Header />
      <Navbar />
      <main>
        {children}
      </main>
      <footer className="mt-16 pt-8 border-t-4 border-double border-foreground text-center font-mono text-xs uppercase tracking-widest opacity-70">
        <p>© {new Date().getFullYear()} The Front Porch Bulletin. Printed locally.</p>
      </footer>
    </div>
  );
}
