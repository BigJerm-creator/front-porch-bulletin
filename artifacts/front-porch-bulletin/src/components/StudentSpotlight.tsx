export function StudentSpotlight() {
  return (
    <div className="mb-5 pb-5 border-b border-foreground">
      <h2 className="font-headline text-xs uppercase tracking-widest font-bold border-b border-foreground pb-1 mb-3">
        Student Spotlight
      </h2>

      <div
        className="w-full mb-2 border border-foreground flex flex-col items-center justify-end overflow-hidden"
        style={{ aspectRatio: "4/3", background: "#d6cfc4" }}
      >
        <div className="w-full bg-foreground/80 text-background text-center text-xs font-mono uppercase tracking-wider py-1 px-2">
          Photo
        </div>
      </div>

      <p className="text-xs font-mono uppercase tracking-widest text-foreground/60 mb-2 text-center">
        Student of the Week
      </p>

      <p className="font-headline font-bold text-lg leading-tight mb-1">
        Ashley Renee Dobbins
      </p>
      <p className="text-xs font-mono uppercase tracking-wider text-foreground/70 mb-2">
        Haskell High School &bull; Grade 11
      </p>
      <p className="font-serif text-sm leading-relaxed text-foreground/80">
        Ashley has been named this week's student spotlight for her outstanding
        performance in the regional science fair and her dedication to the
        school's after-school tutoring program.
      </p>
    </div>
  );
}
