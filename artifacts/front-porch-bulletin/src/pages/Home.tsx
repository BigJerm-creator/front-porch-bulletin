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

    </Layout>
  );
}
