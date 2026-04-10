import { useEffect, useState } from "react";
import logoSrc from "@assets/The_(1)_1775854639167.png";
import {
  useGetFeaturedArticles,
  useGetSpotlight, getGetSpotlightQueryKey,
  useListObituaries, getListObituariesQueryKey,
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

function formatEventDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, Number(day)).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });
}

function formatObituaryDate(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[Number(month)-1]}. ${Number(day)}, ${year}`;
}

/* ─── PrintView ───────────────────────────────────────────────── */
export function PrintView() {
  const today = new Date().toISOString();
  const { data: featured }    = useGetFeaturedArticles();
  const { data: spotlight }   = useGetSpotlight({ query: { queryKey: getGetSpotlightQueryKey() } });
  const { data: obituaryData }= useListObituaries({ query: { queryKey: getListObituariesQueryKey() } });
  const { data: churchData }  = useListChurches({ query: { queryKey: getListChurchesQueryKey() } });
  const [calEvents, setCalEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    fetch(`${BASE}/api/calendar-events`)
      .then(r => r.json())
      .then(d => setCalEvents(d.events ?? []));
  }, []);

  const headline   = featured?.headline;
  const secondary  = (featured?.secondary ?? []).slice(0, 3);
  const obituaries = obituaryData?.obituaries ?? [];
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

      {/* Two-column body */}
      <div style={{ display: "flex", gap: "14pt", alignItems: "flex-start" }}>

        {/* ── Left column: Spotlight + Upcoming Events ── */}
        <div style={{ width: "32%", borderRight: RULE, paddingRight: "12pt", flexShrink: 0 }}>

          {/* Student Spotlight */}
          {spotlight && (
            <div style={{ marginBottom: "8pt", paddingBottom: "8pt", borderBottom: RULE_LIGHT }}>
              <div style={sectionHeading}>Student Spotlight</div>
              {spotlight.photoUrl ? (
                <img
                  src={spotlight.photoUrl}
                  alt={spotlight.name}
                  style={{ width: "100%", maxHeight: "80pt", objectFit: "cover", display: "block", marginBottom: "4pt" }}
                />
              ) : (
                <div style={{ width: "100%", height: "65pt", background: "#d6cfc4", marginBottom: "4pt", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: "6pt", color: INK_MUTED, textTransform: "uppercase" }}>Photo</span>
                </div>
              )}
              <p style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "11pt", lineHeight: 1.1, margin: "0 0 1.5pt" }}>{spotlight.name}</p>
              <p style={{ fontFamily: FONT_MONO, fontSize: "6.5pt", textTransform: "uppercase", letterSpacing: "0.1em", color: INK_MUTED, margin: "0 0 3pt" }}>
                {spotlight.school} &bull; {spotlight.grade}
              </p>
              <p style={{ fontSize: "8.5pt", lineHeight: 1.4, margin: 0, color: "#333" }}>{spotlight.description}</p>
            </div>
          )}

          {/* Upcoming Events */}
          {secondary.length > 0 && (
            <div>
              <div style={sectionHeading}>Upcoming Events</div>
              {secondary.map((article, i) => (
                <div key={article.id} style={{
                  paddingBottom: "5pt",
                  marginBottom: i < secondary.length - 1 ? "5pt" : 0,
                  borderBottom: i < secondary.length - 1 ? RULE_LIGHT : "none",
                }}>
                  <p style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "9.5pt", lineHeight: 1.15, margin: "0 0 1.5pt" }}>{article.title}</p>
                  <p style={{ fontFamily: FONT_MONO, fontSize: "6pt", textTransform: "uppercase", letterSpacing: "0.08em", color: INK_MUTED, margin: "0 0 2pt" }}>
                    {formatDateline(article.publishedAt)} &middot; {article.category}
                  </p>
                  <p style={{ fontSize: "8pt", lineHeight: 1.35, margin: 0, color: "#333" }}>
                    {article.content.split("\n")[0].slice(0, 220)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right column: Headline article ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {headline ? (
            <article>
              <h1 style={{
                fontFamily: FONT_HEADLINE,
                fontWeight: "bold",
                fontSize: "22pt",
                lineHeight: 1.05,
                margin: "0 0 4pt",
                letterSpacing: "-0.01em",
              }}>{headline.title}</h1>

              {headline.subtitle && (
                <p style={{ fontFamily: FONT_HEADLINE, fontStyle: "italic", fontSize: "11pt", lineHeight: 1.2, margin: "0 0 4pt", color: "#333" }}>
                  {headline.subtitle}
                </p>
              )}

              <p style={{ fontFamily: FONT_MONO, fontSize: "6.5pt", textTransform: "uppercase", letterSpacing: "0.1em", color: INK_MUTED, margin: "0 0 6pt", borderBottom: RULE_LIGHT, paddingBottom: "3pt" }}>
                By {headline.author} &nbsp;&middot;&nbsp; {headline.category} &nbsp;&middot;&nbsp; {formatDateline(headline.publishedAt)}
              </p>

              {/* Body text — two newspaper columns, overflow hidden to stay on page 1 */}
              <div style={{
                columns: "2",
                columnGap: "12pt",
                columnRule: RULE_LIGHT,
                maxHeight: "6.1in",
                overflow: "hidden",
              }}>
                <p style={{ fontSize: "9.5pt", lineHeight: 1.5, margin: 0, textAlign: "justify" }}>
                  <span style={{ fontFamily: FONT_MONO, fontWeight: "bold", fontSize: "6.5pt", textTransform: "uppercase", letterSpacing: "0.1em", marginRight: "3pt" }}>
                    {formatDateline(headline.publishedAt)}—
                  </span>
                  {headline.content}
                </p>
              </div>
            </article>
          ) : (
            <p style={{ fontFamily: FONT_SERIF, fontStyle: "italic", color: INK_MUTED }}>No featured story this week.</p>
          )}
        </div>
      </div>

      {/* ══════════════════ PAGE BREAK ══════════════════ */}
      <div style={{ pageBreakBefore: "always", breakBefore: "page" }} />

      {/* ══════════════════ PAGE 2 ══════════════════ */}

      {/* Page 2 masthead — slim, no logo */}
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

      {/* Two-column community listings */}
      <div style={{ display: "flex", gap: "16pt", alignItems: "flex-start" }}>

        {/* ── Left: Obituaries ── */}
        <div style={{ width: "48%", borderRight: RULE, paddingRight: "14pt" }}>
          <div style={sectionHeading}>Obituaries</div>
          {obituaries.length === 0 ? (
            <p style={{ fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: "8.5pt", color: INK_MUTED }}>No obituaries this week.</p>
          ) : (
            obituaries.map((obit, i) => {
              const birth = formatObituaryDate(obit.birthDate);
              const death = formatObituaryDate(obit.deathDate);
              const dates = [birth, death].filter(Boolean).join(" \u2013 ");
              const meta  = [dates, obit.hometown].filter(Boolean).join(" \u00b7 ");
              return (
                <div key={String(obit.id)} style={{
                  marginBottom: "7pt",
                  paddingBottom: "7pt",
                  borderBottom: i < obituaries.length - 1 ? RULE_LIGHT : "none",
                  breakInside: "avoid",
                }}>
                  <p style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "11pt", lineHeight: 1.1, margin: "0 0 1.5pt" }}>{obit.name}</p>
                  {meta && (
                    <p style={{ fontFamily: FONT_MONO, fontSize: "6.5pt", textTransform: "uppercase", letterSpacing: "0.09em", color: INK_MUTED, margin: "0 0 3pt" }}>{meta}</p>
                  )}
                  <p style={{ fontSize: "8.5pt", lineHeight: 1.45, margin: 0, color: "#333" }}>
                    {obit.content?.slice(0, 400)}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* ── Right: Church Directory + Community Calendar ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Church Directory */}
          {churches.length > 0 && (
            <div style={{ marginBottom: "10pt" }}>
              <div style={sectionHeading}>Church Directory</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5pt 10pt" }}>
                {churches.map(church => (
                  <div key={church.id} style={{ borderLeft: "2px solid " + INK, paddingLeft: "5pt", breakInside: "avoid" }}>
                    <p style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "8.5pt", lineHeight: 1.1, margin: "0 0 1pt" }}>{church.name}</p>
                    {church.pastor && (
                      <p style={{ fontFamily: FONT_MONO, fontSize: "6pt", textTransform: "uppercase", letterSpacing: "0.08em", color: INK_MUTED, margin: "0 0 1pt" }}>{church.pastor}</p>
                    )}
                    {church.serviceTimes && (
                      <p style={{ fontSize: "7.5pt", lineHeight: 1.3, margin: "0 0 1pt", color: "#333" }}>{church.serviceTimes}</p>
                    )}
                    {church.phone && (
                      <p style={{ fontFamily: FONT_MONO, fontSize: "6pt", color: INK_MUTED, margin: 0 }}>{church.phone}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Community Calendar */}
          {calEvents.length > 0 && (
            <div>
              <div style={sectionHeading}>Community Calendar</div>
              {calEvents.map((ev, i) => (
                <div key={ev.id} style={{
                  display: "flex",
                  gap: "5pt",
                  marginBottom: "5pt",
                  paddingBottom: "5pt",
                  borderBottom: i < calEvents.length - 1 ? RULE_LIGHT : "none",
                  breakInside: "avoid",
                }}>
                  <div style={{
                    flexShrink: 0,
                    width: "28pt",
                    border: "1.5px solid " + INK,
                    textAlign: "center",
                    padding: "2pt 0",
                    lineHeight: 1,
                  }}>
                    <div style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "11pt", lineHeight: 1 }}>
                      {ev.eventDate.split("-")[2].replace(/^0/, "")}
                    </div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: "5.5pt", textTransform: "uppercase", letterSpacing: "0.08em", color: INK_MUTED }}>
                      {new Date(ev.eventDate + "T12:00:00").toLocaleDateString("en-US", { month: "short" })}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "8.5pt", lineHeight: 1.15, margin: "0 0 1pt" }}>{ev.title}</p>
                    <p style={{ fontFamily: FONT_MONO, fontSize: "6pt", textTransform: "uppercase", letterSpacing: "0.07em", color: INK_MUTED, margin: 0 }}>
                      {formatEventDate(ev.eventDate)}{ev.eventTime ? " · " + ev.eventTime : ""}{ev.location ? " · " + ev.location : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
