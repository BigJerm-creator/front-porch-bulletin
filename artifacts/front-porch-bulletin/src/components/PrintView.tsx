import { useEffect, useState } from "react";
import logoSrc from "@assets/The_(1)_1775854639167.png";
import {
  useGetFeaturedArticles,
  useGetSpotlight, getGetSpotlightQueryKey,
  useGetBusinessSpotlight, getGetBusinessSpotlightQueryKey,
  useGetGroupSpotlight, getGetGroupSpotlightQueryKey,
  useListChurches, getListChurchesQueryKey,
  useListArticles, getListArticlesQueryKey,
} from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/* ─── tokens ─────────────────────────────────────────────────── */
const FONT_SERIF    = "'Libre Baskerville', Georgia, serif";
const FONT_HEADLINE = "'Old Standard TT', 'Times New Roman', serif";
const FONT_MONO     = "'Space Mono', 'Courier New', monospace";
const INK           = "#1a1a1a";
const INK_MUTED     = "#555";
const RULE          = "1px solid #1a1a1a";
const RULE_LIGHT    = "0.5px solid rgba(0,0,0,0.25)";
const RULE_DOUBLE   = "2.5px solid #1a1a1a";

const EMAIL = "TheFrontPorchBulletin@gmail.com";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

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

/* ── Shared sub-components ──────────────────────────────────────── */

function IssueBar({ page, issueNum, issueDate }: { page: string; issueNum: string; issueDate: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "8pt",
      borderTop: RULE_DOUBLE, borderBottom: RULE,
      padding: "3pt 0", marginBottom: "0",
      fontFamily: FONT_MONO, fontSize: "8pt",
      textTransform: "uppercase", letterSpacing: "0.12em", color: INK,
    }}>
      <span style={{ whiteSpace: "nowrap" }}>Issue {issueNum} / {issueDate}</span>
      <span style={{ flex: 1, borderTop: RULE_LIGHT }} />
      <span style={{ whiteSpace: "nowrap" }}>Page {page}</span>
    </div>
  );
}

function Masthead() {
  return (
    <>
      <div style={{ textAlign: "center", padding: "10pt 0 6pt" }}>
        <img
          src={logoSrc}
          alt="The Front Porch Bulletin"
          style={{ width: "100%", maxHeight: "180pt", objectFit: "contain", display: "block", margin: "0 auto" }}
        />
      </div>
      {/* Tagline */}
      <div style={{ display: "flex", alignItems: "center", gap: "8pt", borderTop: RULE_LIGHT, borderBottom: RULE_DOUBLE, padding: "3pt 0", marginBottom: "4pt" }}>
        <span style={{ flex: 1, borderTop: RULE_LIGHT }} />
        <span style={{ fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: "9pt", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
          Where Community Comes to Gather
        </span>
        <span style={{ flex: 1, borderTop: RULE_LIGHT }} />
      </div>
      {/* Email */}
      <div style={{ textAlign: "center", fontFamily: FONT_MONO, fontSize: "7pt", textTransform: "uppercase", letterSpacing: "0.14em", color: INK_MUTED, marginBottom: "10pt" }}>
        &#9993; {EMAIL}
      </div>
    </>
  );
}

function SlimHeader({ page, issueNum, issueDate }: { page: string; issueNum: string; issueDate: string }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      borderTop: RULE_DOUBLE, borderBottom: RULE_DOUBLE,
      padding: "3pt 0", marginBottom: "14pt",
      fontFamily: FONT_MONO, fontSize: "8pt",
      textTransform: "uppercase", letterSpacing: "0.12em", color: INK,
    }}>
      <span>Issue {issueNum} / {issueDate}</span>
      <span style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "10pt", letterSpacing: "0.03em", textTransform: "none" }}>
        The Front Porch Bulletin
      </span>
      <span>Page {page}</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: FONT_MONO, fontSize: "7pt", textTransform: "uppercase",
      letterSpacing: "0.14em", fontWeight: "bold", color: INK,
      borderBottom: RULE, paddingBottom: "2.5pt", marginBottom: "6pt",
      breakAfter: "avoid", pageBreakAfter: "avoid",
    }}>{children}</div>
  );
}

function ArticleByline({ author }: { author: string }) {
  return (
    <p style={{
      fontFamily: FONT_MONO, fontSize: "7pt", textTransform: "uppercase",
      letterSpacing: "0.1em", color: INK_MUTED,
      margin: "0 0 5pt",
      borderTop: RULE_LIGHT, borderBottom: RULE_LIGHT, padding: "2.5pt 0",
    }}>
      By {author}
    </p>
  );
}

/* ── PrintView ───────────────────────────────────────────────── */
export function PrintView() {
  const { data: featured }          = useGetFeaturedArticles();
  const { data: spotlight }         = useGetSpotlight({ query: { queryKey: getGetSpotlightQueryKey(), retry: false } as any });
  const { data: businessSpotlight } = useGetBusinessSpotlight({ query: { queryKey: getGetBusinessSpotlightQueryKey(), retry: false } as any });
  const { data: groupSpotlight }    = useGetGroupSpotlight({ query: { queryKey: getGetGroupSpotlightQueryKey(), retry: false } as any });
  const { data: churchData }        = useListChurches({ query: { queryKey: getListChurchesQueryKey() } });
  const [calEvents, setCalEvents]   = useState<CalendarEvent[]>([]);
  const [issueSettings, setIssueSettings] = useState({ issueNumber: "01", issueYear: 2026, issueMonth: 5 });

  useEffect(() => {
    fetch(`${BASE}/api/issue-settings`)
      .then(r => r.json())
      .then(data => {
        setIssueSettings({
          issueNumber: data.issueNumber ?? "01",
          issueYear:   data.issueYear   ?? 2026,
          issueMonth:  data.issueMonth  ?? 5,
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${BASE}/api/calendar-events/month/${issueSettings.issueYear}/${issueSettings.issueMonth}`)
      .then(r => r.json())
      .then(d => setCalEvents(d.events ?? []));
  }, [issueSettings.issueYear, issueSettings.issueMonth]);

  const { data: libraryData }   = useListArticles({ category: "Library News", limit: 10 }, { query: { queryKey: getListArticlesQueryKey({ category: "Library News", limit: 10 }) } });
  const { data: h4Data }        = useListArticles({ category: "4H News",      limit: 10 }, { query: { queryKey: getListArticlesQueryKey({ category: "4H News",      limit: 10 }) } });
  const { data: communityData } = useListArticles({ category: "Community",    limit: 10 }, { query: { queryKey: getListArticlesQueryKey({ category: "Community",    limit: 10 }) } });

  const libraryArticles   = libraryData?.articles   ?? [];
  const h4Articles        = h4Data?.articles        ?? [];
  const communityArticles = communityData?.articles ?? [];

  const frontPage = featured?.frontPage ?? [];
  const secondary = featured?.secondary ?? [];
  const page2Article = featured?.page2 ?? null;
  const churches  = churchData?.churches ?? [];

  const isLetter = (art: { category: string }) =>
    art.category?.toLowerCase() === "letters";

  const mainArticle = frontPage[0] ?? null;

  const DEDICATED = new Set(["Library News", "4H News", "Community"]);

  // All non-main articles: deduplicated against dedicated sections
  const allOtherArticles = [...frontPage.slice(1), ...secondary]
    .filter(a => a.id !== page2Article?.id && !DEDICATED.has(a.category));
  const letterArticles = allOtherArticles.filter(isLetter);
  const otherArticles  = allOtherArticles.filter(a => !isLetter(a));

  /* ── Photo helper ── */
  function PhotoBox({ url, alt, credit, aspect = "4/3", objectFit = "contain", maxHeight, natural }: { url?: string | null; alt: string; credit?: string | null; aspect?: string; objectFit?: "cover" | "contain"; maxHeight?: string; natural?: boolean }) {
    return (
      <div style={{ marginBottom: "4pt" }}>
        {natural ? (
          <div style={{ width: "100%", overflow: "hidden", border: RULE }}>
            {url ? (
              <img src={url} alt={alt} style={{ width: "100%", height: "auto", display: "block" }} />
            ) : (
              <div style={{ width: "100%", padding: "20pt 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: "6pt", color: INK_MUTED, textTransform: "uppercase" }}>Photo</span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ width: "100%", ...(maxHeight ? { height: maxHeight, maxHeight } : { aspectRatio: aspect }), overflow: "hidden", border: RULE, background: "#d6cfc4" }}>
            {url ? (
              <img src={url} alt={alt} style={{ width: "100%", height: "100%", objectFit: objectFit, display: "block" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: "6pt", color: INK_MUTED, textTransform: "uppercase" }}>Photo</span>
              </div>
            )}
          </div>
        )}
        {credit && (
          <p style={{ fontFamily: FONT_MONO, fontSize: "5.5pt", fontStyle: "italic", color: INK_MUTED, textAlign: "right", margin: "1pt 0 0" }}>
            Photo credit — {credit}
          </p>
        )}
      </div>
    );
  }

  const issueNum  = issueSettings.issueNumber;
  const issueDate = `${MONTH_NAMES[issueSettings.issueMonth - 1]} ${issueSettings.issueYear}`;

  /* ── Calendar helpers ── */
  const yr       = issueSettings.issueYear;
  const mo       = issueSettings.issueMonth - 1;
  const firstDow = new Date(yr, mo, 1).getDay();
  const daysInMo = new Date(yr, mo + 1, 0).getDate();
  const eventMap = new Map<number, CalendarEvent[]>();
  for (const ev of calEvents) {
    const d = new Date(ev.eventDate + "T12:00:00").getDate();
    if (!eventMap.has(d)) eventMap.set(d, []);
    eventMap.get(d)!.push(ev);
  }
  const calCells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMo }, (_, i) => i + 1),
  ];
  while (calCells.length % 7 !== 0) calCells.push(null);

  /* ─────────────────────────── RENDER ─────────────────────────── */
  return (
    <div id="print-view" style={{ fontFamily: FONT_SERIF, color: INK, fontSize: "11pt" }}>

      {/* ══════════ PAGE 1 ══════════ */}
      <Masthead />

      {/* ─── Main featured article — full width ─── */}
      <div style={{ borderTop: RULE }}>
        {mainArticle ? (
          <>
            <h1 style={{
              fontFamily: FONT_HEADLINE, fontWeight: "bold",
              fontSize: "42pt", lineHeight: 1.0,
              margin: "6pt 0 5pt", letterSpacing: "-0.02em",
            }}>{mainArticle.title}</h1>
            {mainArticle.subtitle && (
              <p style={{ fontFamily: FONT_HEADLINE, fontStyle: "italic", fontSize: "16pt", lineHeight: 1.2, margin: "0 0 4pt", color: "#333" }}>
                {mainArticle.subtitle}
              </p>
            )}
            <ArticleByline author={mainArticle.author} />
            <div style={{ fontSize: "11pt", lineHeight: 1.6, textAlign: "justify" }}>
              {/* Spotlight floated right — article text wraps alongside it from the top */}
              {spotlight && (
                <div style={{ float: "right", marginLeft: "14pt", marginBottom: "5pt", width: "200pt", borderTop: RULE_DOUBLE, paddingTop: "6pt" }}>
                  <SectionLabel>Student Spotlight</SectionLabel>
                  <PhotoBox url={spotlight.photoUrl} alt={spotlight.name} credit={spotlight.photoCredit} natural />
                  <p style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "12pt", lineHeight: 1.1, margin: "0 0 1.5pt" }}>{spotlight.name}</p>
                  <p style={{ fontFamily: FONT_MONO, fontSize: "6.5pt", textTransform: "uppercase", letterSpacing: "0.1em", color: INK_MUTED, margin: "0 0 3pt" }}>
                    {spotlight.school} &bull; {spotlight.grade}
                  </p>
                  <p style={{ fontSize: "9pt", lineHeight: 1.45, margin: 0, color: "#333" }}>{spotlight.description}</p>
                </div>
              )}
              {mainArticle.photoUrl && (
                <div style={{ float: "left", marginRight: "10pt", marginBottom: "5pt", maxWidth: "40%" }}>
                  <img src={mainArticle.photoUrl} alt={mainArticle.title} style={{ display: "block", maxWidth: "100%", maxHeight: "110pt", width: "auto", height: "auto" }} />
                  {mainArticle.photoCredit && (
                    <p style={{ fontFamily: FONT_MONO, fontSize: "5.5pt", fontStyle: "italic", color: INK_MUTED, textAlign: "right", margin: "1pt 0 0" }}>Photo credit — {mainArticle.photoCredit}</p>
                  )}
                </div>
              )}
              {mainArticle.content.split('\n\n').map((para, i) => (
                <p key={i} style={{ margin: i === 0 ? "0" : "7pt 0 0", breakInside: "avoid" }}>{para}</p>
              ))}
              <div style={{ clear: "both" }} />
            </div>
          </>
        ) : (
          <p style={{ fontFamily: FONT_SERIF, fontStyle: "italic", color: INK_MUTED }}>No featured story this week.</p>
        )}
      </div>

      {/* ══ Continuation ══ */}
      <div style={{ borderTop: RULE_DOUBLE, marginTop: "18pt", marginBottom: "14pt" }} />

      {/* Business Spotlight — full width */}
      {businessSpotlight && (
        <div style={{ marginBottom: "18pt", paddingBottom: "14pt", borderBottom: RULE_DOUBLE, breakBefore: "page" }}>
          <SectionLabel>Business Spotlight</SectionLabel>
          <div>
            {businessSpotlight.photoUrl && (
              <div style={{ float: "left", marginRight: "12pt", marginBottom: "5pt", width: "160pt" }}>
                <PhotoBox url={businessSpotlight.photoUrl} alt={businessSpotlight.name} credit={businessSpotlight.photoCredit} natural />
              </div>
            )}
            <p style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "15pt", lineHeight: 1.1, margin: "0 0 2pt" }}>{businessSpotlight.name}</p>
            {businessSpotlight.businessType && (
              <p style={{ fontFamily: FONT_MONO, fontSize: "6.5pt", textTransform: "uppercase", letterSpacing: "0.1em", color: INK_MUTED, margin: "0 0 5pt" }}>
                {businessSpotlight.businessType}
              </p>
            )}
            <div style={{ fontSize: "9.5pt", lineHeight: 1.5, textAlign: "justify" }}>
              {businessSpotlight.description.split('\n\n').map((para, i) => (
                <p key={i} style={{ margin: i > 0 ? "5pt 0 0" : "0" }}>
                  {para.split('\n').map((line, j) => (
                    j === 0 ? line : <>{'\n'}<br />{line}</>
                  ))}
                </p>
              ))}
            </div>
            <div style={{ clear: "both" }} />
          </div>
        </div>
      )}

      {/* Group Spotlight — full width */}
      {groupSpotlight && (
        <div style={{ marginBottom: "18pt", paddingBottom: "14pt", borderBottom: RULE_DOUBLE }}>
          <SectionLabel>Group Spotlight</SectionLabel>
          <div>
            {groupSpotlight.photoUrl && (
              <div style={{ float: "left", marginRight: "12pt", marginBottom: "5pt", width: "160pt" }}>
                <PhotoBox url={groupSpotlight.photoUrl} alt={groupSpotlight.name} credit={groupSpotlight.photoCredit} natural />
              </div>
            )}
            <p style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "15pt", lineHeight: 1.1, margin: "0 0 2pt" }}>{groupSpotlight.name}</p>
            {groupSpotlight.groupType && (
              <p style={{ fontFamily: FONT_MONO, fontSize: "6.5pt", textTransform: "uppercase", letterSpacing: "0.1em", color: INK_MUTED, margin: "0 0 5pt" }}>
                {groupSpotlight.groupType}
              </p>
            )}
            <div style={{ fontSize: "9.5pt", lineHeight: 1.5, textAlign: "justify" }}>
              {groupSpotlight.description.split('\n\n').map((para, i) => (
                <p key={i} style={{ margin: i > 0 ? "5pt 0 0" : "0" }}>
                  {para.split('\n').map((line, j) => (
                    j === 0 ? line : <>{'\n'}<br />{line}</>
                  ))}
                </p>
              ))}
            </div>
            <div style={{ clear: "both" }} />
          </div>
        </div>
      )}

      {/* Page 2 Top Story — full-width, chosen from admin */}
      {page2Article && (
        <div style={{ marginBottom: "22pt", paddingBottom: "18pt", borderBottom: RULE_DOUBLE }}>
          <h2 style={{
            fontFamily: FONT_HEADLINE, fontWeight: "bold",
            fontSize: "38pt", lineHeight: 1.0,
            margin: "0 0 5pt", letterSpacing: "-0.02em",
          }}>{page2Article.title}</h2>
          {page2Article.subtitle && (
            <p style={{ fontFamily: FONT_HEADLINE, fontStyle: "italic", fontSize: "15pt", lineHeight: 1.2, margin: "0 0 4pt", color: "#333" }}>
              {page2Article.subtitle}
            </p>
          )}
          <ArticleByline author={page2Article.author} />
          <div style={{ columns: 2, columnGap: "22pt", columnRule: RULE_LIGHT, fontSize: "11pt", lineHeight: 1.6, textAlign: "justify" }}>
            {page2Article.photoUrl && (
              <div style={{ float: "left", marginRight: "10pt", marginBottom: "5pt", maxWidth: "45%" }}>
                <img src={page2Article.photoUrl} alt={page2Article.title} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
                {page2Article.photoCredit && (
                  <p style={{ fontFamily: FONT_MONO, fontSize: "5.5pt", fontStyle: "italic", color: INK_MUTED, textAlign: "right", margin: "1pt 0 0" }}>Photo credit — {page2Article.photoCredit}</p>
                )}
              </div>
            )}
            {page2Article.content.split('\n\n').map((para, i) => (
              <p key={i} style={{ margin: i === 0 ? "0" : "7pt 0 0", breakInside: "avoid" }}>{para}</p>
            ))}
            <div style={{ clear: "both" }} />
          </div>
        </div>
      )}

      {/* 4H News + Community — shown only when at least one has articles */}
      {h4Articles.length > 0 && communityArticles.length > 0 ? (
        /* Both have articles — two-column side-by-side */
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0", borderTop: RULE, borderBottom: RULE, marginBottom: "18pt", paddingTop: "10pt", paddingBottom: "10pt", breakBefore: "page" }}>
          <div style={{ paddingRight: "14pt", borderRight: RULE }}>
            <SectionLabel>4H News</SectionLabel>
            {h4Articles.map((art, i) => (
              <div key={art.id} style={{ marginBottom: "12pt", paddingBottom: "10pt", borderBottom: i < h4Articles.length - 1 ? RULE_LIGHT : "none" }}>
                {art.photoUrl && (
                  <img src={art.photoUrl} alt={art.title} style={{ display: "block", maxWidth: "50%", height: "auto", marginBottom: "4pt" }} />
                )}
                <h3 style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "15pt", lineHeight: 1.1, margin: "0 0 3pt" }}>{art.title}</h3>
                {art.subtitle && <p style={{ fontFamily: FONT_HEADLINE, fontStyle: "italic", fontSize: "10pt", margin: "0 0 2pt", color: "#333" }}>{art.subtitle}</p>}
                <ArticleByline author={art.author} />
                {art.content.split('\n\n').map((para, pi) => (
                  <p key={pi} style={{ fontSize: "9.5pt", lineHeight: 1.5, margin: pi > 0 ? "5pt 0 0" : "0", textAlign: "justify" }}>{para}</p>
                ))}
              </div>
            ))}
          </div>
          <div style={{ paddingLeft: "14pt" }}>
            <SectionLabel>Community</SectionLabel>
            {communityArticles.map((art, i) => (
              <div key={art.id} style={{ marginBottom: "12pt", paddingBottom: "10pt", borderBottom: i < communityArticles.length - 1 ? RULE_LIGHT : "none" }}>
                {art.photoUrl && (
                  <img src={art.photoUrl} alt={art.title} style={{ display: "block", maxWidth: "50%", height: "auto", marginBottom: "4pt" }} />
                )}
                <h3 style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "15pt", lineHeight: 1.1, margin: "0 0 3pt" }}>{art.title}</h3>
                {art.subtitle && <p style={{ fontFamily: FONT_HEADLINE, fontStyle: "italic", fontSize: "10pt", margin: "0 0 2pt", color: "#333" }}>{art.subtitle}</p>}
                <ArticleByline author={art.author} />
                {art.content.split('\n\n').map((para, pi) => (
                  <p key={pi} style={{ fontSize: "9.5pt", lineHeight: 1.5, margin: pi > 0 ? "5pt 0 0" : "0", textAlign: "justify" }}>{para}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : h4Articles.length > 0 ? (
        /* Only 4H — full width */
        <div style={{ borderTop: RULE, borderBottom: RULE, marginBottom: "18pt", paddingTop: "10pt", paddingBottom: "10pt", breakBefore: "page" }}>
          <SectionLabel>4H News</SectionLabel>
          {h4Articles.map((art, i) => (
            <div key={art.id} style={{ marginBottom: "12pt", paddingBottom: "10pt", borderBottom: i < h4Articles.length - 1 ? RULE_LIGHT : "none" }}>
              {art.photoUrl && (
                <div style={{ float: "left", marginRight: "10pt", marginBottom: "4pt", maxWidth: "42%" }}>
                  <img src={art.photoUrl} alt={art.title} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
                  {art.photoCredit && <p style={{ fontFamily: FONT_MONO, fontSize: "5.5pt", fontStyle: "italic", color: INK_MUTED, textAlign: "right", margin: "1pt 0 0" }}>Photo credit — {art.photoCredit}</p>}
                </div>
              )}
              <h3 style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "15pt", lineHeight: 1.1, margin: "0 0 3pt" }}>{art.title}</h3>
              {art.subtitle && <p style={{ fontFamily: FONT_HEADLINE, fontStyle: "italic", fontSize: "10pt", margin: "0 0 2pt", color: "#333" }}>{art.subtitle}</p>}
              <ArticleByline author={art.author} />
              {art.content.split('\n\n').map((para, pi) => (
                <p key={pi} style={{ fontSize: "9.5pt", lineHeight: 1.5, margin: pi > 0 ? "5pt 0 0" : "0", textAlign: "justify" }}>{para}</p>
              ))}
              <div style={{ clear: "both" }} />
            </div>
          ))}
        </div>
      ) : communityArticles.length > 0 ? (
        /* Only Community — full width */
        <div style={{ borderTop: RULE, borderBottom: RULE, marginBottom: "18pt", paddingTop: "10pt", paddingBottom: "10pt", breakBefore: "page" }}>
          <SectionLabel>Community</SectionLabel>
          {communityArticles.map((art, i) => (
            <div key={art.id} style={{ marginBottom: "12pt", paddingBottom: "10pt", borderBottom: i < communityArticles.length - 1 ? RULE_LIGHT : "none" }}>
              {art.photoUrl && (
                <div style={{ float: "left", marginRight: "10pt", marginBottom: "4pt", maxWidth: "42%" }}>
                  <img src={art.photoUrl} alt={art.title} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
                  {art.photoCredit && <p style={{ fontFamily: FONT_MONO, fontSize: "5.5pt", fontStyle: "italic", color: INK_MUTED, textAlign: "right", margin: "1pt 0 0" }}>Photo credit — {art.photoCredit}</p>}
                </div>
              )}
              <h3 style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "15pt", lineHeight: 1.1, margin: "0 0 3pt" }}>{art.title}</h3>
              {art.subtitle && <p style={{ fontFamily: FONT_HEADLINE, fontStyle: "italic", fontSize: "10pt", margin: "0 0 2pt", color: "#333" }}>{art.subtitle}</p>}
              <ArticleByline author={art.author} />
              {art.content.split('\n\n').map((para, pi) => (
                <p key={pi} style={{ fontSize: "9.5pt", lineHeight: 1.5, margin: pi > 0 ? "5pt 0 0" : "0", textAlign: "justify" }}>{para}</p>
              ))}
              <div style={{ clear: "both" }} />
            </div>
          ))}
        </div>
      ) : null}

      {/* Library News — full width */}
      {libraryArticles.length > 0 && (
      <div style={{ marginBottom: "18pt", paddingBottom: "14pt", borderBottom: RULE_DOUBLE }}>
        <SectionLabel>Library News</SectionLabel>
        <div>
            {libraryArticles.map((art, i) => (
              <div key={art.id} style={{ marginBottom: "14pt", paddingBottom: "12pt", borderBottom: i < libraryArticles.length - 1 ? RULE_LIGHT : "none" }}>
                <h3 style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "15pt", lineHeight: 1.1, margin: "0 0 3pt" }}>{art.title}</h3>
                {art.subtitle && <p style={{ fontFamily: FONT_HEADLINE, fontStyle: "italic", fontSize: "10pt", margin: "0 0 2pt", color: "#333" }}>{art.subtitle}</p>}
                <ArticleByline author={art.author} />
                <div style={{ fontSize: "9.5pt", lineHeight: 1.5, textAlign: "justify" }}>
                  {art.photoUrl && (
                    <div style={{ float: "left", marginRight: "10pt", marginBottom: "4pt", maxWidth: "45%" }}>
                      <img src={art.photoUrl} alt={art.title} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
                      {art.photoCredit && <p style={{ fontFamily: FONT_MONO, fontSize: "5.5pt", fontStyle: "italic", color: INK_MUTED, textAlign: "right", margin: "1pt 0 0" }}>Photo credit — {art.photoCredit}</p>}
                    </div>
                  )}
                  {art.content.split('\n\n').map((para, j) => (
                    <p key={j} style={{ margin: j === 0 ? "0" : "6pt 0 0", breakInside: "avoid" }}>{para}</p>
                  ))}
                  <div style={{ clear: "both" }} />
                </div>
              </div>
            ))}
        </div>
      </div>
      )}

      {/* Letters from / to the Editor — full-width */}
      {letterArticles.length > 0 && (
        <div style={{ marginBottom: "22pt" }}>
          <SectionLabel>Letters</SectionLabel>
          {letterArticles.map((art, i) => (
            <div key={art.id} style={{ marginBottom: "22pt", paddingBottom: "18pt", borderBottom: i < letterArticles.length - 1 ? RULE_LIGHT : "none" }}>
              <h2 style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "32pt", lineHeight: 1.0, margin: "0 0 4pt", letterSpacing: "-0.01em" }}>
                {art.title}
              </h2>
              {art.subtitle && (
                <p style={{ fontFamily: FONT_HEADLINE, fontStyle: "italic", fontSize: "14pt", lineHeight: 1.2, margin: "0 0 4pt", color: "#333" }}>
                  {art.subtitle}
                </p>
              )}
              <ArticleByline author={art.author} />
              <div style={{ fontSize: "11pt", lineHeight: 1.6, textAlign: "justify" }}>
                {art.photoUrl && (
                  <div style={{ float: "left", marginRight: "10pt", marginBottom: "5pt", maxWidth: "40%" }}>
                    <img src={art.photoUrl} alt={art.title} style={{ display: "block", maxWidth: "100%", height: "auto" }} />
                    {art.photoCredit && <p style={{ fontFamily: FONT_MONO, fontSize: "5.5pt", fontStyle: "italic", color: INK_MUTED, textAlign: "right", margin: "1pt 0 0" }}>Photo credit — {art.photoCredit}</p>}
                  </div>
                )}
                {art.content.split('\n\n').map((para, j) => (
                  <p key={j} style={{ margin: j === 0 ? "0" : "7pt 0 0", breakInside: "avoid" }}>{para}</p>
                ))}
                <div style={{ clear: "both" }} />
              </div>
            </div>
          ))}
          {/* Divider before other articles */}
          {otherArticles.length > 0 && (
            <div style={{ borderTop: RULE_DOUBLE, marginTop: "4pt", marginBottom: "18pt" }} />
          )}
        </div>
      )}

      {/* Other secondary articles */}
      {otherArticles.length > 0 && (
        <div>
          {otherArticles.map((art, i) => (
            <div key={art.id} style={{ marginBottom: "22pt", paddingBottom: "18pt", borderBottom: i < otherArticles.length - 1 ? RULE_LIGHT : "none", breakInside: "avoid" }}>
              <SectionLabel>{art.category}</SectionLabel>
              <h2 style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "28pt", lineHeight: 1.05, margin: "0 0 4pt", letterSpacing: "-0.01em" }}>
                {art.title}
              </h2>
              {art.subtitle && (
                <p style={{ fontFamily: FONT_HEADLINE, fontStyle: "italic", fontSize: "13pt", lineHeight: 1.2, margin: "0 0 4pt", color: "#333" }}>
                  {art.subtitle}
                </p>
              )}
              <ArticleByline author={art.author} />
              <div style={{ display: "grid", gridTemplateColumns: art.photoUrl ? "auto 1fr" : "1fr", gap: "14pt", alignItems: "flex-start" }}>
                {art.photoUrl && (
                  <div style={{ width: "160pt", flexShrink: 0 }}>
                    <PhotoBox url={art.photoUrl} alt={art.title} credit={art.photoCredit} aspect="4/3" />
                  </div>
                )}
                <div style={{ columns: 2, columnGap: "18pt", columnRule: RULE_LIGHT, fontSize: "11pt", lineHeight: 1.55, textAlign: "justify" }}>
                  {art.content.split('\n\n').map((para, j) => (
                    <p key={j} style={{ margin: j === 0 ? "0" : "7pt 0 0", breakInside: "avoid" }}>
                          {para}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ Comics ══ */}
      <div style={{ breakBefore: "page", pageBreakBefore: "always", marginBottom: "18pt" }}>
        <SectionLabel>Comics</SectionLabel>
        <img
          src="/comic-bob-marley.png"
          alt="Bob + Marley comic strip"
          style={{ display: "block", width: "100%", height: "auto" }}
        />
      </div>

      {/* ══ Church & Calendar — always own page ══ */}
      <div style={{ breakBefore: "page", pageBreakBefore: "always" }}>

      {/* Church Directory */}
      {churches.length > 0 && (
        <div style={{ marginBottom: "18pt" }}>
          <SectionLabel>Church Directory</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4pt 10pt" }}>
            {churches.map(church => (
              <div key={church.id} style={{ borderLeft: "1.5pt solid " + INK, paddingLeft: "5pt", breakInside: "avoid", marginBottom: "4pt" }}>
                <p style={{ fontFamily: FONT_HEADLINE, fontWeight: "bold", fontSize: "8.5pt", lineHeight: 1.1, margin: "0 0 1pt" }}>{church.name}</p>
                {church.pastor && (
                  <p style={{ fontFamily: FONT_MONO, fontSize: "6pt", textTransform: "uppercase", letterSpacing: "0.06em", color: INK_MUTED, margin: "0 0 1pt" }}>{church.pastor}</p>
                )}
                {church.serviceTimes && (
                  <p style={{ fontSize: "7pt", lineHeight: 1.3, margin: "0 0 1pt", color: "#333" }}>{church.serviceTimes}</p>
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
      <div>
        <SectionLabel>Community Calendar — {issueDate}</SectionLabel>

        {/* Month grid */}
        <div style={{ marginBottom: "10pt" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2pt", marginBottom: "4pt" }}>
            {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(d => (
              <div key={d} style={{ fontFamily: FONT_MONO, fontSize: "7pt", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center", borderBottom: RULE, paddingBottom: "3pt", color: INK_MUTED }}>
                {d}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2pt" }}>
            {calCells.map((day, idx) => {
              const events = day ? (eventMap.get(day) ?? []) : [];
              return (
                <div key={idx} style={{ border: RULE_LIGHT, padding: "3pt", minHeight: "52pt", verticalAlign: "top", background: day ? "#fff" : "#f5f0e8" }}>
                  {day && (
                    <>
                      <div style={{ fontFamily: FONT_MONO, fontSize: "9pt", fontWeight: "bold", marginBottom: "2pt", color: INK }}>{day}</div>
                      {events.map(ev => (
                        <div key={ev.id} style={{ fontSize: "6.5pt", lineHeight: 1.3, color: "#222", marginBottom: "1.5pt" }}>
                          <span style={{ fontWeight: "bold" }}>{ev.eventTime ? formatTime(ev.eventTime) : ""}</span>
                          {ev.eventTime ? " " : ""}{ev.title}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      </div> {/* end page-break wrapper */}

    </div>
  );
}
