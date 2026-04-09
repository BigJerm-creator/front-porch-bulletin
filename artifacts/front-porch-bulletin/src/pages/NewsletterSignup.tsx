import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function NewsletterSignup() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setPending(true);
    try {
      const res = await fetch(`${BASE}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to subscribe");
      if (data.alreadySubscribed) {
        toast({ title: "Already on the list", description: "That address is already subscribed to the Bulletin." });
      } else {
        setDone(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast({ variant: "destructive", title: "Couldn't sign you up", description: message });
    } finally {
      setPending(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <header className="text-center mb-12 border-b-4 border-double border-foreground pb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-foreground/50 mb-3">The Front Porch Bulletin</p>
          <h1 className="font-headline text-4xl md:text-5xl font-bold uppercase tracking-widest mb-4">
            Stay in the Know
          </h1>
          <p className="font-serif italic text-lg text-foreground/80 leading-relaxed">
            Sign up to receive The Front Porch Bulletin straight to your inbox whenever a new edition is published.
          </p>
        </header>

        {done ? (
          <div className="border-4 border-foreground bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-10 text-center relative">
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-foreground"></div>
            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-foreground"></div>
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-foreground"></div>
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-foreground"></div>
            <p className="font-headline text-3xl font-bold uppercase tracking-widest mb-4">You're on the list!</p>
            <p className="font-serif italic text-lg text-foreground/70 leading-relaxed">
              Welcome to the Bulletin family, {name}. We'll be in touch when the next edition goes to press.
            </p>
            <div className="mt-8 border-t-2 border-foreground/20 pt-6">
              <p className="font-mono text-xs uppercase tracking-widest text-foreground/40">
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
        ) : (
          <div className="border-4 border-foreground bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 relative">
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-foreground"></div>
            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-foreground"></div>
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-foreground"></div>
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-foreground"></div>

            <form onSubmit={handleSubmit} className="space-y-6 font-serif">
              <div>
                <label className="block font-headline font-bold uppercase tracking-widest text-sm mb-2">
                  Your Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Jane Doe"
                  className="rounded-none border-2 border-foreground focus-visible:ring-0 focus-visible:border-primary font-serif text-base bg-[#f5f0e8]"
                />
              </div>

              <div>
                <label className="block font-headline font-bold uppercase tracking-widest text-sm mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="jane@example.com"
                  className="rounded-none border-2 border-foreground focus-visible:ring-0 focus-visible:border-primary font-mono text-sm bg-[#f5f0e8]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={pending || !name.trim() || !email.trim()}
                  className="w-full bg-foreground text-background font-headline font-bold uppercase tracking-widest py-4 text-lg shadow-[4px_4px_0px_0px_rgba(139,90,43,0.4)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[4px_4px_0px_0px_rgba(139,90,43,0.4)]"
                >
                  {pending ? "Signing You Up..." : "Sign Up for the Bulletin"}
                </button>
              </div>

              <p className="text-xs font-mono text-center text-foreground/40 uppercase tracking-widest pt-2">
                No spam. Just your community, in print.
              </p>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
