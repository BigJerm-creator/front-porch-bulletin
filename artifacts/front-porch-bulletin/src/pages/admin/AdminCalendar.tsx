import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Pencil, Trash2, X, Save, CalendarDays } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type CalendarEvent = {
  id: number;
  title: string;
  eventDate: string;
  eventTime?: string | null;
  location?: string | null;
  description?: string | null;
};

const emptyForm = { title: "", eventDate: "", eventTime: "", location: "", description: "" };

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "p.m." : "a.m.";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour} ${ampm}` : `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatDisplayDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function EventDialog({ event, onClose, onSaved }: {
  event: CalendarEvent | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = event === null;
  const { toast } = useToast();
  const [form, setForm] = useState(
    isNew ? emptyForm : {
      title: event.title,
      eventDate: event.eventDate,
      eventTime: event.eventTime ?? "",
      location: event.location ?? "",
      description: event.description ?? "",
    }
  );
  const [saving, setSaving] = useState(false);
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [repeatWeeks, setRepeatWeeks] = useState(4);

  function addWeeks(dateStr: string, weeks: number): string {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + weeks * 7);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.eventDate) {
      toast({ title: "Title and date are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = (dateStr: string) => ({
        title: form.title.trim(),
        eventDate: dateStr,
        eventTime: form.eventTime.trim() || null,
        location: form.location.trim() || null,
        description: form.description.trim() || null,
      });

      if (!isNew) {
        // Save the edit on the existing event
        const res = await fetch(`${BASE}/api/calendar-events/${event.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload(form.eventDate)),
        });
        if (!res.ok) throw new Error(await res.text());
        // If repeat is on, also create new events for the additional weeks
        if (repeatWeekly) {
          for (let i = 1; i <= repeatWeeks; i++) {
            const r = await fetch(`${BASE}/api/calendar-events`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload(addWeeks(form.eventDate, i))),
            });
            if (!r.ok) throw new Error(await r.text());
          }
        }
      } else {
        const weeks = repeatWeekly ? repeatWeeks : 0;
        for (let i = 0; i <= weeks; i++) {
          const dateStr = i === 0 ? form.eventDate : addWeeks(form.eventDate, i);
          const res = await fetch(`${BASE}/api/calendar-events`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload(dateStr)),
          });
          if (!res.ok) throw new Error(await res.text());
        }
      }

      toast({
        title: repeatWeekly
          ? isNew
            ? `Added ${repeatWeeks + 1} recurring events`
            : `Event updated + ${repeatWeeks} additional week${repeatWeeks !== 1 ? "s" : ""} added`
          : isNew
          ? "Event added to calendar"
          : "Event updated",
      });
      onSaved();
      onClose();
    } catch {
      toast({ title: "Failed to save event", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md p-6 space-y-4">
        <div className="flex justify-between items-center border-b-2 border-foreground pb-3">
          <h2 className="font-headline font-bold text-2xl uppercase tracking-widest">
            {isNew ? "Add Event" : "Edit Event"}
          </h2>
          <button onClick={onClose} className="hover:opacity-70 transition-opacity">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="font-mono text-xs uppercase tracking-widest block mb-1">Event Title *</label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="border-2 border-foreground font-serif"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-xs uppercase tracking-widest block mb-1">Date *</label>
              <Input
                type="date"
                value={form.eventDate}
                onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
                className="border-2 border-foreground font-mono"
              />
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-widest block mb-1">Time</label>
              <Input
                type="time"
                value={form.eventTime}
                onChange={(e) => setForm((f) => ({ ...f, eventTime: e.target.value }))}
                className="border-2 border-foreground font-mono"
              />
            </div>
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-widest block mb-1">Location</label>
            <Input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="border-2 border-foreground font-serif"
              placeholder="e.g. City Hall, Room 3"
            />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-widest block mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full border-2 border-foreground bg-background px-3 py-2 font-serif text-sm resize-none focus:outline-none focus:ring-1 focus:ring-foreground"
              placeholder="Optional details…"
            />
          </div>

          <div className="border-t-2 border-foreground/20 pt-3 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={repeatWeekly}
                  onChange={(e) => setRepeatWeekly(e.target.checked)}
                  className="h-4 w-4 border-2 border-foreground accent-foreground"
                />
                <span className="font-mono text-xs uppercase tracking-widest">Repeat weekly</span>
              </label>
              {repeatWeekly && (
                <div className="flex items-center gap-3 pl-6">
                  <label className="font-mono text-xs uppercase tracking-widest whitespace-nowrap">
                    Repeat for
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={52}
                    value={repeatWeeks}
                    onChange={(e) => setRepeatWeeks(Math.max(1, Math.min(52, Number(e.target.value))))}
                    className="border-2 border-foreground font-mono w-20 text-center"
                  />
                  <span className="font-mono text-xs uppercase tracking-widest whitespace-nowrap">
                    additional week{repeatWeeks !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button onClick={handleSave} disabled={saving} className="flex-1 font-headline font-bold uppercase tracking-widest">
            <Save className="h-4 w-4 mr-2" />
            {saving
              ? "Saving…"
              : isNew
              ? repeatWeekly
                ? `Add ${repeatWeeks + 1} Events`
                : "Add to Calendar"
              : repeatWeekly
              ? `Save + Add ${repeatWeeks} More`
              : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={onClose} className="border-2 border-foreground font-headline uppercase tracking-widest">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCalendar() {
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/calendar-events/all`);
      const d = await res.json();
      setEvents(d.events ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (ev: CalendarEvent) => { setEditing(ev); setDialogOpen(true); };
  const closeDialog = () => setDialogOpen(false);

  const handleDelete = async (ev: CalendarEvent) => {
    try {
      const res = await fetch(`${BASE}/api/calendar-events/${ev.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: "Event removed" });
      fetchEvents();
    } catch {
      toast({ title: "Failed to delete event", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      {dialogOpen && (
        <EventDialog event={editing} onClose={closeDialog} onSaved={fetchEvents} />
      )}

      <header className="border-b-4 border-foreground pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl sm:text-5xl font-headline font-bold uppercase tracking-widest mb-2">Calendar</h1>
          <p className="text-xl text-muted-foreground italic font-serif">Upcoming community events.</p>
        </div>
        <Button onClick={openNew} className="font-headline font-bold uppercase tracking-widest shrink-0">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </header>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : events.length === 0 ? (
        <div className="border-4 border-foreground bg-white p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CalendarDays className="h-12 w-12 mx-auto mb-4 text-foreground/20" />
          <p className="font-serif italic text-muted-foreground text-lg">No events on the calendar yet.</p>
          <p className="font-mono text-xs uppercase tracking-widest text-foreground/40 mt-2">Add the first event above.</p>
        </div>
      ) : (
        <div className="border-4 border-foreground bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] divide-y-2 divide-foreground/10">
          {events.map((ev) => (
            <div key={ev.id} className="flex items-start gap-4 p-4 hover:bg-[#f5f0e8]/50 transition-colors group">
              <div className="shrink-0 border-2 border-foreground text-center w-14 leading-none py-1.5">
                <div className="font-headline font-bold text-2xl leading-none">
                  {ev.eventDate.split("-")[2].replace(/^0/, "")}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-foreground/70">
                  {new Date(ev.eventDate + "T12:00:00").toLocaleDateString("en-US", { month: "short" })}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-foreground/50">
                  {new Date(ev.eventDate + "T12:00:00").toLocaleDateString("en-US", { year: "numeric" })}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-headline font-bold text-lg leading-tight">{ev.title}</p>
                <p className="font-mono text-xs text-foreground/60 uppercase tracking-wide mt-0.5">
                  {ev.eventTime ? `${formatTime(ev.eventTime)} · ` : ""}
                  {formatDisplayDate(ev.eventDate)}
                </p>
                {ev.location && (
                  <p className="font-serif text-sm text-foreground/70 mt-0.5">{ev.location}</p>
                )}
                {ev.description && (
                  <p className="font-serif text-sm text-foreground/60 mt-1 leading-snug">{ev.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => openEdit(ev)}
                  className="p-1.5 hover:bg-foreground/10 rounded transition-colors"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="p-1.5 hover:bg-destructive/10 text-destructive rounded transition-colors" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-4 border-foreground">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-headline font-bold uppercase tracking-widest">
                        Remove this event?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-serif">
                        "{ev.title}" on {formatDisplayDate(ev.eventDate)} will be permanently removed from the calendar.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="font-headline uppercase tracking-widest border-2 border-foreground">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(ev)}
                        className="font-headline uppercase tracking-widest bg-destructive text-white hover:bg-destructive/80"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
