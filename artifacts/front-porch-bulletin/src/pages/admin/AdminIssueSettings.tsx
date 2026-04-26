import { useState, useEffect } from "react";
import { Save, CheckCircle } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const MONTH_OPTIONS = [
  { value: 1,  label: "January" },
  { value: 2,  label: "February" },
  { value: 3,  label: "March" },
  { value: 4,  label: "April" },
  { value: 5,  label: "May" },
  { value: 6,  label: "June" },
  { value: 7,  label: "July" },
  { value: 8,  label: "August" },
  { value: 9,  label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export default function AdminIssueSettings() {
  const [issueNumber, setIssueNumber] = useState("01");
  const [issueYear,   setIssueYear]   = useState(2026);
  const [issueMonth,  setIssueMonth]  = useState(5);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    fetch(`${BASE}/api/issue-settings`)
      .then(r => r.json())
      .then(d => {
        setIssueNumber(d.issueNumber ?? "01");
        setIssueYear(d.issueYear   ?? 2026);
        setIssueMonth(d.issueMonth ?? 5);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch(`${BASE}/api/issue-settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ issueNumber, issueYear, issueMonth }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="font-mono text-sm uppercase tracking-widest text-foreground/40 animate-pulse">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-10">
      <header className="border-b-4 border-foreground pb-6">
        <h1 className="text-4xl font-headline font-bold uppercase tracking-widest mb-1">Issue Settings</h1>
        <p className="font-serif text-foreground/60 italic">Set the current issue number, month, and year shown on the printed edition and header.</p>
      </header>

      <div className="space-y-6">
        {/* Issue Number */}
        <div>
          <label className="block font-mono text-xs uppercase tracking-widest text-foreground/60 mb-2">Issue Number</label>
          <input
            type="text"
            value={issueNumber}
            onChange={e => setIssueNumber(e.target.value)}
            placeholder="01"
            className="w-full border-2 border-foreground px-4 py-2 font-mono text-lg bg-white focus:outline-none focus:ring-2 focus:ring-foreground"
          />
          <p className="text-xs font-mono text-foreground/40 mt-1">Displayed as "Issue 01" — use leading zeros to match your numbering style.</p>
        </div>

        {/* Month */}
        <div>
          <label className="block font-mono text-xs uppercase tracking-widest text-foreground/60 mb-2">Issue Month</label>
          <select
            value={issueMonth}
            onChange={e => setIssueMonth(Number(e.target.value))}
            className="w-full border-2 border-foreground px-4 py-2 font-mono text-base bg-white focus:outline-none focus:ring-2 focus:ring-foreground"
          >
            {MONTH_OPTIONS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div>
          <label className="block font-mono text-xs uppercase tracking-widest text-foreground/60 mb-2">Issue Year</label>
          <input
            type="number"
            value={issueYear}
            onChange={e => setIssueYear(Number(e.target.value))}
            min={2000}
            max={2100}
            className="w-full border-2 border-foreground px-4 py-2 font-mono text-lg bg-white focus:outline-none focus:ring-2 focus:ring-foreground"
          />
        </div>

        {/* Preview */}
        <div className="bg-[#f5f0e8] border-2 border-foreground px-5 py-4">
          <p className="font-mono text-xs uppercase tracking-widest text-foreground/50 mb-1">Preview</p>
          <p className="font-mono text-sm uppercase tracking-widest">
            Issue {issueNumber} / {MONTH_OPTIONS.find(m => m.value === issueMonth)?.label} {issueYear}
          </p>
        </div>

        {error && (
          <p className="text-sm font-mono text-red-600 border border-red-300 bg-red-50 px-4 py-2">{error}</p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 h-11 border-4 border-foreground bg-primary text-primary-foreground font-bold uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saved ? (
            <><CheckCircle className="h-4 w-4" /> Saved!</>
          ) : saving ? (
            "Saving…"
          ) : (
            <><Save className="h-4 w-4" /> Save Settings</>
          )}
        </button>
      </div>
    </div>
  );
}
