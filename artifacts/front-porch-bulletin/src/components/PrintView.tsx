import { useEffect, useState } from "react";
import logoSrc from "@assets/The_(1)_1775854639167.png";
import {
  useGetFeaturedArticles,
  useGetSpotlight, getGetSpotlightQueryKey,
  useGetBusinessSpotlight, getGetBusinessSpotlightQueryKey,
  useGetGroupSpotlight, getGetGroupSpotlightQueryKey,
  useListChurches, getListChurchesQueryKey,
} from "@workspace/api-client-react";
import { formatDate, formatDateline } from "@/lib/format";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/* ─── shared style tokens ─────────────────────────────────────── */
const FONT_SERIF   = "'Libre Baskerville', Georgia, serif";
const FONT_HEADLINE = "'Old Standard TT', 'Times New Roman', serif";
const FONT_MONO    = "'Space Mono', 'Courier New', monospace";
const INK          = "#1a1a1a";
const INK_MUTED    = "#555";
const RULE         = "1px solid #1a1a1a";
const RULE_LIGHT   = "0.5px solid rgba(0,0,0,0.25)";

const sectionHeading = {
  fontFamily: FONT_MONO,
  fontSize: "6.5pt",
  textTransform: "uppercase" as const,
  letterSpacing: "0.14em",
  fontWeight: "bold",
  color: INK,
  borderBottom: RULE,
  paddingBottom: "2pt",
  marginBottom: "5pt",
};

type CalendarEvent = {
  id: number; title: string; eventDate: string;
  eventTime?: string | null; location?: string | null;
};


function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "p.m." : "a.m.";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour} ${ampm}` : `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

/* ─── PrintView ───────────────────────────────────────────────── */
export function PrintView() {
  const today = new Date().toISOString();
  const { data: featured }          = useGetFeaturedArticles();
  const { data: spotlight }         = useGetSpotlight({ query: { queryKey: getGetSpotlightQueryKey() } });
  const { data: businessSpotlight } = useGetBusinessSpotlight({ query: { queryKey: getGetBusinessSpotlightQueryKey() } });
  const { data: groupSpotlight }    = useGetGroupSpotlight({ query: { queryKey: getGetGroupSpotlightQueryKey() } });
  const { data: churchData }        = useListChurches({ query: { queryKey: getListChurchesQueryKey() } });
  const [calEvents, setCalEvents] = useState<CalendarEvent[]>([]);

  const PRINT_YEAR  = 2026;
  const PRINT_MONTH = 5; // May

  useEffect(() => {
    fetch(`${BASE}/api/calendar-events/month/${PRINT_YEAR}/${PRINT_MONTH}`)
      .then(r => r.json())
      .then(d => setCalEvents(d.events ?? []));
  }, []);

  const headline   = featured?.headline;
  const frontPage  = featured?.frontPage ?? (headline ? [headline] : []);
  const churches   = churchData?.churches ?? [];

  return (
    <div id="print-view" style={{ fontFamily: FONT_SERIF, color: INK, fontSize: "9.5pt", padding: "5px" }}>

      {/* ══════════════════ PAGE 1 ══════════════════ */}

      {/* Full-width masthead */}
      <div style={{ textAlign: "center", marginBottom: "6pt" }}>
        <img
          src={logoSrc}
          alt="The Front Porch Bulletin"
          style={{ width: "100%", maxHeight: "160pt", objectFit: "contain", display: "block", margin: "0 auto" }}
        />
        <div style={{
          borderTop: "2.5px solid " + INK,
          borderBottom: "2.5px solid " + INK,
          padding: "2pt 0",
          marginTop: "3pt",
          fontFamily: FONT_MONO,
          fontSize: "6.5pt",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          display: "flex",
          justifyContent: "space-between",
        }}>
          <span>Haskell, Oklahoma</span>
          <span>{formatDate(today)}</span>
          <span>Page 1</span>
        </div>
      </div>

      {/* ── Front Page Articles — adaptive layout ── */}
      <div style={{ marginBottom: "10pt" }}>
        {frontPage.length === 0 ? (
          <p style={{ fontFamily: FONT_SERIF, fontStyle: "italic", color: INK_MUTED }}>No featured story this week.</p>

        ) : frontPage.length === 1 ? (
          /* ── Single article: full-width hero ── */
          <article>
            <h1 style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "26pt", lineHeight: 1.05, margin: "0 0 4pt", letterSpacing: "-0.01em", textAlign: "center" }}>
              {frontPage[0].title}
            </h1>
            {frontPage[0].subtitle && (
              <p style={{ fontFamily: FONT_HEADLINE, fontStyle: "italic", fontSize: "12pt", lineHeight: 1.2, margin: "0 0 4pt", color: "#333", textAlign: "center" }}>
                {frontPage[0].subtitle}
              </p>
            )}
            <p style={{ fontFamily: FONT_MONO, fontSize: "6.5pt", textTransform: "uppercase", letterSpacing: "0.1em", color: INK_MUTED, margin: "0 0 6pt", borderBottom: RULE_LIGHT, borderTop: RULE_LIGHT, padding: "3pt 0", textAlign: "center" }}>
              By {frontPage[0].author} &nbsp;&middot;&nbsp; {formatDateline(frontPage[0].publishedAt)}
            </p>
            <p style={{ fontSize: "9.5pt", lineHeight: 1.5, margin: 0, textAlign: "justify" }}>
              <span style={{ fontFamily: FONT_MONO, fontWeight: "bold", fontSize: "6.5pt", textTransform: "uppercase", letterSpacing: "0.1em", marginRight: "3pt" }}>
                {formatDateline(frontPage[0].publishedAt)}—
              </span>
              {frontPage[0].content}
            </p>
          </article>

        ) : frontPage.length === 2 ? (
          /* ── Two articles: dominant left + secondary right ── */
          <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "0", alignItems: "flex-start" }}>
            {/* Lead — left */}
            <div style={{ paddingRight: "10pt", borderRight: RULE }}>
              <h1 style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "20pt", lineHeight: 1.05, margin: "0 0 3pt", letterSpacing: "-0.01em" }}>
                {frontPage[0].title}
              </h1>
              {frontPage[0].subtitle && (
                <p style={{ fontFamily: FONT_HEADLINE, fontStyle: "italic", fontSize: "10pt", lineHeight: 1.2, margin: "0 0 3pt", color: "#333" }}>
                  {frontPage[0].subtitle}
                </p>
              )}
              <p style={{ fontFamily: FONT_MONO, fontSize: "6pt", textTransform: "uppercase", letterSpacing: "0.1em", color: INK_MUTED, margin: "0 0 5pt", borderBottom: RULE_LIGHT, padding: "2pt 0" }}>
                By {frontPage[0].author} &nbsp;&middot;&nbsp; {formatDateline(frontPage[0].publishedAt)}
              </p>
              <p style={{ fontSize: "9pt", lineHeight: 1.5, margin: 0, textAlign: "justify" }}>
                <span style={{ fontFamily: FONT_MONO, fontWeight: "bold", fontSize: "6pt", textTransform: "uppercase", letterSpacing: "0.1em", marginRight: "3pt" }}>
                  {formatDateline(frontPage[0].publishedAt)}—
                </span>
                {frontPage[0].content.split('\n\n')[0]}
              </p>
            </div>
            {/* Secondary — right */}
            <div style={{ paddingLeft: "10pt" }}>
              <h2 style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "14pt", lineHeight: 1.1, margin: "0 0 3pt" }}>
                {frontPage[1].title}
              </h2>
              {frontPage[1].subtitle && (
                <p style={{ fontFamily: FONT_HEADLINE, fontStyle: "italic", fontSize: "8.5pt", lineHeight: 1.2, margin: "0 0 3pt", color: "#333" }}>
                  {frontPage[1].subtitle}
                </p>
              )}
              <p style={{ fontFamily: FONT_MONO, fontSize: "5.5pt", textTransform: "uppercase", letterSpacing: "0.1em", color: INK_MUTED, margin: "0 0 5pt", borderBottom: RULE_LIGHT, padding: "2pt 0" }}>
                By {frontPage[1].author} &nbsp;&middot;&nbsp; {formatDateline(frontPage[1].publishedAt)}
              </p>
              <p style={{ fontSize: "8.5pt", lineHeight: 1.45, margin: 0, textAlign: "justify" }}>
                {frontPage[1].content.split('\n\n')[0]}
              </p>
            </div>
          </div>

        ) : (
          /* ── Three or more: hero on top, columns below ── */
          <div>
            {/* Lead — full width */}
            <div style={{ paddingBottom: "8pt", marginBottom: "8pt", borderBottom: RULE_LIGHT }}>
              <h1 style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "22pt", lineHeight: 1.05, margin: "0 0 3pt", letterSpacing: "-0.01em", textAlign: "center" }}>
                {frontPage[0].title}
              </h1>
              {frontPage[0].subtitle && (
                <p style={{ fontFamily: FONT_HEADLINE, fontStyle: "italic", fontSize: "11pt", lineHeight: 1.2, margin: "0 0 3pt", color: "#333", textAlign: "center" }}>
                  {frontPage[0].subtitle}
                </p>
              )}
              <p style={{ fontFamily: FONT_MONO, fontSize: "6pt", textTransform: "uppercase", letterSpacing: "0.1em", color: INK_MUTED, margin: "0 0 5pt", borderBottom: RULE_LIGHT, borderTop: RULE_LIGHT, padding: "2pt 0", textAlign: "center" }}>
                By {frontPage[0].author} &nbsp;&middot;&nbsp; {formatDateline(frontPage[0].publishedAt)}
              </p>
              <p style={{ fontSize: "9pt", lineHeight: 1.5, margin: 0, textAlign: "justify" }}>
                <span style={{ fontFamily: FONT_MONO, fontWeight: "bold", fontSize: "6pt", textTransform: "uppercase", letterSpacing: "0.1em", marginRight: "3pt" }}>
                  {formatDateline(frontPage[0].publishedAt)}—
                </span>
                {frontPage[0].content.split('\n\n')[0]}
              </p>
            </div>
            {/* Remaining — equal columns */}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(frontPage.length - 1, 3)}, 1fr)`, gap: "0" }}>
              {frontPage.slice(1, 4).map((art, i) => (
                <div key={art.id} style={{ paddingLeft: i > 0 ? "10pt" : 0, paddingRight: i < Math.min(frontPage.length - 2, 2) ? "10pt" : 0, borderLeft: i > 0 ? RULE : "none" }}>
                  <h2 style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "12pt", lineHeight: 1.1, margin: "0 0 2pt" }}>
                    {art.title}
                  </h2>
                  {art.subtitle && (
                    <p style={{ fontFamily: FONT_HEADLINE, fontStyle: "italic", fontSize: "8pt", lineHeight: 1.2, margin: "0 0 2pt", color: "#333" }}>
                      {art.subtitle}
                    </p>
                  )}
                  <p style={{ fontFamily: FONT_MONO, fontSize: "5.5pt", textTransform: "uppercase", letterSpacing: "0.1em", color: INK_MUTED, margin: "0 0 4pt", borderBottom: RULE_LIGHT, padding: "1.5pt 0" }}>
                    By {art.author} &nbsp;&middot;&nbsp; {formatDateline(art.publishedAt)}
                  </p>
                  <p style={{ fontSize: "8pt", lineHeight: 1.4, margin: 0, textAlign: "justify" }}>
                    {art.content.split('\n\n')[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Three spotlights side by side — page 1, under headline ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14pt", alignItems: "flex-start" }}>

        {/* Student Spotlight */}
        {spotlight && (
          <div style={{ borderRight: RULE, paddingRight: "12pt" }}>
            <div style={sectionHeading}>Student Spotlight</div>
            <div style={{ width: "100%", aspectRatio: "4/3", overflow: "hidden", border: `1pt solid ${INK}`, background: "#d6cfc4", marginBottom: "4pt" }}>
              {spotlight.photoUrl ? (
                <img src={spotlight.photoUrl} alt={spotlight.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: "6pt", color: INK_MUTED, textTransform: "uppercase" }}>Photo</span>
                </div>
              )}
            </div>
            {spotlight.photoCredit && (
              <p style={{ fontFamily: FONT_MONO, fontSize: "5.5pt", fontStyle: "italic", color: INK_MUTED, textAlign: "right", margin: "0 0 3pt" }}>
                Picture Credit — {spotlight.photoCredit}
              </p>
            )}
            <p style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "11pt", lineHeight: 1.1, margin: "0 0 1.5pt" }}>{spotlight.name}</p>
            <p style={{ fontFamily: FONT_MONO, fontSize: "6.5pt", textTransform: "uppercase", letterSpacing: "0.1em", color: INK_MUTED, margin: "0 0 3pt" }}>
              {spotlight.school} &bull; {spotlight.grade}
            </p>
            <p style={{ fontSize: "8.5pt", lineHeight: 1.4, margin: 0, color: "#333" }}>{spotlight.description}</p>
          </div>
        )}

        {/* Business Spotlight */}
        {businessSpotlight && (
          <div style={{ borderRight: RULE, paddingRight: "12pt" }}>
            <div style={sectionHeading}>Business Spotlight</div>
            <div style={{ width: "100%", aspectRatio: "4/3", overflow: "hidden", border: `1pt solid ${INK}`, background: "#d6cfc4", marginBottom: "4pt" }}>
              {businessSpotlight.photoUrl ? (
                <img src={businessSpotlight.photoUrl} alt={businessSpotlight.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: "6pt", color: INK_MUTED, textTransform: "uppercase" }}>Photo</span>
                </div>
              )}
            </div>
            {businessSpotlight.photoCredit && (
              <p style={{ fontFamily: FONT_MONO, fontSize: "5.5pt", fontStyle: "italic", color: INK_MUTED, textAlign: "right", margin: "0 0 3pt" }}>
                Picture Credit — {businessSpotlight.photoCredit}
              </p>
            )}
            <p style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "11pt", lineHeight: 1.1, margin: "0 0 1.5pt" }}>{businessSpotlight.name}</p>
            <p style={{ fontFamily: FONT_MONO, fontSize: "6.5pt", textTransform: "uppercase", letterSpacing: "0.1em", color: INK_MUTED, margin: "0 0 3pt" }}>
              {businessSpotlight.businessType}
            </p>
            <p style={{ fontSize: "8.5pt", lineHeight: 1.4, margin: 0, color: "#333" }}>{businessSpotlight.description}</p>
          </div>
        )}

        {/* Group Spotlight */}
        {groupSpotlight && (
          <div>
            <div style={sectionHeading}>Group Spotlight</div>
            <div style={{ width: "100%", aspectRatio: "4/3", overflow: "hidden", border: `1pt solid ${INK}`, background: "#d6cfc4", marginBottom: "4pt" }}>
              {groupSpotlight.photoUrl ? (
                <img src={groupSpotlight.photoUrl} alt={groupSpotlight.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: "6pt", color: INK_MUTED, textTransform: "uppercase" }}>Photo</span>
                </div>
              )}
            </div>
            {groupSpotlight.photoCredit && (
              <p style={{ fontFamily: FONT_MONO, fontSize: "5.5pt", fontStyle: "italic", color: INK_MUTED, textAlign: "right", margin: "0 0 3pt" }}>
                Picture Credit — {groupSpotlight.photoCredit}
              </p>
            )}
            <p style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "11pt", lineHeight: 1.1, margin: "0 0 1.5pt" }}>{groupSpotlight.name}</p>
            <p style={{ fontFamily: FONT_MONO, fontSize: "6.5pt", textTransform: "uppercase", letterSpacing: "0.1em", color: INK_MUTED, margin: "0 0 3pt" }}>
              {groupSpotlight.groupType}
            </p>
            <p style={{ fontSize: "8.5pt", lineHeight: 1.4, margin: 0, color: "#333" }}>{groupSpotlight.description}</p>
          </div>
        )}
      </div>

      {/* ══════════════════ PAGE BREAK ══════════════════ */}
      <div style={{ pageBreakBefore: "always", breakBefore: "page" }} />

      {/* ══════════════════ PAGE 2 ══════════════════ */}

      {/* Page 2 masthead — slim */}
      <div style={{
        borderBottom: "2.5px solid " + INK,
        borderTop: "2.5px solid " + INK,
        padding: "2.5pt 0",
        marginBottom: "8pt",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "9pt", letterSpacing: "0.02em" }}>
          The Front Porch Bulletin
        </span>
        <span style={{ fontFamily: FONT_MONO, fontSize: "6pt", textTransform: "uppercase", letterSpacing: "0.12em", color: INK_MUTED }}>
          Community Pages &nbsp;&middot;&nbsp; {formatDate(today)}
        </span>
        <span style={{ fontFamily: FONT_MONO, fontSize: "6pt", textTransform: "uppercase", letterSpacing: "0.12em", color: INK_MUTED }}>
          Page 2
        </span>
      </div>

      {/* ── Church Directory ── */}
      {churches.length > 0 && (
        <div style={{ marginTop: "6pt", marginBottom: "6pt" }}>
          <div style={sectionHeading}>Church Directory</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "3pt 8pt" }}>
            {churches.map(church => (
              <div key={church.id} style={{ borderLeft: "1.5px solid " + INK, paddingLeft: "4pt", breakInside: "avoid" }}>
                <p style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "7pt", lineHeight: 1.1, margin: "0 0 0.5pt" }}>{church.name}</p>
                {church.pastor && (
                  <p style={{ fontFamily: FONT_MONO, fontSize: "5pt", textTransform: "uppercase", letterSpacing: "0.06em", color: INK_MUTED, margin: "0 0 0.5pt" }}>{church.pastor}</p>
                )}
                {church.serviceTimes && (
                  <p style={{ fontSize: "6pt", lineHeight: 1.2, margin: "0 0 0.5pt", color: "#333" }}>{church.serviceTimes}</p>
                )}
                {church.phone && (
                  <p style={{ fontFamily: FONT_MONO, fontSize: "5pt", color: INK_MUTED, margin: 0 }}>{church.phone}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Community Calendar ── */}
      <div>

        {/* Community Calendar — monthly grid */}
        {(() => {
          const yr        = PRINT_YEAR;
          const mo        = PRINT_MONTH - 1; // 0-indexed
          const firstDow  = new Date(yr, mo, 1).getDay();
          const daysInMo  = new Date(yr, mo + 1, 0).getDate();
          const monthName = new Date(yr, mo, 1).toLocaleDateString("en-US", { month: "long" });
          const DAY_HEADS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

          const eventsByDay: Record<string, CalendarEvent[]> = {};
          calEvents.forEach(ev => {
            if (!eventsByDay[ev.eventDate]) eventsByDay[ev.eventDate] = [];
            eventsByDay[ev.eventDate].push(ev);
          });

          const cells: (number | null)[] = [
            ...Array(firstDow).fill(null),
            ...Array.from({ length: daysInMo }, (_, i) => i + 1),
          ];
          while (cells.length % 7 !== 0) cells.push(null);
          const weeks: (number | null)[][] = [];
          for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

          return (
            <div>
              <div style={sectionHeading}>Community Calendar</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: "7pt", textTransform: "uppercase", letterSpacing: "0.12em", textAlign: "center", marginBottom: "3pt", fontWeight: "bold" }}>
                {monthName} {yr}
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid " + INK }}>
                    {DAY_HEADS.map(d => (
                      <th key={d} style={{ fontFamily: FONT_MONO, fontSize: "6pt", textTransform: "uppercase", letterSpacing: "0.1em", color: INK_MUTED, textAlign: "center", padding: "1.5pt 0", fontWeight: "normal", width: "14.28%" }}>
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((week, wi) => (
                    <tr key={wi} style={{ height: "52pt" }}>
                      {week.map((day, di) => {
                        const baseTd: React.CSSProperties = {
                          border: "0.5px solid " + INK,
                          padding: "2.5pt",
                          verticalAlign: "top",
                          width: "14.28%",
                          overflow: "hidden",
                        };
                        if (!day) return (
                          <td key={di} style={{ ...baseTd, background: "rgba(0,0,0,0.03)" }} />
                        );
                        const moStr   = String(mo + 1).padStart(2, "0");
                        const dayStr  = String(day).padStart(2, "0");
                        const dateKey = `${yr}-${moStr}-${dayStr}`;
                        const evs     = eventsByDay[dateKey] ?? [];
                        return (
                          <td key={di} style={baseTd}>
                            <div style={{ fontFamily: FONT_MONO, fontSize: "6pt", textAlign: "right", color: INK_MUTED, marginBottom: "1.5pt", lineHeight: 1 }}>{day}</div>
                            {evs.map(ev => (
                              <div key={ev.id} style={{ borderLeft: "1.5px solid " + INK, paddingLeft: "2pt", marginBottom: "2pt", breakInside: "avoid" }}>
                                <div style={{ fontFamily: FONT_SERIF, fontSize: "6pt", fontWeight: "bold", lineHeight: 1.2, color: INK }}>{ev.title}</div>
                                {ev.eventTime && <div style={{ fontFamily: FONT_MONO, fontSize: "5pt", color: INK, lineHeight: 1.2 }}>{formatTime(ev.eventTime)}</div>}
                                {ev.location  && <div style={{ fontFamily: FONT_MONO, fontSize: "5pt", color: INK, lineHeight: 1.2 }}>{ev.location}</div>}
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>

    </div>
  );
}
