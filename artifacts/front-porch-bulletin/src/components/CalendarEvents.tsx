import { useEffect, useState } from "react";

type CalendarEvent = {
  id: number;
  title: string;
  eventDate: string;
  eventTime?: string | null;
  location?: string | null;
  description?: string | null;
};

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function formatEventDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "p.m." : "a.m.";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour} ${ampm}` : `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function CalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/calendar-events`)
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <div className="mt-8 border-t-2 border-foreground pt-4">
      <h2 className="font-headline text-xs uppercase tracking-widest font-bold border-b border-foreground pb-1 mb-4">
        Community Calendar
      </h2>

      {events.length === 0 ? (
        <p className="text-sm font-serif text-foreground/60 italic">No upcoming events scheduled.</p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex gap-3">
              <div className="shrink-0 border-2 border-foreground text-center w-12 leading-none py-1">
                <div className="font-headline font-bold text-lg leading-none">
                  {event.eventDate.split("-")[2].replace(/^0/, "")}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-foreground/70">
                  {new Date(event.eventDate + "T12:00:00").toLocaleDateString("en-US", { month: "short" })}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-headline font-bold text-sm leading-tight">{event.title}</p>
                <p className="font-mono text-xs text-foreground/60 uppercase tracking-wide mt-0.5">
                  {event.eventTime ? formatTime(event.eventTime) : ""}
                  {event.eventTime && event.location ? " · " : ""}
                  {event.location ?? ""}
                </p>
                {event.description && (
                  <p className="font-serif text-xs text-foreground/70 mt-0.5 leading-snug line-clamp-2">{event.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
