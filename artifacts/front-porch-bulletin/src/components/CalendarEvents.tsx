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

  const firstDay   = new Date(viewYear, viewMonth - 1, 1).getDay();
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
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-headline text-xs uppercase tracking-widest font-bold">
          Community Calendar
        </h2>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-2 border-b border-foreground pb-2">
        <button
          onClick={prevMonth}
          className="font-mono text-xs uppercase tracking-widest text-foreground/60 hover:text-foreground transition-colors"
          aria-label="Previous month"
        >
          &#8249; {viewMonth === 1 ? MONTHS[11] : MONTHS[viewMonth - 2]}
        </button>
        <span className="font-headline font-bold text-lg uppercase tracking-wider">
          {MONTHS[viewMonth - 1]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="font-mono text-xs uppercase tracking-widest text-foreground/60 hover:text-foreground transition-colors"
          aria-label="Next month"
        >
          {viewMonth === 12 ? MONTHS[0] : MONTHS[viewMonth]} &#8250;
        </button>
      </div>

      {/* Calendar grid */}
      <div className="border border-foreground">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 border-b border-foreground bg-foreground/5">
          {DAYS.map((d) => (
            <div
              key={d}
              className="font-mono text-[10px] uppercase tracking-widest text-foreground/70 text-center py-1.5 border-r last:border-r-0 border-foreground"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {loading ? (
          <div className="py-12 text-center font-mono text-xs text-foreground/40 uppercase tracking-widest">Loading...</div>
        ) : (
          weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 border-b last:border-b-0 border-foreground" style={{ minHeight: "90px" }}>
              {week.map((day, di) => {
                if (!day) {
                  return (
                    <div
                      key={di}
                      className="border-r last:border-r-0 border-foreground bg-foreground/[0.03]"
                    />
                  );
                }
                const dateStr = `${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const dayEvents = eventsByDay[dateStr] ?? [];
                const isToday   = dateStr === todayStr;

                return (
                  <div
                    key={di}
                    className={`border-r last:border-r-0 border-foreground p-1.5 flex flex-col ${isToday ? "bg-foreground/[0.07]" : ""}`}
                  >
                    {/* Day number */}
                    <div className={`font-mono text-[11px] text-right leading-none mb-1.5 ${isToday ? "font-bold underline underline-offset-2" : "text-foreground/60"}`}>
                      {day}
                    </div>
                    {/* Events */}
                    <div className="space-y-1 flex-1">
                      {dayEvents.map((ev) => (
                        <div key={ev.id} className="bg-foreground text-background px-1 py-0.5">
                          <div className="font-serif text-[9px] font-bold leading-tight truncate">{ev.title}</div>
                          {ev.eventTime && (
                            <div className="font-mono text-[8px] text-background/70 leading-tight">{formatTime(ev.eventTime)}</div>
                          )}
                          {ev.location && (
                            <div className="font-mono text-[8px] text-background/70 leading-tight truncate">{ev.location}</div>
                          )}
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

      {!loading && events.length === 0 && (
        <p className="mt-2 text-xs font-serif text-foreground/50 italic">No events scheduled this month.</p>
      )}
    </div>
  );
}
