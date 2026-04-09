import { useGetFeaturedArticles } from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { ArticleTeaser } from "@/components/ArticleTeaser";
import { NewspaperSkeleton } from "@/components/ui/newspaper-skeleton";

export default function Home() {
  const { data: featuredData, isLoading } = useGetFeaturedArticles();

  return (
    <Layout>
      {isLoading ? (
        <NewspaperSkeleton />
      ) : (
        <div className="flex gap-0 divide-x divide-foreground">
          <div className="w-1/3 pr-6">
            <h2 className="font-headline text-xs uppercase tracking-widest font-bold border-b border-foreground pb-1 mb-4">
              In This Issue
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
          </div>
        </div>
      )}
    </Layout>
  );
}
