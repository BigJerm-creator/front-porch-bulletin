import { useListObituaries, getListObituariesQueryKey } from "@workspace/api-client-react";

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[Number(month) - 1]}. ${Number(day)}, ${year}`;
}

export function Obituaries() {
  const { data, isLoading } = useListObituaries({ query: { queryKey: getListObituariesQueryKey() } });

  if (isLoading) {
    return (
      <div className="mt-8 border-t-2 border-foreground pt-4">
        <h2 className="font-headline text-xs uppercase tracking-widest font-bold border-b border-foreground pb-1 mb-4">
          Obituaries
        </h2>
        <div className="space-y-5">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-6 bg-foreground/10 animate-pulse rounded w-2/5" />
              <div className="h-3 bg-foreground/10 animate-pulse rounded w-3/5" />
              <div className="h-3 bg-foreground/10 animate-pulse rounded w-full" />
              <div className="h-3 bg-foreground/10 animate-pulse rounded w-4/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const obituaries = data?.obituaries ?? [];

  if (!obituaries.length) {
    return (
      <div className="mt-8 border-t-2 border-foreground pt-4">
        <h2 className="font-headline text-xs uppercase tracking-widest font-bold border-b border-foreground pb-1 mb-4">
          Obituaries
        </h2>
        <p className="font-serif text-sm italic text-foreground/50">No obituaries this week.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t-2 border-foreground pt-4">
      <h2 className="font-headline text-xs uppercase tracking-widest font-bold border-b border-foreground pb-1 mb-4">
        Obituaries
      </h2>
      <div className="space-y-5 divide-y divide-foreground/20">
        {obituaries.map((obit) => {
          const birth = formatDate(obit.birthDate);
          const death = formatDate(obit.deathDate);
          const dates = [birth, death].filter(Boolean).join(" \u2013 ");
          const meta = [dates, obit.hometown].filter(Boolean).join(" \u00b7 ");
          return (
            <article key={String(obit.id)} className="pt-5 first:pt-0">
              <h3 className="font-headline font-bold leading-tight text-foreground text-xl md:text-2xl mb-2">
                {obit.name}
              </h3>
              {meta && (
                <div className="flex items-center gap-2 text-xs font-mono mb-3 text-foreground/70 uppercase tracking-wide">
                  <span>{meta}</span>
                </div>
              )}
              <p className="font-serif text-foreground/90 leading-relaxed text-base line-clamp-4">
                {obit.content}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
