import { useEffect } from "react";
import { useGetFeaturedArticles } from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { ArticleTeaser } from "@/components/ArticleTeaser";
import { NewspaperSkeleton } from "@/components/ui/newspaper-skeleton";
import { StudentSpotlight } from "@/components/StudentSpotlight";
import { BusinessSpotlight } from "@/components/BusinessSpotlight";
import { GroupSpotlight } from "@/components/GroupSpotlight";
import { ChurchDirectory } from "@/components/ChurchDirectory";
import { CalendarEvents } from "@/components/CalendarEvents";
import { PrintView } from "@/components/PrintView";

export default function Home() {
  const { data: featuredData, isLoading } = useGetFeaturedArticles();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("print") === "1" && !isLoading) {
      const timer = setTimeout(() => window.print(), 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <>
      {/* ── Screen layout (hidden when printing) ── */}
      <div className="screen-layout">
        <Layout>
          {isLoading ? (
            <NewspaperSkeleton />
          ) : (
            <>
              {/* Front Page Articles — adaptive layout */}
              <div className="mb-8 pb-8 border-b-2 border-foreground">
                {!featuredData?.frontPage?.length ? (
                  <p className="text-sm font-serif text-foreground/60 italic">No featured story today.</p>
                ) : featuredData.frontPage.length === 1 ? (
                  /* Single article — full-width hero */
                  <ArticleTeaser article={featuredData.frontPage[0]} size="hero" />
                ) : featuredData.frontPage.length === 2 ? (
                  /* Two articles — dominant left + secondary right */
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-0 md:divide-x divide-foreground">
                    <div className="md:col-span-3 md:pr-6 pb-6 md:pb-0">
                      <ArticleTeaser article={featuredData.frontPage[0]} size="feature" />
                    </div>
                    <div className="md:col-span-2 md:pl-6 pt-6 md:pt-0">
                      <ArticleTeaser article={featuredData.frontPage[1]} size="standard" />
                    </div>
                  </div>
                ) : (
                  /* Three or more — lead spans top, rest in columns below */
                  <div className="space-y-6">
                    <div className="pb-6 border-b border-foreground/40">
                      <ArticleTeaser article={featuredData.frontPage[0]} size="hero" />
                    </div>
                    <div className={`grid grid-cols-1 gap-6 divide-y md:divide-y-0 md:divide-x divide-foreground ${
                      featuredData.frontPage.length === 3 ? "md:grid-cols-2" : "md:grid-cols-3"
                    }`}>
                      {featuredData.frontPage.slice(1).map((article, i) => (
                        <div key={article.id} className={i > 0 ? "md:pl-6 pt-6 md:pt-0" : "md:pr-6"}>
                          <ArticleTeaser article={article} size="standard" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Spotlights — three columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-foreground mb-8 pb-8 border-b-2 border-foreground">
                <div className="md:pr-6 pb-6 md:pb-0">
                  <StudentSpotlight />
                </div>
                <div className="md:px-6 py-6 md:py-0">
                  <BusinessSpotlight />
                </div>
                <div className="md:pl-6 pt-6 md:pt-0">
                  <GroupSpotlight />
                </div>
              </div>

              {/* Church Directory */}
              <ChurchDirectory />

              {/* Community Calendar */}
              <div className="mt-8 border-t-2 border-foreground pt-6">
                <CalendarEvents />
              </div>
            </>
          )}
        </Layout>
      </div>

      {/* ── Print-only layout (invisible on screen, takes over when printing) ── */}
      <div id="print-view-wrapper">
        <PrintView />
      </div>
    </>
  );
}
