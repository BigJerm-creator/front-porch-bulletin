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
              <div className="h-4 bg-foreground/10 animate-pulse rounded w-2/5" />
              <div className="h-3 bg-foreground/10 animate-pulse rounded w-3/5" />
              <div className="h-3 bg-foreground/10 animate-pulse rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const obituaries = data?.obituaries ?? [];

  if (!obituaries.length) {
    return null;
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
          return (
            <div key={obit.id} className="pt-5 first:pt-0">
              <p className="font-headline font-bold text-sm leading-tight mb-0.5">{obit.name}</p>
              {(dates || obit.hometown) && (
                <p className="font-mono text-xs uppercase tracking-wide text-foreground/60 mb-1.5">
                  {dates}{dates && obit.hometown ? " \u00b7 " : ""}{obit.hometown}
                </p>
              )}
              <p className="font-serif text-xs leading-relaxed text-foreground/80">{obit.content}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
