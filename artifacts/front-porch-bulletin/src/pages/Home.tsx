import { useGetFeaturedArticles, useGetArticlesSummary } from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { ArticleTeaser } from "@/components/ArticleTeaser";
import { NewspaperSkeleton } from "@/components/ui/newspaper-skeleton";
import { Link } from "wouter";

export default function Home() {
  const { data: featuredData, isLoading: isLoadingFeatured } = useGetFeaturedArticles();
  const { data: summaryData, isLoading: isLoadingSummary } = useGetArticlesSummary();

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative">
        
        <div className="lg:col-span-9">
          {isLoadingFeatured ? (
            <NewspaperSkeleton />
          ) : featuredData?.headline ? (
            <section className="mb-8">
              <ArticleTeaser article={featuredData.headline} featured={true} />
            </section>
          ) : null}

          <div className="newspaper-divider" />

          <section className="columns-1 md:columns-2 lg:columns-3 column-gap mt-8">
            {isLoadingFeatured ? (
              <>
                <NewspaperSkeleton />
                <NewspaperSkeleton />
                <NewspaperSkeleton />
              </>
            ) : featuredData?.secondary?.length ? (
              featuredData.secondary.map((article) => (
                <ArticleTeaser key={article.id} article={article} />
              ))
            ) : (
              <p className="font-mono text-center col-span-full py-12 italic opacity-60">
                No stories filed in this edition.
              </p>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-foreground/30 pt-8 lg:pt-0 lg:pl-8">
          <div className="bg-foreground/[0.03] p-4 border border-foreground/20">
            <h2 className="font-headline font-bold text-2xl uppercase text-center border-b-2 border-foreground pb-2 mb-4 tracking-widest">
              What's Inside
            </h2>
            
            {isLoadingSummary ? (
              <NewspaperSkeleton />
            ) : summaryData ? (
              <ul className="space-y-3 font-serif">
                {summaryData.byCategory.map((cat) => (
                  <li key={cat.category} className="flex justify-between items-baseline border-b border-foreground/20 border-dotted pb-1">
                    <Link href={`/categories`} className="hover:underline underline-offset-2">
                      <span className="uppercase text-sm tracking-wide">{cat.category}</span>
                    </Link>
                    <span className="font-mono text-xs">{cat.count} stories</span>
                  </li>
                ))}
                
                <li className="pt-4 flex justify-between items-baseline font-bold">
                  <span className="uppercase text-sm tracking-wide">Total Edition Size</span>
                  <span className="font-mono">{summaryData.totalArticles}</span>
                </li>
              </ul>
            ) : null}
          </div>

          <div className="mt-8 border border-foreground p-4 text-center">
            <h3 className="font-headline font-bold text-xl uppercase tracking-widest mb-2">Classifieds</h3>
            <p className="font-serif text-sm italic mb-4">Looking to sell your tractor? Need a farm hand?</p>
            <Link href="/submit" className="inline-block border border-foreground hover:bg-foreground hover:text-background transition-colors px-4 py-2 font-mono text-xs uppercase tracking-widest">
              Place an Ad
            </Link>
          </div>
        </aside>

      </div>
    </Layout>
  );
}
