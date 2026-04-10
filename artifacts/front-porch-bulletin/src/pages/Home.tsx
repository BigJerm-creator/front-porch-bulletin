import { useEffect } from "react";
import { useGetFeaturedArticles } from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { ArticleTeaser } from "@/components/ArticleTeaser";
import { NewspaperSkeleton } from "@/components/ui/newspaper-skeleton";
import { StudentSpotlight } from "@/components/StudentSpotlight";
import { ChurchDirectory } from "@/components/ChurchDirectory";
import { Obituaries } from "@/components/Obituaries";
import { CalendarEvents } from "@/components/CalendarEvents";

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
    <Layout>
      {isLoading ? (
        <NewspaperSkeleton />
      ) : (
        <>
          {/* ── PAGE 1: Two-column front page ── */}
          <div className="flex flex-col lg:flex-row print:flex-row lg:divide-x print:divide-x lg:divide-foreground print:divide-foreground gap-0">

            {/* Left sidebar — Student Spotlight + Upcoming Events */}
            <div className="order-2 lg:order-1 print:order-1 w-full lg:w-1/3 print:w-1/3 lg:pr-6 print:pr-6 pt-6 lg:pt-0 print:pt-0 border-t border-foreground lg:border-t-0 print:border-t-0">
              <StudentSpotlight />

              <h2 className="font-headline text-xs uppercase tracking-widest font-bold border-b border-foreground pb-1 mb-4">
                Upcoming Events
              </h2>
              {featuredData?.secondary && featuredData.secondary.length > 0 ? (
                <div className="space-y-5 divide-y divide-foreground/20 print-sidebar-events">
                  {featuredData.secondary.map((article) => (
                    <div key={article.id} className="pt-5 first:pt-0">
                      <ArticleTeaser article={article} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-serif text-foreground/60 italic">No upcoming events this week.</p>
              )}
            </div>

            {/* Right main column — Headline article only on page 1 */}
            <div className="order-1 lg:order-2 print:order-2 w-full lg:w-2/3 print:w-2/3 lg:pl-6 print:pl-6">
              {featuredData?.headline ? (
                <ArticleTeaser article={featuredData.headline} featured={true} />
              ) : (
                <p className="text-sm font-serif text-foreground/60 italic">No featured story today.</p>
              )}
            </div>
          </div>

          {/* ── PAGE 2: Community listings (breaks to new print page, full width) ── */}
          <div className="mt-10 border-t-4 border-foreground pt-6 print:mt-0 print:pt-0 print:border-t-0 print-page-two">
            {/* On-screen: header for the "inside pages" section */}
            <h2 className="font-headline text-xs uppercase tracking-widest font-bold text-foreground/40 pb-4 mb-0 hidden print:hidden lg:block">
              Community Pages
            </h2>
            {/* Two-column newspaper columns for screen (lg+) and print */}
            <div className="lg:columns-2 lg:gap-x-12 print:columns-2 print:gap-x-[0.5in] [column-rule:1px_solid_rgba(0,0,0,0.15)]">
              <Obituaries />
              <ChurchDirectory />
              <CalendarEvents />
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
