import { useState } from "react";
import { Layout } from "@/components/layout/Layout";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const PRESET_AMOUNTS = [5, 10, 25, 50, 100];

export default function Donate() {
  const [selected, setSelected] = useState<number | null>(25);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const amount = custom ? parseFloat(custom) : selected;

  async function handleDonate() {
    if (!amount || amount < 1) {
      setError("Please enter an amount of at least $1.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/donate/create-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-lg mx-auto py-8">
        <div className="font-mono text-xs uppercase tracking-widest border-b-2 border-foreground pb-1 mb-6">
          Support the Bulletin
        </div>
        <h1 className="font-headline font-bold text-4xl leading-tight mb-3">
          Keep Community News Alive
        </h1>
        <p className="font-serif text-base leading-relaxed text-foreground/80 mb-8">
          The Front Porch Bulletin is a labor of love for Haskell, Oklahoma.
          Your donation helps cover printing, postage, and the time it takes to
          tell stories that matter to our community. Every dollar goes directly
          toward keeping your neighbors informed.
        </p>

        <div className="border-t-2 border-foreground pt-6 mb-6">
          <p className="font-mono text-xs uppercase tracking-widest mb-4">Choose an amount</p>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {PRESET_AMOUNTS.map(amt => (
              <button
                key={amt}
                onClick={() => { setSelected(amt); setCustom(""); setError(""); }}
                className={`font-headline font-bold text-sm py-2 border-2 transition-colors ${
                  selected === amt && !custom
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/40 hover:border-foreground"
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-foreground/60">Other:</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-foreground/60">$</span>
              <input
                type="number"
                min="1"
                max="1000"
                placeholder="Enter amount"
                value={custom}
                onChange={e => { setCustom(e.target.value); setSelected(null); setError(""); }}
                className="w-full pl-7 pr-3 py-2 border-2 border-foreground/40 bg-background font-mono text-sm focus:outline-none focus:border-foreground"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="font-mono text-xs text-red-700 mb-4">{error}</p>
        )}

        <button
          onClick={handleDonate}
          disabled={loading || !amount || amount < 1}
          className="w-full bg-foreground text-background font-headline font-bold text-lg py-3 hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {loading ? "Redirecting…" : `Donate${amount && amount >= 1 ? ` $${Number(amount).toFixed(2)}` : ""}`}
        </button>

        <p className="font-mono text-[10px] text-foreground/40 text-center mt-4">
          Secure payment via Stripe. No account required.
        </p>
      </div>
    </Layout>
  );
}
