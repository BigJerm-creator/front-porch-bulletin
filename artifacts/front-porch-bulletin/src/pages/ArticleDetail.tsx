import { Layout } from "@/components/layout/Layout";
import { useGetArticle, useListArticles } from "@workspace/api-client-react";
import { NewspaperSkeleton } from "@/components/ui/newspaper-skeleton";
import { Link, useParams } from "wouter";
import { formatDate, formatDateline } from "@/lib/format";
import { ArticleTeaser } from "@/components/ArticleTeaser";

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const articleId = parseInt(id || "0", 10);
  
  const { data: article, isLoading } = useGetArticle(articleId, {
    query: {
      enabled: !!articleId
    }
  });

  const { data: relatedData } = useListArticles(
    article?.category ? { category: article.category, limit: 3 } : {},
    {
      query: {
        enabled: !!article?.category
      }
    }
  );

  const relatedArticles = relatedData?.articles.filter(a => a.id !== articleId) || [];

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto">
          <NewspaperSkeleton />
          <NewspaperSkeleton />
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="text-center py-20 font-headline text-2xl uppercase tracking-widest">
          Story not found
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto bg-foreground/[0.01] p-4 sm:p-8 md:p-12 border border-foreground/10 shadow-sm">
        
        <header className="mb-8 text-center border-b-2 border-foreground pb-6">
          <div className="inline-block bg-foreground text-background font-mono text-xs uppercase tracking-widest px-3 py-1 mb-6">
            {article.category}
          </div>
          
          <h1 className="font-headline text-5xl md:text-6xl font-bold leading-tight mb-4">
            {article.title}
          </h1>
          
          {article.subtitle && (
            <h2 className="font-headline italic text-2xl md:text-3xl text-foreground/80 mb-6">
              {article.subtitle}
            </h2>
          )}
          
          <div className="font-mono text-sm uppercase tracking-widest mt-6 border-t border-foreground/20 pt-4 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6">
            <span>By <span className="font-bold">{article.author}</span></span>
            <span className="hidden sm:inline">•</span>
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </header>

        {article.photoUrl && (
          <figure className="mb-8">
            <img src={article.photoUrl} alt={article.title} className="w-full object-cover border border-foreground/20" />
            {article.photoCredit && (
              <figcaption className="font-mono text-xs text-foreground/50 italic text-right mt-1">
                Picture Credit — {article.photoCredit}
              </figcaption>
            )}
          </figure>
        )}

        <article className="prose prose-stone prose-lg max-w-none font-serif leading-loose column-gap md:columns-2">
          <p className="first-letter-drop">
            <span className="font-bold text-xs uppercase tracking-wider font-mono mr-2">
              {formatDateline(article.publishedAt)}—
            </span>
            {article.content.split('\n\n').map((paragraph, index) => (
              <span key={index}>
                {index > 0 ? <p className="mt-4 indent-8">{paragraph}</p> : paragraph}
              </span>
            ))}
          </p>
        </article>

      </div>

      {relatedArticles.length > 0 && (
        <div className="max-w-5xl mx-auto mt-16 pt-8 border-t-4 border-double border-foreground">
          <h3 className="font-headline font-bold text-2xl uppercase tracking-widest text-center mb-8">
            More from {article.category}
          </h3>
          <div className="columns-1 md:columns-2 lg:columns-3 column-gap">
            {relatedArticles.map(related => (
              <ArticleTeaser key={related.id} article={related} />
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
