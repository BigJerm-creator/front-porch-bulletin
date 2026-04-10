import { useEffect } from "react";
import { useGetFeaturedArticles } from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { ArticleTeaser } from "@/components/ArticleTeaser";
import { NewspaperSkeleton } from "@/components/ui/newspaper-skeleton";
import { StudentSpotlight } from "@/components/StudentSpotlight";
import { ChurchDirectory } from "@/components/ChurchDirectory";
import { Obituaries } from "@/components/Obituaries";

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
        <div className="flex flex-col lg:flex-row print:flex-row lg:divide-x print:divide-x lg:divide-foreground print:divide-foreground gap-0">
          {/* Left sidebar — appears below the headline on mobile */}
          <div className="order-2 lg:order-1 print:order-1 w-full lg:w-1/3 print:w-1/3 lg:pr-6 print:pr-6 pt-6 lg:pt-0 print:pt-0 border-t border-foreground lg:border-t-0 print:border-t-0">
            <StudentSpotlight />
          </div>

          {/* Right main column — shown first on mobile */}
          <div className="order-1 lg:order-2 print:order-2 w-full lg:w-2/3 print:w-2/3 lg:pl-6 print:pl-6">
            {featuredData?.headline ? (
              <ArticleTeaser article={featuredData.headline} featured={true} />
            ) : (
              <p className="text-sm font-serif text-foreground/60 italic">No featured story today.</p>
            )}
            <Obituaries />
            <ChurchDirectory />
          </div>
        </div>
      )}
    </Layout>
  );
}
