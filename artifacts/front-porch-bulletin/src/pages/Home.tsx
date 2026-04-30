import { useEffect } from "react";
import {
  useGetFeaturedArticles,
  useGetSpotlight, getGetSpotlightQueryKey,
  useGetBusinessSpotlight, getGetBusinessSpotlightQueryKey,
  useGetGroupSpotlight, getGetGroupSpotlightQueryKey,
  useListArticles, getListArticlesQueryKey,
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { ArticleTeaser } from "@/components/ArticleTeaser";
import { NewspaperSkeleton } from "@/components/ui/newspaper-skeleton";
import { ChurchDirectory } from "@/components/ChurchDirectory";
import { CalendarEvents } from "@/components/CalendarEvents";
import { PrintView } from "@/components/PrintView";
import { Link } from "wouter";

const isLetter = (art: { category: string }) =>
  art.category?.toLowerCase() === "letters";

export default function Home() {
  const { data: featuredData, isLoading: isLoadingFeatured } = useGetFeaturedArticles();
  const { data: spotlight,         isLoading: isLoadingSpotlight }         = useGetSpotlight({ query: { queryKey: getGetSpotlightQueryKey(), retry: false } as any });
  const { data: businessSpotlight, isLoading: isLoadingBusiness }          = useGetBusinessSpotlight({ query: { queryKey: getGetBusinessSpotlightQueryKey(), retry: false } as any });
  const { data: groupSpotlight,    isLoading: isLoadingGroup }             = useGetGroupSpotlight({ query: { queryKey: getGetGroupSpotlightQueryKey(), retry: false } as any });

  const { data: libraryData,   isLoading: isLoadingLibrary }   = useListArticles({ category: "Library News", limit: 10 }, { query: { queryKey: getListArticlesQueryKey({ category: "Library News", limit: 10 }) } });
  const { data: h4Data,        isLoading: isLoadingH4 }        = useListArticles({ category: "4H News",      limit: 10 }, { query: { queryKey: getListArticlesQueryKey({ category: "4H News",      limit: 10 }) } });
  const { data: communityData, isLoading: isLoadingCommunity } = useListArticles({ category: "Community",    limit: 10 }, { query: { queryKey: getListArticlesQueryKey({ category: "Community",    limit: 10 }) } });

  const isLoading = isLoadingFeatured || isLoadingSpotlight || isLoadingBusiness || isLoadingGroup || isLoadingLibrary || isLoadingH4 || isLoadingCommunity;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("print") === "1" && !isLoading) {
      // Extra delay for PrintView's bare fetch() calls: churches, calendar events, issue settings
      const timer = setTimeout(() => window.print(), 2500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const libraryArticles   = libraryData?.articles   ?? [];
  const h4Articles        = h4Data?.articles        ?? [];
  const communityArticles = communityData?.articles ?? [];

  const mainArticle  = featuredData?.frontPage?.[0] ?? null;
  const page2Article = (featuredData as any)?.page2 ?? null;

  const DEDICATED = new Set(["Library News", "4H News", "Community"]);

  // Remaining featured/secondary articles — deduplicated against dedicated sections
  const allOtherArticles = [
    ...(featuredData?.frontPage?.slice(1) ?? []),
    ...(featuredData?.secondary ?? []),
  ].filter(a => a.id !== page2Article?.id && !DEDICATED.has(a.category));
  const letterArticles = allOtherArticles.filter(isLetter);
  const otherArticles  = allOtherArticles.filter(a => !isLetter(a));

  return (
    <>
      {/* ── Screen layout ── */}
      <div className="screen-layout">
        <Layout>
          {isLoading ? (
            <NewspaperSkeleton />
          ) : (
            <>
              {/* ── Front page: full width with spotlight floated bottom-left ── */}
              <div className="border-b-2 border-foreground mb-8 pb-8">
                {mainArticle ? (
                  <article>
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
                    </div>
                    <div className="font-serif text-lg leading-relaxed text-foreground/90">
                      {/* Spotlight floated right — article text wraps alongside it from the top */}
                      {spotlight && (
                        <div className="float-right ml-6 mb-2 w-[280px] border-t-2 border-foreground pt-3">
                          <div className="font-mono text-[10px] uppercase tracking-widest border-b border-foreground pb-1 mb-2">Student Spotlight</div>
                          {spotlight.photoUrl && (
                            <div className="w-full overflow-hidden border border-foreground mb-2">
                              <img src={spotlight.photoUrl} alt={spotlight.name} className="w-full block" />
                            </div>
                          )}
                          <h3 className="font-headline font-bold text-base leading-tight mb-0.5">{spotlight.name}</h3>
                          <p className="font-mono text-[10px] uppercase tracking-wide text-foreground/60 mb-1">{spotlight.school} · {spotlight.grade}</p>
                          <p className="text-sm leading-snug text-foreground/80">{spotlight.description}</p>
                        </div>
                      )}
                      {mainArticle.photoUrl && (
                        <div className="float-left mr-4 mb-2 max-w-[40%]">
                          <img src={mainArticle.photoUrl} alt={mainArticle.title} className="block max-w-full h-auto" />
                          {mainArticle.photoCredit && (
                            <p className="font-mono text-[8px] text-right text-foreground/40 italic mt-0.5">Photo: {mainArticle.photoCredit}</p>
                          )}
                        </div>
                      )}
                      {mainArticle.content.split('\n\n').map((para, i) => (
                        <p key={i} className={i === 0 ? "first-letter-drop" : "mt-4"}>{para}</p>
                      ))}
                      <div className="clear-both" />
                    </div>
                  </article>
                ) : (
                  <p className="text-sm font-serif italic text-foreground/50">No featured story this week.</p>
                )}
              </div>

              {/* ── Business Spotlight (full width) ── */}
              {businessSpotlight && (
                <div className="mb-8 pb-8 border-b-2 border-foreground">
                  <div className="font-mono text-xs uppercase tracking-widest border-b-2 border-foreground pb-1 mb-5">Business Spotlight</div>
                  <div>
                    {businessSpotlight.photoUrl && (
                      <div className="float-left mr-6 mb-3 overflow-hidden border border-foreground/20" style={{ width: "280px" }}>
                        <img src={businessSpotlight.photoUrl} alt={businessSpotlight.name} className="w-full block" />
                      </div>
                    )}
                    <h3 className="font-headline font-bold text-2xl leading-tight mb-1">{businessSpotlight.name}</h3>
                    {businessSpotlight.businessType && (
                      <p className="font-mono text-[10px] uppercase tracking-wide text-foreground/60 mb-3">{businessSpotlight.businessType}</p>
                    )}
                    <div className="font-serif text-base leading-relaxed text-foreground/80">
                      {businessSpotlight.description.split('\n\n').map((para, i) => (
                        <p key={i} className={i > 0 ? "mt-3" : ""}>
                          {para.split('\n').map((line, j) => (
                            j === 0 ? line : <>{'\n'}<br />{line}</>
                          ))}
                        </p>
                      ))}
                    </div>
                    <div className="clear-both" />
                  </div>
                </div>
              )}

              {/* ── Group Spotlight (full width) ── */}
              {groupSpotlight && (
                <div className="mb-8 pb-8 border-b-2 border-foreground">
                  <div className="font-mono text-xs uppercase tracking-widest border-b-2 border-foreground pb-1 mb-5">Group Spotlight</div>
                  <div>
                    {groupSpotlight.photoUrl && (
                      <div className="float-left mr-6 mb-3 overflow-hidden border border-foreground/20" style={{ width: "280px" }}>
                        <img src={groupSpotlight.photoUrl} alt={groupSpotlight.name} className="w-full block" />
                      </div>
                    )}
                    <h3 className="font-headline font-bold text-2xl leading-tight mb-1">{groupSpotlight.name}</h3>
                    {groupSpotlight.groupType && (
                      <p className="font-mono text-[10px] uppercase tracking-wide text-foreground/60 mb-3">{groupSpotlight.groupType}</p>
                    )}
                    <div className="font-serif text-base leading-relaxed text-foreground/80">
                      {groupSpotlight.description.split('\n\n').map((para, i) => (
                        <p key={i} className={i > 0 ? "mt-3" : ""}>
                          {para.split('\n').map((line, j) => (
                            j === 0 ? line : <>{'\n'}<br />{line}</>
                          ))}
                        </p>
                      ))}
                    </div>
                    <div className="clear-both" />
                  </div>
                </div>
              )}

              {/* ── Page 2 Top Story (full width) ── */}
              {page2Article && (
                <div className="mb-8 pb-8 border-b-2 border-foreground">
                  <div className="font-mono text-xs uppercase tracking-widest border-b-2 border-foreground pb-1 mb-6">Page 2 Feature</div>
                  <article>
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
                    </div>
                    <div className="font-serif text-base leading-relaxed text-foreground/90">
                      {page2Article.photoUrl && (
                        <div className="float-left mr-4 mb-2 max-w-[45%]">
                          <img src={page2Article.photoUrl} alt={page2Article.title} className="block max-w-full h-auto" />
                          {page2Article.photoCredit && (
                            <p className="font-mono text-[8px] text-right text-foreground/40 italic mt-0.5">Photo: {page2Article.photoCredit}</p>
                          )}
                        </div>
                      )}
                      {page2Article.content.split('\n\n').map((para: string, i: number) => (
                        <p key={i} className={i > 0 ? "mt-4" : ""}>{para}</p>
                      ))}
                      <div className="clear-both" />
                    </div>
                  </article>
                </div>
              )}

              {/* ── 4H News (left) | Community (right) — two columns ── */}
              <div className="mb-8 pb-8 border-b-2 border-foreground">
                <div className="grid grid-cols-2 gap-0 divide-x-2 divide-foreground">
                  {/* 4H News — left */}
                  <div className="pr-6">
                    <div className="font-mono text-xs uppercase tracking-widest border-b-2 border-foreground pb-1 mb-5">4H News</div>
                    {h4Articles.length > 0 ? (
                      <div className="flex flex-col gap-6">
                        {h4Articles.map(art => (
                          <article key={art.id}>
                            {art.photoUrl && (
                              <div className="mb-2 max-w-[50%]">
                                <img src={art.photoUrl} alt={art.title} className="block max-w-full h-auto" />
                                {art.photoCredit && <p className="font-mono text-[8px] text-right text-foreground/40 italic mt-0.5">Photo: {art.photoCredit}</p>}
                              </div>
                            )}
                            <Link href={`/articles/${art.id}`}>
                              <h3 className="font-headline font-bold text-2xl leading-tight mb-1 hover:underline underline-offset-4 decoration-1">{art.title}</h3>
                            </Link>
                            {art.subtitle && <p className="font-headline italic text-base text-foreground/70 mb-1">{art.subtitle}</p>}
                            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wide text-foreground/50 border-t border-b border-foreground/20 py-1 mb-2">
                              <span>By <span className="italic">{art.author}</span></span>
                            </div>
                            <div className="font-serif text-sm leading-relaxed text-foreground/80 space-y-2">
                              {art.content.split('\n\n').map((para, i) => (
                                <p key={i}>{para}</p>
                              ))}
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="font-serif italic text-sm text-foreground/40">No 4H news this issue.</p>
                    )}
                  </div>

                  {/* Community — right */}
                  <div className="pl-6">
                    <div className="font-mono text-xs uppercase tracking-widest border-b-2 border-foreground pb-1 mb-5">Community</div>
                    {communityArticles.length > 0 ? (
                      <div className="flex flex-col gap-6">
                        {communityArticles.map(art => (
                          <article key={art.id}>
                            {art.photoUrl && (
                              <div className="mb-2 max-w-[50%]">
                                <img src={art.photoUrl} alt={art.title} className="block max-w-full h-auto" />
                                {art.photoCredit && <p className="font-mono text-[8px] text-right text-foreground/40 italic mt-0.5">Photo: {art.photoCredit}</p>}
                              </div>
                            )}
                            <Link href={`/articles/${art.id}`}>
                              <h3 className="font-headline font-bold text-2xl leading-tight mb-1 hover:underline underline-offset-4 decoration-1">{art.title}</h3>
                            </Link>
                            {art.subtitle && <p className="font-headline italic text-base text-foreground/70 mb-1">{art.subtitle}</p>}
                            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wide text-foreground/50 border-t border-b border-foreground/20 py-1 mb-2">
                              <span>By <span className="italic">{art.author}</span></span>
                            </div>
                            <p className="font-serif text-sm leading-relaxed text-foreground/80 line-clamp-4">{art.content.split('\n\n')[0]}</p>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="font-serif italic text-sm text-foreground/40">No community news this issue.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Library News — full width ── */}
              <div className="mb-8 pb-8 border-b-2 border-foreground">
                <div className="font-mono text-xs uppercase tracking-widest border-b-2 border-foreground pb-1 mb-5">Library News</div>
                {libraryArticles.length > 0 ? (
                  <div className="flex flex-col gap-8 divide-y divide-foreground/30">
                    {libraryArticles.map((art, i) => (
                      <article key={art.id} className={i > 0 ? "pt-6" : ""}>
                        <Link href={`/articles/${art.id}`}>
                          <h3 className="font-headline font-bold text-2xl leading-tight mb-1 hover:underline underline-offset-4 decoration-1">{art.title}</h3>
                        </Link>
                        {art.subtitle && <p className="font-headline italic text-base text-foreground/70 mb-1">{art.subtitle}</p>}
                        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wide text-foreground/50 border-t border-b border-foreground/20 py-1 mb-2">
                          <span>By <span className="italic">{art.author}</span></span>
                        </div>
                        <div className="font-serif text-sm leading-relaxed text-foreground/80">
                          {art.photoUrl && (
                            <div className="float-left mr-3 mb-1 max-w-[40%]">
                              <img src={art.photoUrl} alt={art.title} className="block max-w-full h-auto" />
                              {art.photoCredit && <p className="font-mono text-[7px] text-right text-foreground/40 italic mt-0.5">Photo: {art.photoCredit}</p>}
                            </div>
                          )}
                          <p>{art.content.split('\n\n')[0]}</p>
                          <div className="clear-both" />
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="font-serif italic text-sm text-foreground/40">No library news this issue.</p>
                )}
              </div>

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
                        </div>
                        <div className="font-serif text-base leading-relaxed text-foreground/90">
                          {art.photoUrl && (
                            <div className="float-left mr-4 mb-2 max-w-[45%]">
                              <img src={art.photoUrl} alt={art.title} className="block max-w-full h-auto" />
                              {art.photoCredit && <p className="font-mono text-[8px] text-right text-foreground/40 italic mt-0.5">Photo: {art.photoCredit}</p>}
                            </div>
                          )}
                          {art.content.split('\n\n').map((para, i) => (
                            <p key={i} className={i > 0 ? "mt-4" : ""}>{para}</p>
                          ))}
                          <div className="clear-both" />
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
