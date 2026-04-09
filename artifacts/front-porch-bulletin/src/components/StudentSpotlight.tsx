import { useGetSpotlight, getGetSpotlightQueryKey } from "@workspace/api-client-react";
import { User } from "lucide-react";

export function StudentSpotlight() {
  const { data, isLoading } = useGetSpotlight({ query: { queryKey: getGetSpotlightQueryKey() } });

  if (isLoading) {
    return (
      <div className="mb-5 pb-5 border-b border-foreground">
        <h2 className="font-headline text-xs uppercase tracking-widest font-bold border-b border-foreground pb-1 mb-3">
          Student Spotlight
        </h2>
        <div className="w-full mb-2 border border-foreground bg-foreground/10 animate-pulse" style={{ aspectRatio: "4/3" }} />
        <div className="h-4 bg-foreground/10 animate-pulse rounded mb-2" />
        <div className="h-4 bg-foreground/10 animate-pulse rounded mb-1 w-3/4" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="mb-5 pb-5 border-b border-foreground">
      <h2 className="font-headline text-xs uppercase tracking-widest font-bold border-b border-foreground pb-1 mb-3">
        Student Spotlight
      </h2>

      <div
        className="w-full mb-2 border border-foreground flex flex-col items-center justify-end overflow-hidden"
        style={{ aspectRatio: "4/3", background: "#d6cfc4" }}
      >
        {data.photoUrl ? (
          <img src={data.photoUrl} alt={data.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex-1 flex items-center justify-center w-full">
            <User className="h-16 w-16 text-foreground/20" />
          </div>
        )}
        <div className="w-full bg-foreground/80 text-background text-center text-xs font-mono uppercase tracking-wider py-1 px-2">
          Photo
        </div>
      </div>

      <p className="text-xs font-mono uppercase tracking-widest text-foreground/60 mb-2 text-center">
        Student of the Week
      </p>

      <p className="font-headline font-bold text-lg leading-tight mb-1">
        {data.name}
      </p>
      <p className="text-xs font-mono uppercase tracking-wider text-foreground/70 mb-2">
        {data.school} &bull; {data.grade}
      </p>
      <p className="font-serif text-sm leading-relaxed text-foreground/80">
        {data.description}
      </p>
    </div>
  );
}
