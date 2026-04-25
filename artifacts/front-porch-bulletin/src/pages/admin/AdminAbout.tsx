import { useState, useEffect } from "react";
import { Save, PlusCircle, Trash2, CheckCircle } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type StaffMember = { role: string; name: string };

type AboutData = {
  foundingYear: string;
  body: string;
  editorialStaff: string;
  officeLocation: string;
};

export default function AdminAbout() {
  const [foundingYear, setFoundingYear]     = useState("1924");
  const [body, setBody]                     = useState("");
  const [staff, setStaff]                   = useState<StaffMember[]>([]);
  const [officeLocation, setOfficeLocation] = useState("Main Street");
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [saved, setSaved]                   = useState(false);

  useEffect(() => {
    fetch(`${BASE}/api/about`)
      .then(r => r.json())
      .then((d: AboutData) => {
        setFoundingYear(d.foundingYear ?? "1924");
        setBody(d.body ?? "");
        setOfficeLocation(d.officeLocation ?? "Main Street");
        try {
          const parsed = JSON.parse(d.editorialStaff ?? "[]");
          setStaff(Array.isArray(parsed) ? parsed : []);
        } catch {
          setStaff([]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`${BASE}/api/about`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          foundingYear,
          body,
          editorialStaff: JSON.stringify(staff),
          officeLocation,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  function addStaffRow() {
    setStaff(s => [...s, { role: "", name: "" }]);
  }

  function updateStaff(i: number, field: keyof StaffMember, value: string) {
    setStaff(s => s.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  }

  function removeStaff(i: number) {
    setStaff(s => s.filter((_, idx) => idx !== i));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-mono text-sm uppercase tracking-widest text-foreground/40 animate-pulse">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-3xl">
      {/* Header */}
      <header className="border-b-4 border-foreground pb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-headline font-bold uppercase tracking-widest mb-1">About Page</h1>
          <p className="text-lg italic font-serif text-muted-foreground">Edit the public-facing About the Bulletin page.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 h-12 border-4 border-foreground bg-primary text-primary-foreground font-bold uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
        >
          {saved
            ? <><CheckCircle className="h-4 w-4" /> Saved!</>
            : <><Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Changes"}</>
          }
        </button>
      </header>

      {/* Founding Year + Office Location */}
      <div className="border-4 border-foreground bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="bg-[#f5f0e8] border-b-2 border-foreground px-6 py-3">
          <h2 className="font-headline font-bold uppercase tracking-widest text-base">Publication Details</h2>
        </div>
        <div className="px-6 py-5 grid grid-cols-2 gap-5">
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-foreground/50 mb-1.5">Founding Year</label>
            <input
              value={foundingYear}
              onChange={e => setFoundingYear(e.target.value)}
              className="w-full border-2 border-foreground px-3 py-2 font-serif text-base bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="1924"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-foreground/50 mb-1.5">Office Location</label>
            <input
              value={officeLocation}
              onChange={e => setOfficeLocation(e.target.value)}
              className="w-full border-2 border-foreground px-3 py-2 font-serif text-base bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Main Street"
            />
          </div>
        </div>
      </div>

      {/* Body Text */}
      <div className="border-4 border-foreground bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="bg-[#f5f0e8] border-b-2 border-foreground px-6 py-3">
          <h2 className="font-headline font-bold uppercase tracking-widest text-base">Body Text</h2>
          <p className="font-mono text-[10px] uppercase tracking-wide text-foreground/40 mt-0.5">Separate paragraphs with a blank line</p>
        </div>
        <div className="px-6 py-5">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={12}
            className="w-full border-2 border-foreground px-3 py-2 font-serif text-base leading-relaxed bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            placeholder="Write about the history and mission of The Front Porch Bulletin…"
          />
        </div>
      </div>

      {/* Editorial Staff */}
      <div className="border-4 border-foreground bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="bg-[#f5f0e8] border-b-2 border-foreground px-6 py-3 flex items-center justify-between">
          <div>
            <h2 className="font-headline font-bold uppercase tracking-widest text-base">Editorial Staff</h2>
            <p className="font-mono text-[10px] uppercase tracking-wide text-foreground/40 mt-0.5">Listed in the staff box on the About page</p>
          </div>
          <button
            onClick={addStaffRow}
            className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-foreground font-mono text-xs uppercase tracking-widest font-bold hover:bg-foreground hover:text-background transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5" /> Add Row
          </button>
        </div>
        <div className="px-6 py-5 space-y-3">
          {staff.length === 0 && (
            <p className="font-serif italic text-sm text-foreground/40">No staff members listed. Click "Add Row" to begin.</p>
          )}
          {staff.map((member, i) => (
            <div key={i} className="flex gap-3 items-center">
              <input
                value={member.role}
                onChange={e => updateStaff(i, "role", e.target.value)}
                className="w-44 border-2 border-foreground px-3 py-2 font-mono text-xs uppercase tracking-wide bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Role (e.g. Editor in Chief)"
              />
              <input
                value={member.name}
                onChange={e => updateStaff(i, "name", e.target.value)}
                className="flex-1 border-2 border-foreground px-3 py-2 font-serif text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Full Name"
              />
              <button
                onClick={() => removeStaff(i)}
                className="p-2 border-2 border-foreground/30 hover:border-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save button (bottom) */}
      <div className="flex justify-end pb-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 h-12 border-4 border-foreground bg-primary text-primary-foreground font-bold uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
        >
          {saved
            ? <><CheckCircle className="h-4 w-4" /> Saved!</>
            : <><Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Changes"}</>
          }
        </button>
      </div>
    </div>
  );
}
