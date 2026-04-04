import { Layout } from "@/components/layout/Layout";
import { useListArticles, useListCategories } from "@workspace/api-client-react";
import { NewspaperLineSkeleton } from "@/components/ui/newspaper-skeleton";
import { Link, useLocation } from "wouter";
import { formatDate } from "@/lib/format";
import { useState } from "react";

export default function Articles() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const { data: articlesData, isLoading: isLoadingArticles } = useListArticles(
    selectedCategory ? { category: selectedCategory } : {}
  );
  const { data: categoriesData } = useListCategories();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="font-headline text-4xl md:text-5xl font-bold uppercase tracking-widest text-center border-b-2 border-foreground pb-4 mb-8">
          The Archives
        </h1>

        <div className="flex flex-wrap gap-2 mb-8 justify-center border-b border-foreground/20 pb-6">
          <button
            onClick={() => setSelectedCategory(undefined)}
            className={`font-mono text-xs uppercase tracking-widest px-3 py-1 border transition-colors ${
              !selectedCategory 
                ? "bg-foreground text-background border-foreground" 
                : "border-foreground/30 hover:border-foreground"
            }`}
          >
            All Stories
          </button>
          {categoriesData?.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`font-mono text-xs uppercase tracking-widest px-3 py-1 border transition-colors ${
                selectedCategory === cat.slug 
                  ? "bg-foreground text-background border-foreground" 
                  : "border-foreground/30 hover:border-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {isLoadingArticles ? (
            <>
              <NewspaperLineSkeleton />
              <NewspaperLineSkeleton />
              <NewspaperLineSkeleton />
              <NewspaperLineSkeleton />
              <NewspaperLineSkeleton />
            </>
          ) : articlesData?.articles.length ? (
            articlesData.articles.map((article) => (
              <div key={article.id} className="group border-b border-foreground/20 border-dotted pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 sm:gap-4">
                <Link href={`/articles/${article.id}`} className="block flex-grow">
                  <h2 className="font-headline font-bold text-xl group-hover:underline underline-offset-4 decoration-1">
                    {article.title}
                  </h2>
                  <div className="text-xs font-mono text-foreground/70 uppercase tracking-wider mt-1">
                    By <span className="italic">{article.author}</span>
                  </div>
                </Link>
                <div className="text-xs font-mono text-foreground/60 sm:text-right shrink-0">
                  <div className="uppercase tracking-widest bg-foreground/5 px-2 py-0.5 inline-block mb-1">
                    {article.category}
                  </div>
                  <div>{formatDate(article.publishedAt)}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 font-mono italic opacity-60">
              No stories found in the archives matching this search.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
