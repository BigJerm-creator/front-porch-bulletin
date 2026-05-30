import { useGetGroupSpotlight, getGetGroupSpotlightQueryKey } from "@workspace/api-client-react";
import { Users } from "lucide-react";

export function GroupSpotlight() {
  const { data, isLoading } = useGetGroupSpotlight({ query: { queryKey: getGetGroupSpotlightQueryKey(), retry: false } });

  if (isLoading) {
    return (
      <div className="mb-5 pb-5 border-b border-foreground">
        <h2 className="font-headline text-xs uppercase tracking-widest font-bold border-b border-foreground pb-1 mb-3">
          Group Spotlight
        </h2>
        <div className="w-2/5 float-left mr-3 mb-1 border border-foreground bg-foreground/10 animate-pulse" style={{ aspectRatio: "3/4" }} />
        <div className="h-4 bg-foreground/10 animate-pulse rounded mb-2" />
        <div className="h-4 bg-foreground/10 animate-pulse rounded mb-1 w-3/4" />
        <div className="clear-both" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mb-5 pb-5 border-b border-foreground">
      <h2 className="font-headline text-xs uppercase tracking-widest font-bold border-b border-foreground pb-1 mb-3">
        Group Spotlight
      </h2>

      <div
        className="float-left mr-3 mb-1 border border-foreground overflow-hidden"
        style={{ width: "42%", aspectRatio: "3/4", background: "#d6cfc4" }}
      >
        {data.photoUrl ? (
          <img src={data.photoUrl} alt={data.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Users className="h-10 w-10 text-foreground/20" />
          </div>
        )}
      </div>

      <p className="text-xs font-mono uppercase tracking-widest text-foreground/60 mb-1">
        Group of the Week
      </p>
      <p className="font-headline font-bold text-lg leading-tight mb-1">
        {data.name}
      </p>
      <p className="text-xs font-mono uppercase tracking-wider text-foreground/70 mb-2">
        {data.groupType}
      </p>
      <p className="font-serif text-sm leading-relaxed text-foreground/80">
        {data.description}
      </p>
      {data.photoCredit && (
        <p className="clear-both text-[10px] font-mono italic text-foreground/50 text-right mt-1">
          Picture Credit — {data.photoCredit}
        </p>
      )}
      <div className="clear-both" />
    </div>
  );
}
