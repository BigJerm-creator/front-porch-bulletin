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
              {/* Headline — full width */}
              <div className="mb-8 pb-8 border-b-2 border-foreground">
                {featuredData?.headline ? (
                  <ArticleTeaser article={featuredData.headline} featured={true} />
                ) : (
                  <p className="text-sm font-serif text-foreground/60 italic">No featured story today.</p>
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
