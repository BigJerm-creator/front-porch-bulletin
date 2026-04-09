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
        <div className="flex gap-0 divide-x divide-foreground">
          <div className="w-1/3 pr-6">
            <StudentSpotlight />

            <h2 className="font-headline text-xs uppercase tracking-widest font-bold border-b border-foreground pb-1 mb-4">
              Upcoming Events
            </h2>
            {featuredData?.secondary && featuredData.secondary.length > 0 ? (
              <div className="space-y-5 divide-y divide-foreground/20">
                {featuredData.secondary.map((article) => (
                  <div key={article.id} className="pt-5 first:pt-0">
                    <ArticleTeaser article={article} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-serif text-foreground/60 italic">No additional stories today.</p>
            )}
          </div>

          <div className="w-2/3 pl-6">
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
