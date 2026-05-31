import { useEffect } from "react";
import {
  useGetFeaturedArticles,
  useGetSpotlight, getGetSpotlightQueryKey,
  useGetBusinessSpotlight, getGetBusinessSpotlightQueryKey,
  useGetGroupSpotlight, getGetGroupSpotlightQueryKey,
  useListArticles, getListArticlesQueryKey,
  useGetComic, getGetComicQueryKey,
  useGetPuzzles, getGetPuzzlesQueryKey,
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { ArticleTeaser } from "@/components/ArticleTeaser";
import { NewspaperSkeleton } from "@/components/ui/newspaper-skeleton";
import { ChurchDirectory } from "@/components/ChurchDirectory";
import { CalendarEvents } from "@/components/CalendarEvents";
import { PrintView } from "@/components/PrintView";
import { Link } from "wouter";
import { useUser } from "@clerk/react";

const isLetter = (art: { category: string }) =>
  art.category?.toLowerCase() === "letters";

function DraftBadge() {
  return (
    <span className="inline-block text-[9px] font-mono uppercase tracking-widest border border-amber-600 bg-amber-50 text-amber-700 px-1.5 py-0.5 align-middle mr-2 leading-none">
      Draft
    </span>
  );
}

export default function Home() {
  const { user } = useUser();
  const isStaff = !!user;

  const { data: featuredData, isLoading: isLoadingFeatured } = useGetFeaturedArticles();
  const { data: spotlight,         isLoading: isLoadingSpotlight }         = useGetSpotlight({ query: { queryKey: getGetSpotlightQueryKey(), retry: false } as any });
  const { data: businessSpotlight, isLoading: isLoadingBusiness }          = useGetBusinessSpotlight({ query: { queryKey: getGetBusinessSpotlightQueryKey(), retry: false } as any });
  const { data: groupSpotlight,    isLoading: isLoadingGroup }             = useGetGroupSpotlight({ query: { queryKey: getGetGroupSpotlightQueryKey(), retry: false } as any });

  const { data: libraryData,   isLoading: isLoadingLibrary }   = useListArticles({ category: "Library News", limit: 10 }, { query: { queryKey: getListArticlesQueryKey({ category: "Library News", limit: 10 }) } });
  const { data: h4Data,        isLoading: isLoadingH4 }        = useListArticles({ category: "4H News",      limit: 10 }, { query: { queryKey: getListArticlesQueryKey({ category: "4H News",      limit: 10 }) } });
  const { data: communityData, isLoading: isLoadingCommunity } = useListArticles({ category: "Community",    limit: 10 }, { query: { queryKey: getListArticlesQueryKey({ category: "Community",    limit: 10 }) } });
  const { data: comic }        = useGetComic({ query: { queryKey: getGetComicQueryKey(), retry: false } as any });
  const { data: puzzles }      = useGetPuzzles({ query: { queryKey: getGetPuzzlesQueryKey(), retry: false } as any });

  const isLoading = isLoadingFeatured || isLoadingSpotlight || isLoadingBusiness || isLoadingGroup || isLoadingLibrary || isLoadingH4 || isLoadingCommunity;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("print") === "1" && !isLoading) {
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

  const allOtherArticles = [
    ...(featuredData?.frontPage?.slice(1) ?? []),
    ...(featuredData?.secondary ?? []),
  ].filter(a => a.id !== page2Article?.id && !DEDICATED.has(a.category));
  const letterArticles = allOtherArticles.filter(isLetter);
  const otherArticles  = allOtherArticles.filter(a => !isLetter(a));

  /* ── Reusable spotlight card (used in both mobile standalone + desktop sidebar) ── */
  function SpotlightCard({ full }: { full?: boolean }) {
    if (!spotlight) return null;
    return (
      <div className={full ? "border-t-2 border-foreground pt-3" : "border-t-2 border-foreground pt-3"}>
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
    );
  }

  return (
    <>
      {/* ── Screen layout ── */}
      <div className="screen-layout">
        {isStaff && (
          <div className="no-print bg-amber-100 border-b-2 border-amber-600 py-2 px-5 flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-amber-800">
            <span>Staff Preview — draft articles are visible</span>
            <Link href="/admin" className="font-bold underline underline-offset-2 hover:no-underline">Editorial Desk →</Link>
          </div>
        )}
        <Layout>
          {isLoading ? (
            <NewspaperSkeleton />
          ) : (
            <>
              {/* ── Front Page News ── */}
              <div className="border-b-2 border-foreground mb-8 pb-8">
                {mainArticle ? (
                  <article>
                    <Link href={`/articles/${mainArticle.id}`}>
                      <h1 className="font-headline font-bold text-4xl md:text-5xl lg:text-6xl leading-tight mb-3 hover:underline underline-offset-4 decoration-1">
                        {isStaff && mainArticle.status === 'draft' && <DraftBadge />}{mainArticle.title}
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
                      {/* Desktop: spotlight floated right inside article */}
                      {spotlight && spotlight.status !== "disabled" && (
                        <div className="hidden md:block float-right ml-6 mb-2 w-[280px] border-t-2 border-foreground pt-3">
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
                      {/* Article photo: full-width on mobile, floated on desktop */}
                      {mainArticle.photoUrl && (
                        <>
                          <div className="block md:hidden w-full mb-3">
                            <img src={mainArticle.photoUrl} alt={mainArticle.title} className="w-full block" />
                            {mainArticle.photoCredit && (
                              <p className="font-mono text-[8px] text-right text-foreground/40 italic mt-0.5">Photo: {mainArticle.photoCredit}</p>
                            )}
                          </div>
                          <div className="hidden md:block float-left mr-4 mb-2 max-w-[40%]">
                            <img src={mainArticle.photoUrl} alt={mainArticle.title} className="block max-w-full h-auto" />
                            {mainArticle.photoCredit && (
                              <p className="font-mono text-[8px] text-right text-foreground/40 italic mt-0.5">Photo: {mainArticle.photoCredit}</p>
                            )}
                          </div>
                        </>
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

              {/* ── Student Spotlight (mobile only — desktop sees it inside the article above) ── */}
              {spotlight && spotlight.status !== "disabled" && (
                <div className="md:hidden mb-8 pb-8 border-b-2 border-foreground">
                  <SpotlightCard full />
                </div>
              )}

              {/* ── Business Spotlight ── */}
              {businessSpotlight && businessSpotlight.status !== "disabled" && (
                <div className="mb-8 pb-8 border-b-2 border-foreground">
                  <div className="font-mono text-xs uppercase tracking-widest border-b-2 border-foreground pb-1 mb-5">Business Spotlight</div>
                  <div>
                    {businessSpotlight.photoUrl && (
                      <>
                        {/* Mobile: full-width photo above text */}
                        <div className="block md:hidden w-full overflow-hidden border border-foreground/20 mb-3">
                          <img src={businessSpotlight.photoUrl} alt={businessSpotlight.name} className="w-full block" />
                        </div>
                        {/* Desktop: floated left */}
                        <div className="hidden md:block float-left mr-6 mb-3 overflow-hidden border border-foreground/20" style={{ width: "280px" }}>
                          <img src={businessSpotlight.photoUrl} alt={businessSpotlight.name} className="w-full block" />
                        </div>
                      </>
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

              {/* ── Group Spotlight ── */}
              {groupSpotlight && groupSpotlight.status !== "disabled" && (
                <div className="mb-8 pb-8 border-b-2 border-foreground">
                  <div className="font-mono text-xs uppercase tracking-widest border-b-2 border-foreground pb-1 mb-5">Group Spotlight</div>
                  <div>
                    {groupSpotlight.photoUrl && (
                      <>
                        {/* Mobile: full-width photo above text */}
                        <div className="block md:hidden w-full overflow-hidden border border-foreground/20 mb-3">
                          <img src={groupSpotlight.photoUrl} alt={groupSpotlight.name} className="w-full block" />
                        </div>
                        {/* Desktop: floated left */}
                        <div className="hidden md:block float-left mr-6 mb-3 overflow-hidden border border-foreground/20" style={{ width: "280px" }}>
                          <img src={groupSpotlight.photoUrl} alt={groupSpotlight.name} className="w-full block" />
                        </div>
                      </>
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

              {/* ── Page 2 Top Story ── */}
              {page2Article && (
                <div className="mb-8 pb-8 border-b-2 border-foreground">
                  <div className="font-mono text-xs uppercase tracking-widest border-b-2 border-foreground pb-1 mb-6">Page 2 Feature</div>
                  <article>
                    <Link href={`/articles/${page2Article.id}`}>
                      <h2 className="font-headline font-bold text-3xl md:text-4xl lg:text-5xl leading-tight mb-3 hover:underline underline-offset-4 decoration-1">
                        {isStaff && page2Article.status === 'draft' && <DraftBadge />}{page2Article.title}
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
                        <>
                          <div className="block md:hidden w-full mb-3">
                            <img src={page2Article.photoUrl} alt={page2Article.title} className="w-full block" />
                            {page2Article.photoCredit && (
                              <p className="font-mono text-[8px] text-right text-foreground/40 italic mt-0.5">Photo: {page2Article.photoCredit}</p>
                            )}
                          </div>
                          <div className="hidden md:block float-left mr-4 mb-2 max-w-[45%]">
                            <img src={page2Article.photoUrl} alt={page2Article.title} className="block max-w-full h-auto" />
                            {page2Article.photoCredit && (
                              <p className="font-mono text-[8px] text-right text-foreground/40 italic mt-0.5">Photo: {page2Article.photoCredit}</p>
                            )}
                          </div>
                        </>
                      )}
                      {page2Article.content.split('\n\n').map((para: string, i: number) => (
                        <p key={i} className={i > 0 ? "mt-4" : ""}>{para}</p>
                      ))}
                      <div className="clear-both" />
                    </div>
                  </article>
                </div>
              )}

              {/* ── 4H News ── */}
              {h4Articles.length > 0 && (
                <div className="mb-8 pb-8 border-b-2 border-foreground">
                  <div className="font-mono text-xs uppercase tracking-widest border-b-2 border-foreground pb-1 mb-5">4H News</div>
                  <div className="flex flex-col gap-6">
                    {h4Articles.map(art => (
                      <article key={art.id} className="overflow-hidden">
                        <Link href={`/articles/${art.id}`}>
                          <h3 className="font-headline font-bold text-2xl leading-tight mb-1 hover:underline underline-offset-4 decoration-1">{isStaff && art.status === 'draft' && <DraftBadge />}{art.title}</h3>
                        </Link>
                        {art.subtitle && <p className="font-headline italic text-base text-foreground/70 mb-1">{art.subtitle}</p>}
                        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wide text-foreground/50 border-t border-b border-foreground/20 py-1 mb-2">
                          <span>By <span className="italic">{art.author}</span></span>
                        </div>
                        <div className="font-serif text-sm leading-relaxed text-foreground/80">
                          {art.photoUrl && (
                            <>
                              <div className="block md:hidden w-full mb-2">
                                <img src={art.photoUrl} alt={art.title} className="w-full block" />
                                {art.photoCredit && <p className="font-mono text-[8px] text-right text-foreground/40 italic mt-0.5">Photo: {art.photoCredit}</p>}
                              </div>
                              <div className="hidden md:block float-left mr-3 mb-1 max-w-[42%]">
                                <img src={art.photoUrl} alt={art.title} className="block max-w-full h-auto" />
                                {art.photoCredit && <p className="font-mono text-[8px] text-right text-foreground/40 italic mt-0.5">Photo: {art.photoCredit}</p>}
                              </div>
                            </>
                          )}
                          <div className="space-y-2">
                            {art.content.split('\n\n').map((para, i) => (
                              <p key={i}>{para}</p>
                            ))}
                          </div>
                          <div className="clear-both" />
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Community ── */}
              {communityArticles.length > 0 && (
                <div className="mb-8 pb-8 border-b-2 border-foreground">
                  <div className="font-mono text-xs uppercase tracking-widest border-b-2 border-foreground pb-1 mb-5">Community</div>
                  <div className="flex flex-col gap-6">
                    {communityArticles.map(art => (
                      <article key={art.id} className="overflow-hidden">
                        <Link href={`/articles/${art.id}`}>
                          <h3 className="font-headline font-bold text-2xl leading-tight mb-1 hover:underline underline-offset-4 decoration-1">{isStaff && art.status === 'draft' && <DraftBadge />}{art.title}</h3>
                        </Link>
                        {art.subtitle && <p className="font-headline italic text-base text-foreground/70 mb-1">{art.subtitle}</p>}
                        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wide text-foreground/50 border-t border-b border-foreground/20 py-1 mb-2">
                          <span>By <span className="italic">{art.author}</span></span>
                        </div>
                        <div className="font-serif text-sm leading-relaxed text-foreground/80">
                          {art.photoUrl && (
                            <>
                              <div className="block md:hidden w-full mb-2">
                                <img src={art.photoUrl} alt={art.title} className="w-full h-48 object-cover block" />
                                {art.photoCredit && <p className="font-mono text-[8px] text-right text-foreground/40 italic mt-0.5">Photo: {art.photoCredit}</p>}
                              </div>
                              <div className="hidden md:block float-left mr-3 mb-1 w-[30%]">
                                <img src={art.photoUrl} alt={art.title} className="block w-full object-cover" style={{ height: "400px" }} />
                                {art.photoCredit && <p className="font-mono text-[8px] text-right text-foreground/40 italic mt-0.5">Photo: {art.photoCredit}</p>}
                              </div>
                            </>
                          )}
                          <div className="space-y-2">
                            {art.content.split('\n\n').map((para, i) => (
                              <p key={i}>{para}</p>
                            ))}
                          </div>
                          <div className="clear-both" />
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Library News ── */}
              {libraryArticles.length > 0 && (
                <div className="mb-8 pb-8 border-b-2 border-foreground">
                  <div className="font-mono text-xs uppercase tracking-widest border-b-2 border-foreground pb-1 mb-5">Library News</div>
                  <div className="flex flex-col gap-8 divide-y divide-foreground/30">
                    {libraryArticles.map((art, i) => (
                      <article key={art.id} className={`overflow-hidden${i > 0 ? " pt-6" : ""}`}>
                        <Link href={`/articles/${art.id}`}>
                          <h3 className="font-headline font-bold text-2xl leading-tight mb-1 hover:underline underline-offset-4 decoration-1">{isStaff && art.status === 'draft' && <DraftBadge />}{art.title}</h3>
                        </Link>
                        {art.subtitle && <p className="font-headline italic text-base text-foreground/70 mb-1">{art.subtitle}</p>}
                        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wide text-foreground/50 border-t border-b border-foreground/20 py-1 mb-2">
                          <span>By <span className="italic">{art.author}</span></span>
                        </div>
                        <div className="font-serif text-sm leading-relaxed text-foreground/80">
                          {art.photoUrl && (
                            <>
                              <div className="block md:hidden w-full mb-2">
                                <img src={art.photoUrl} alt={art.title} className="w-full block h-[200px] object-cover" />
                                {art.photoCredit && <p className="font-mono text-[7px] text-right text-foreground/40 italic mt-0.5">Photo: {art.photoCredit}</p>}
                              </div>
                              <div className="hidden md:block float-left mr-3 mb-1 w-[30%]">
                                <img src={art.photoUrl} alt={art.title} className="block w-full h-[200px] object-cover" />
                                {art.photoCredit && <p className="font-mono text-[7px] text-right text-foreground/40 italic mt-0.5">Photo: {art.photoCredit}</p>}
                              </div>
                            </>
                          )}
                          {art.content.split('\n\n').map((para, i) => (
                            <p key={i} className={i > 0 ? "mt-2" : ""}>{para}</p>
                          ))}
                          <div className="clear-both" />
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Letters ── */}
              {letterArticles.length > 0 && (
                <div className="mb-8 pb-8 border-b-2 border-foreground">
                  <div className="font-mono text-xs uppercase tracking-widest border-b-2 border-foreground pb-1 mb-6">Letters</div>
                  <div className="flex flex-col gap-10">
                    {letterArticles.map(art => (
                      <article key={art.id}>
                        <Link href={`/articles/${art.id}`}>
                          <h2 className="font-headline font-bold text-3xl md:text-4xl leading-tight mb-2 hover:underline underline-offset-4 decoration-1">
                            {isStaff && art.status === 'draft' && <DraftBadge />}{art.title}
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
                            <>
                              <div className="block md:hidden w-full mb-3">
                                <img src={art.photoUrl} alt={art.title} className="w-full block" />
                                {art.photoCredit && <p className="font-mono text-[8px] text-right text-foreground/40 italic mt-0.5">Photo: {art.photoCredit}</p>}
                              </div>
                              <div className="hidden md:block float-left mr-4 mb-2 max-w-[45%]">
                                <img src={art.photoUrl} alt={art.title} className="block max-w-full h-auto" />
                                {art.photoCredit && <p className="font-mono text-[8px] text-right text-foreground/40 italic mt-0.5">Photo: {art.photoCredit}</p>}
                              </div>
                            </>
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
                        {isStaff && art.status === 'draft' && (
                          <span className="inline-block text-[9px] font-mono uppercase tracking-widest border border-amber-600 bg-amber-50 text-amber-700 px-1.5 py-0.5 leading-none mb-1">Draft</span>
                        )}
                        <ArticleTeaser article={art} size="standard" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Comics ── */}
              {comic?.imageUrl && (
                <div className="mb-8 pb-8 border-b-2 border-foreground">
                  <div className="font-mono text-xs uppercase tracking-widest border-b-2 border-foreground pb-1 mb-5">Comics</div>
                  <img
                    src={comic.imageUrl}
                    alt="Comic strip"
                    className="block w-1/2 mx-auto"
                  />
                  {comic.caption && (
                    <p className="font-mono text-[10px] text-foreground/50 italic text-center mt-2">{comic.caption}</p>
                  )}
                </div>
              )}

              {/* ── Puzzles ── */}
              {puzzles && (puzzles.crosswordUrl || puzzles.wordSearchUrl) && (
                <div className="mb-8 pb-8 border-b-2 border-foreground">
                  <div className="font-mono text-xs uppercase tracking-widest border-b-2 border-foreground pb-1 mb-5">Puzzles</div>
                  <div className={`grid gap-6 ${puzzles.crosswordUrl && puzzles.wordSearchUrl ? "grid-cols-2" : "grid-cols-1"}`}>
                    {puzzles.crosswordUrl && (
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/50 text-center mb-2">Crossword</p>
                        <img src={puzzles.crosswordUrl} alt="Crossword puzzle" className="block w-full h-auto" />
                      </div>
                    )}
                    {puzzles.wordSearchUrl && (
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/50 text-center mb-2">Word Search</p>
                        <img src={puzzles.wordSearchUrl} alt="Word search puzzle" className="block w-full h-auto" />
                      </div>
                    )}
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
