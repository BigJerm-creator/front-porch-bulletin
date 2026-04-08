import { useGetFeaturedArticles } from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { ArticleTeaser } from "@/components/ArticleTeaser";
import { NewspaperSkeleton } from "@/components/ui/newspaper-skeleton";

export default function Home() {
  const { data: featuredData, isLoading: isLoadingFeatured } = useGetFeaturedArticles();

  return (
    <Layout>
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
    </Layout>
  );
}
