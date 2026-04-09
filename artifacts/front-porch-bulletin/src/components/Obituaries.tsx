import { useListObituaries, getListObituariesQueryKey } from "@workspace/api-client-react";

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-");
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${months[Number(month) - 1]} ${Number(day)}, ${year}`;
}

export function Obituaries() {
  const { data, isLoading } = useListObituaries({ query: { queryKey: getListObituariesQueryKey() } });

  if (isLoading) {
    return (
      <div className="mt-8 border-t-2 border-foreground pt-4">
        <h2 className="font-headline text-xs uppercase tracking-widest font-bold border-b border-foreground pb-1 mb-4">
          Obituaries
        </h2>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-5 bg-foreground/10 animate-pulse rounded w-2/5" />
              <div className="h-3 bg-foreground/10 animate-pulse rounded w-3/5" />
              <div className="h-3 bg-foreground/10 animate-pulse rounded w-full" />
              <div className="h-3 bg-foreground/10 animate-pulse rounded w-full" />
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
      <div className="space-y-6 divide-y divide-foreground/20">
        {obituaries.map((obit) => {
          const birth = formatDate(obit.birthDate);
          const death = formatDate(obit.deathDate);
          const dates = [birth, death].filter(Boolean).join(" \u2013 ");
          return (
            <div key={String(obit.id)} className="pt-6 first:pt-0">
              <p className="font-headline font-bold text-base leading-tight mb-1">{obit.name}</p>
              {(dates || obit.hometown) && (
                <p className="font-mono text-xs uppercase tracking-wide text-foreground/60 mb-2">
                  {dates}{dates && obit.hometown ? " \u00b7 " : ""}{obit.hometown}
                </p>
              )}
              <p className="font-serif text-sm leading-relaxed text-foreground/80">{obit.content}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
