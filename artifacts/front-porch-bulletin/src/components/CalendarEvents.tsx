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

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(":").map(Number);
  const ampm = h >= 12 ? "p.m." : "a.m.";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour} ${ampm}` : `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function CalendarEvents() {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const [events,    setEvents]    = useState<CalendarEvent[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE}/api/calendar-events/month/${viewYear}/${viewMonth}`)
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .finally(() => setLoading(false));
  }, [viewYear, viewMonth]);

  function prevMonth() {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1); }
    else setViewMonth(m => m + 1);
  }

  const firstDay  = new Date(viewYear, viewMonth - 1, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const eventsByDay: Record<string, CalendarEvent[]> = {};
  events.forEach((ev) => {
    if (!eventsByDay[ev.eventDate]) eventsByDay[ev.eventDate] = [];
    eventsByDay[ev.eventDate].push(ev);
  });

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className="mt-8 border-t-2 border-foreground pt-4">
      <h2 className="font-headline text-xs uppercase tracking-widest font-bold border-b border-foreground pb-1 mb-3">
        Community Calendar
      </h2>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={prevMonth}
          className="font-mono text-xs uppercase tracking-widest text-foreground/60 hover:text-foreground transition-colors px-1"
          aria-label="Previous month"
        >
          &#8249; {viewMonth === 1 ? MONTHS[11] : MONTHS[viewMonth - 2]}
        </button>
        <span className="font-headline font-bold text-base uppercase tracking-wider">
          {MONTHS[viewMonth - 1]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="font-mono text-xs uppercase tracking-widest text-foreground/60 hover:text-foreground transition-colors px-1"
          aria-label="Next month"
        >
          {viewMonth === 12 ? MONTHS[0] : MONTHS[viewMonth]} &#8250;
        </button>
      </div>

      {/* Calendar grid */}
      <div className="border border-foreground">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 border-b border-foreground">
          {DAYS.map((d) => (
            <div
              key={d}
              className="font-mono text-[9px] uppercase tracking-widest text-foreground/60 text-center py-1 border-r last:border-r-0 border-foreground"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {loading ? (
          <div className="py-8 text-center font-mono text-xs text-foreground/40 uppercase tracking-widest">Loading...</div>
        ) : (
          weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 border-b last:border-b-0 border-foreground">
              {week.map((day, di) => {
                if (!day) {
                  return (
                    <div
                      key={di}
                      className="min-h-[56px] border-r last:border-r-0 border-foreground bg-foreground/[0.03]"
                    />
                  );
                }
                const dateStr = `${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayEvents = eventsByDay[dateStr] ?? [];
                const isToday   = dateStr === todayStr;

                return (
                  <div
                    key={di}
                    className={`min-h-[56px] border-r last:border-r-0 border-foreground p-1 ${isToday ? "bg-foreground/[0.06]" : ""}`}
                  >
                    <div className={`font-mono text-[10px] text-right leading-none mb-1 ${isToday ? "font-bold underline underline-offset-2" : "text-foreground/70"}`}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.map((ev) => (
                        <div
                          key={ev.id}
                          title={[ev.title, ev.eventTime ? formatTime(ev.eventTime) : "", ev.location ?? ""].filter(Boolean).join(" · ")}
                          className="font-serif text-[9px] leading-tight bg-foreground text-background px-0.5 truncate cursor-default"
                        >
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Event legend below grid */}
      {!loading && events.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {events.map((ev) => {
            const [y, m, d] = ev.eventDate.split("-").map(Number);
            const label = new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
            return (
              <div key={ev.id} className="flex gap-2 items-baseline">
                <span className="font-mono text-[9px] uppercase tracking-wide text-foreground/50 shrink-0 w-20">{label}</span>
                <span className="font-serif text-xs leading-snug">
                  <span className="font-bold">{ev.title}</span>
                  {(ev.eventTime || ev.location) && (
                    <span className="text-foreground/60">
                      {" — "}
                      {ev.eventTime ? formatTime(ev.eventTime) : ""}
                      {ev.eventTime && ev.location ? ", " : ""}
                      {ev.location ?? ""}
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {!loading && events.length === 0 && (
        <p className="mt-2 text-xs font-serif text-foreground/50 italic">No events scheduled this month.</p>
      )}
    </div>
  );
}
