export function NewspaperSkeleton() {
  return (
    <div className="animate-pulse space-y-4 py-4">
      <div className="h-8 bg-foreground/10 w-3/4 mb-2"></div>
      <div className="h-4 bg-foreground/10 w-1/4 mb-4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-foreground/5 w-full"></div>
        <div className="h-3 bg-foreground/5 w-full"></div>
        <div className="h-3 bg-foreground/5 w-5/6"></div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-foreground/5 w-full"></div>
        <div className="h-3 bg-foreground/5 w-full"></div>
        <div className="h-3 bg-foreground/5 w-4/6"></div>
      </div>
    </div>
  );
}

export function NewspaperLineSkeleton() {
  return (
    <div className="animate-pulse space-y-2 py-2 border-b border-foreground/20 border-dashed">
      <div className="h-5 bg-foreground/10 w-full"></div>
      <div className="h-3 bg-foreground/5 w-1/3"></div>
    </div>
  );
}
