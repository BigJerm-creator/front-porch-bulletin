import { useEffect } from "react";
import {
  useGetFeaturedArticles,
  useGetSpotlight, getGetSpotlightQueryKey,
  useGetBusinessSpotlight, getGetBusinessSpotlightQueryKey,
  useGetGroupSpotlight, getGetGroupSpotlightQueryKey,
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { ArticleTeaser } from "@/components/ArticleTeaser";
import { NewspaperSkeleton } from "@/components/ui/newspaper-skeleton";
import { ChurchDirectory } from "@/components/ChurchDirectory";
import { CalendarEvents } from "@/components/CalendarEvents";
import { PrintView } from "@/components/PrintView";
import { formatDateline } from "@/lib/format";
import { Link } from "wouter";

const isLetter = (art: { category: string }) =>
  art.category?.toLowerCase() === "letters";

export default function Home() {
  const { data: featuredData, isLoading } = useGetFeaturedArticles();
  const { data: spotlight }         = useGetSpotlight({ query: { queryKey: getGetSpotlightQueryKey(), retry: false } as any });
  const { data: businessSpotlight } = useGetBusinessSpotlight({ query: { queryKey: getGetBusinessSpotlightQueryKey(), retry: false } as any });
  const { data: groupSpotlight }    = useGetGroupSpotlight({ query: { queryKey: getGetGroupSpotlightQueryKey(), retry: false } as any });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("print") === "1" && !isLoading) {
      const timer = setTimeout(() => window.print(), 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const mainArticle  = featuredData?.frontPage?.[0] ?? null;
  const page2Article = (featuredData as any)?.page2 ?? null;

  // All non-main featured articles + secondary articles, split by letters vs other
  const allOtherArticles = [
    ...(featuredData?.frontPage?.slice(1) ?? []),
    ...(featuredData?.secondary ?? []),
  ].filter(a => a.id !== page2Article?.id);
  const letterArticles = allOtherArticles.filter(isLetter);
  const otherArticles  = allOtherArticles.filter(a => !isLetter(a));

  const hasSpotlights = !!(spotlight || businessSpotlight || groupSpotlight);

  return (
    <>
      {/* ── Screen layout ── */}
      <div className="screen-layout">
        <Layout>
          {isLoading ? (
            <NewspaperSkeleton />
          ) : (
            <>
              {/* ── Front page: sidebar + main ── */}
              <div className="flex flex-col md:flex-row gap-0 border-b-2 border-foreground mb-8 pb-8">

                {/* Left sidebar — spotlights only */}
                {hasSpotlights && (
                  <div className="w-full md:w-[28%] md:pr-6 md:border-r border-foreground flex flex-col gap-6 mb-6 md:mb-0">
                    {spotlight && (
                      <div className="border-b border-foreground/30 pb-4">
                        <div className="font-mono text-[10px] uppercase tracking-widest border-b border-foreground pb-1 mb-2">Student Spotlight</div>
                        {spotlight.photoUrl && (
                          <div className="w-full aspect-[4/3] overflow-hidden border border-foreground mb-2 bg-muted">
                            <img src={spotlight.photoUrl} alt={spotlight.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <h3 className="font-headline font-bold text-base leading-tight mb-0.5">{spotlight.name}</h3>
                        <p className="font-mono text-[10px] uppercase tracking-wide text-foreground/60 mb-1">{spotlight.school} · {spotlight.grade}</p>
                        <p className="text-sm leading-snug text-foreground/80 line-clamp-4">{spotlight.description}</p>
                      </div>
                    )}

                    {businessSpotlight && (
                      <div className="border-b border-foreground/30 pb-4">
                        <div className="font-mono text-[10px] uppercase tracking-widest border-b border-foreground pb-1 mb-2">Business Spotlight</div>
                        {businessSpotlight.photoUrl && (
                          <div className="w-full aspect-[4/3] overflow-hidden border border-foreground mb-2 bg-muted">
                            <img src={businessSpotlight.photoUrl} alt={businessSpotlight.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <h3 className="font-headline font-bold text-base leading-tight mb-0.5">{businessSpotlight.name}</h3>
                        <p className="font-mono text-[10px] uppercase tracking-wide text-foreground/60 mb-1">{businessSpotlight.businessType}</p>
                        <p className="text-sm leading-snug text-foreground/80 line-clamp-4">{businessSpotlight.description}</p>
                      </div>
                    )}

                    {groupSpotlight && (
                      <div className="border-b border-foreground/30 pb-4">
                        <div className="font-mono text-[10px] uppercase tracking-widest border-b border-foreground pb-1 mb-2">Group Spotlight</div>
                        {groupSpotlight.photoUrl && (
                          <div className="w-full aspect-[4/3] overflow-hidden border border-foreground mb-2 bg-muted">
                            <img src={groupSpotlight.photoUrl} alt={groupSpotlight.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <h3 className="font-headline font-bold text-base leading-tight mb-0.5">{groupSpotlight.name}</h3>
                        <p className="font-mono text-[10px] uppercase tracking-wide text-foreground/60 mb-1">{groupSpotlight.groupType}</p>
                        <p className="text-sm leading-snug text-foreground/80 line-clamp-4">{groupSpotlight.description}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Main featured article */}
                <div className={hasSpotlights ? "w-full md:w-[72%] md:pl-6" : "w-full"}>
                  {mainArticle ? (
                    <article>
                      {mainArticle.photoUrl && (
                        <div className="w-full overflow-hidden border border-foreground mb-4 bg-muted" style={{ maxHeight: "340px" }}>
                          <img src={mainArticle.photoUrl} alt={mainArticle.title} className="w-full h-full object-cover" style={{ maxHeight: "340px" }} />
                          {mainArticle.photoCredit && (
                            <p className="font-mono text-[9px] text-right text-foreground/50 p-1 italic">Photo: {mainArticle.photoCredit}</p>
                          )}
                        </div>
                      )}
                      <Link href={`/articles/${mainArticle.id}`}>
                        <h1 className="font-headline font-bold text-4xl md:text-5xl lg:text-6xl leading-tight mb-3 hover:underline underline-offset-4 decoration-1">
                          {mainArticle.title}
                        </h1>
                      </Link>
                      {mainArticle.subtitle && (
                        <p className="font-headline italic text-xl md:text-2xl text-foreground/80 mb-3">
                          {mainArticle.subtitle}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-foreground/60 mb-4 border-t border-b border-foreground/20 py-2">
                        <span>By <span className="italic">{mainArticle.author}</span></span>
                        <span>·</span>
                        <span>{mainArticle.category}</span>
                        <span>·</span>
                        <span>{formatDateline(mainArticle.publishedAt)}</span>
                      </div>
                      <div className="columns-1 md:columns-2 gap-6 font-serif text-lg leading-relaxed text-foreground/90">
                        {mainArticle.content.split('\n\n').map((para, i) => (
                          <p key={i} className={i === 0 ? "first-letter-drop" : "mt-4"}>
                            {i === 0 && (
                              <span className="font-mono font-bold text-xs uppercase tracking-wider mr-2">
                                {formatDateline(mainArticle.publishedAt)}—
                              </span>
                            )}
                            {para}
                          </p>
                        ))}
                      </div>
                    </article>
                  ) : (
                    <p className="text-sm font-serif italic text-foreground/50">No featured story this week.</p>
                  )}
                </div>
              </div>

              {/* ── Page 2 Top Story (full width) ── */}
              {page2Article && (
                <div className="mb-8 pb-8 border-b-2 border-foreground">
                  <div className="font-mono text-xs uppercase tracking-widest border-b-2 border-foreground pb-1 mb-6">Featured</div>
                  <article>
                    {page2Article.photoUrl && (
                      <div className="mb-4 text-center">
                        <img
                          src={page2Article.photoUrl}
                          alt={page2Article.title}
                          className="inline-block max-h-72 max-w-full object-contain border border-foreground"
                        />
                        {page2Article.photoCredit && (
                          <p className="font-mono text-[9px] text-right text-foreground/50 italic mt-1">Photo: {page2Article.photoCredit}</p>
                        )}
                      </div>
                    )}
                    <Link href={`/articles/${page2Article.id}`}>
                      <h2 className="font-headline font-bold text-3xl md:text-4xl lg:text-5xl leading-tight mb-3 hover:underline underline-offset-4 decoration-1">
                        {page2Article.title}
                      </h2>
                    </Link>
                    {page2Article.subtitle && (
                      <p className="font-headline italic text-xl text-foreground/80 mb-3">{page2Article.subtitle}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-foreground/60 mb-4 border-t border-b border-foreground/20 py-2">
                      <span>By <span className="italic">{page2Article.author}</span></span>
                      <span>·</span>
                      <span>{page2Article.category}</span>
                      <span>·</span>
                      <span>{formatDateline(page2Article.publishedAt)}</span>
                    </div>
                    <div className="columns-1 md:columns-2 gap-6 font-serif text-base leading-relaxed text-foreground/90">
                      {page2Article.content.split('\n\n').map((para: string, i: number) => (
                        <p key={i} className={i > 0 ? "mt-4" : ""}>
                          {i === 0 && (
                            <span className="font-mono font-bold text-xs uppercase tracking-wider mr-2">
                              {formatDateline(page2Article.publishedAt)}—
                            </span>
                          )}
                          {para}
                        </p>
                      ))}
                    </div>
                  </article>
                </div>
              )}

              {/* ── Letters from / to the Editor (full width) ── */}
              {letterArticles.length > 0 && (
                <div className="mb-8 pb-8 border-b-2 border-foreground">
                  <div className="font-mono text-xs uppercase tracking-widest border-b-2 border-foreground pb-1 mb-6">Letters</div>
                  <div className="flex flex-col gap-10">
                    {letterArticles.map(art => (
                      <article key={art.id}>
                        <Link href={`/articles/${art.id}`}>
                          <h2 className="font-headline font-bold text-3xl md:text-4xl leading-tight mb-2 hover:underline underline-offset-4 decoration-1">
                            {art.title}
                          </h2>
                        </Link>
                        {art.subtitle && (
                          <p className="font-headline italic text-lg text-foreground/80 mb-2">{art.subtitle}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-foreground/60 mb-4 border-t border-b border-foreground/20 py-2">
                          <span>By <span className="italic">{art.author}</span></span>
                          <span>·</span>
                          <span>{formatDateline(art.publishedAt)}</span>
                        </div>
                        <div className="columns-1 md:columns-2 gap-6 font-serif text-base leading-relaxed text-foreground/90">
                          {art.content.split('\n\n').map((para, i) => (
                            <p key={i} className={i > 0 ? "mt-4" : ""}>
                              {i === 0 && (
                                <span className="font-mono font-bold text-xs uppercase tracking-wider mr-2">
                                  {formatDateline(art.publishedAt)}—
                                </span>
                              )}
                              {para}
                            </p>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* ── More from the community ── */}
              {otherArticles.length > 0 && (
                <div className="mb-8 pb-8 border-b-2 border-foreground">
                  <div className="font-mono text-xs uppercase tracking-widest border-b-2 border-foreground pb-1 mb-6">More From the Community</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-foreground/30">
                    {otherArticles.map((art, i) => (
                      <div key={art.id} className={i > 0 ? "md:pl-6 pt-6 md:pt-0" : ""}>
                        <ArticleTeaser article={art} size="standard" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Church Directory ── */}
              <ChurchDirectory />

              {/* ── Community Calendar ── */}
              <div className="mt-8 border-t-2 border-foreground pt-6">
                <CalendarEvents />
              </div>
            </>
          )}
        </Layout>
      </div>

      {/* ── Print-only layout ── */}
      <div id="print-view-wrapper">
        <PrintView />
      </div>
    </>
  );
}
