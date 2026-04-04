import { Layout } from "@/components/layout/Layout";
import { useListCategories } from "@workspace/api-client-react";
import { Link } from "wouter";
import { NewspaperSkeleton } from "@/components/ui/newspaper-skeleton";

export default function Categories() {
  const { data: categoriesData, isLoading } = useListCategories();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="font-headline text-4xl md:text-5xl font-bold uppercase tracking-widest text-center border-b-2 border-foreground pb-4 mb-12">
          Sections & Departments
        </h1>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <NewspaperSkeleton />
            <NewspaperSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {categoriesData?.categories.map((category) => (
              <Link key={category.id} href={`/articles?category=${category.slug}`}>
                <div className="group border border-foreground/20 p-6 hover:bg-foreground/[0.02] transition-colors cursor-pointer h-full flex flex-col">
                  <div className="flex justify-between items-end border-b border-foreground/30 pb-3 mb-4">
                    <h2 className="font-headline font-bold text-3xl uppercase tracking-widest group-hover:text-primary transition-colors">
                      {category.name}
                    </h2>
                    <span className="font-mono text-sm">{category.articleCount} stories</span>
                  </div>
                  <p className="font-serif text-lg italic text-foreground/80 flex-grow">
                    {category.description || `Browse the latest updates and archival stories in the ${category.name} section.`}
                  </p>
                  <div className="mt-6 font-mono text-xs uppercase tracking-widest text-foreground/60 group-hover:text-foreground transition-colors">
                    Read more →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
