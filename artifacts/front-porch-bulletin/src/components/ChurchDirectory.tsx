import { useListChurches, getListChurchesQueryKey } from "@workspace/api-client-react";

export function ChurchDirectory() {
  const { data, isLoading } = useListChurches({ query: { queryKey: getListChurchesQueryKey() } });

  if (isLoading) {
    return (
      <div className="mt-8 border-t-2 border-foreground pt-4">
        <h2 className="font-headline text-xs uppercase tracking-widest font-bold border-b border-foreground pb-1 mb-4">
          Church Directory
        </h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border-l-2 border-foreground/30 pl-3 space-y-1.5">
              <div className="h-3.5 bg-foreground/10 animate-pulse rounded w-4/5" />
              <div className="h-3 bg-foreground/10 animate-pulse rounded w-3/5" />
              <div className="h-3 bg-foreground/10 animate-pulse rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const churches = data?.churches ?? [];

  if (!churches.length) {
    return null;
  }

  return (
    <div className="mt-8 border-t-2 border-foreground pt-4">
      <h2 className="font-headline text-xs uppercase tracking-widest font-bold border-b border-foreground pb-1 mb-4">
        Church Directory
      </h2>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {churches.map((church) => (
          <div key={church.id} className="border-l-2 border-foreground/30 pl-3">
            <p className="font-headline font-bold text-sm leading-tight mb-0.5">{church.name}</p>
            <p className="font-mono text-xs text-foreground/70 uppercase tracking-wide mb-0.5">{church.pastor}</p>
            <p className="font-serif text-xs text-foreground/80 leading-snug">{church.serviceTimes}</p>
            <p className="font-mono text-xs text-foreground/60 mt-0.5">{church.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
