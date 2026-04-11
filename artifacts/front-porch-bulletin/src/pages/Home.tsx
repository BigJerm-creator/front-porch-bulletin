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
              {/* PAGE 1: Two-column front page */}
              <div className="flex flex-col lg:flex-row lg:divide-x lg:divide-foreground gap-0">
                {/* Left sidebar — Student, Business & Group Spotlights */}
                <div className="order-2 lg:order-1 w-full lg:w-1/3 lg:pr-6 pt-6 lg:pt-0 border-t border-foreground lg:border-t-0">
                  <StudentSpotlight />
                  <BusinessSpotlight />
                  <GroupSpotlight />
                </div>

                {/* Right main column — Headline + community listings */}
                <div className="order-1 lg:order-2 w-full lg:w-2/3 lg:pl-6">
                  {featuredData?.headline ? (
                    <ArticleTeaser article={featuredData.headline} featured={true} />
                  ) : (
                    <p className="text-sm font-serif text-foreground/60 italic">No featured story today.</p>
                  )}
                  <ChurchDirectory />
                </div>
              </div>

              {/* Full-width Community Calendar */}
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
