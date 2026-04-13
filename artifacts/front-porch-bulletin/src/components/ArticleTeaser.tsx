import { Link } from "wouter";
import { Article } from "@workspace/api-client-react";
import { formatDateline } from "@/lib/format";

type ArticleSize = "hero" | "feature" | "standard";

interface ArticleTeaserProps {
  article: Article;
  featured?: boolean;
  size?: ArticleSize;
}

export function ArticleTeaser({ article, featured = false, size }: ArticleTeaserProps) {
  const resolvedSize: ArticleSize = size ?? (featured ? "hero" : "standard");

  const headingClass = {
    hero:     "text-4xl md:text-5xl lg:text-6xl mb-3 print-featured-title",
    feature:  "text-2xl md:text-3xl lg:text-4xl mb-2",
    standard: "text-xl md:text-2xl mb-2",
  }[resolvedSize];

  const subtitleClass = {
    hero:     "text-xl md:text-2xl",
    feature:  "text-lg md:text-xl",
    standard: "text-base md:text-lg",
  }[resolvedSize];

  const bodyClass = {
    hero:     "text-lg md:text-xl column-gap columns-1 md:columns-2 print-featured-body",
    feature:  "text-base md:text-lg line-clamp-5",
    standard: "text-base line-clamp-4",
  }[resolvedSize];

  return (
    <article className="group break-inside-avoid">
      <Link href={`/articles/${article.id}`} className="block">
        <div className="hover:bg-foreground/[0.02] p-2 -m-2 transition-colors cursor-pointer">
          <h3 className={`font-headline font-bold leading-tight text-foreground group-hover:underline underline-offset-4 decoration-1 ${headingClass}`}>
            {article.title}
          </h3>

          {article.subtitle && (
            <p className={`font-headline italic text-foreground/80 mb-2 ${subtitleClass}`}>
              {article.subtitle}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs font-mono mb-3 text-foreground/70 uppercase tracking-wide">
            <span>By <span className="italic">{article.author}</span></span>
            <span>•</span>
            <span className="bg-foreground/5 px-1">{article.category}</span>
          </div>

          <p className={`font-serif text-foreground/90 leading-relaxed ${bodyClass}`}>
            <span className="font-bold text-xs uppercase tracking-wider font-mono mr-2">
              {formatDateline(article.publishedAt)}—
            </span>
            {resolvedSize === "hero" ? (
              <span className="first-letter-drop">
                {article.content.split('\n')[0]}
              </span>
            ) : (
              article.content.split('\n')[0]
            )}
          </p>
        </div>
      </Link>
    </article>
  );
}
