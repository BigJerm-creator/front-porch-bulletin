import { useState, useEffect } from "react";
import { useGetPuzzles, useUpdatePuzzles, getGetPuzzlesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Save, Puzzle } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

export default function AdminPuzzles() {
  const { data, isLoading } = useGetPuzzles({
    query: { queryKey: getGetPuzzlesQueryKey(), retry: false },
  });
  const updatePuzzles = useUpdatePuzzles();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [crosswordUrl, setCrosswordUrl] = useState<string | null>(null);
  const [wordSearchUrl, setWordSearchUrl] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setCrosswordUrl(data.crosswordUrl ?? null);
      setWordSearchUrl(data.wordSearchUrl ?? null);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await updatePuzzles.mutateAsync({
        data: { crosswordUrl: crosswordUrl ?? null, wordSearchUrl: wordSearchUrl ?? null },
      });
      queryClient.invalidateQueries({ queryKey: getGetPuzzlesQueryKey() });
      toast({ title: "Puzzles updated", description: "The puzzles have been saved." });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to save puzzles." });
    }
  };

  return (
    <div className="space-y-8">
      <header className="border-b-4 border-foreground pb-6 mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-headline font-bold uppercase tracking-widest mb-2">Puzzles</h1>
          <p className="text-xl text-muted-foreground italic font-serif">Upload the crossword and word search for this edition.</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={updatePuzzles.isPending}
          className="rounded-none border-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest font-bold h-12 px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all shrink-0"
        >
          <Save className="mr-2 h-5 w-5" /> Save Puzzles
        </Button>
      </header>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border-4 border-foreground bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-foreground pb-3 mb-2">
              <Puzzle className="h-4 w-4" />
              <h2 className="font-mono text-xs uppercase tracking-widest font-bold">Crossword</h2>
            </div>
            <ImageUpload
              value={crosswordUrl}
              onChange={setCrosswordUrl}
              label="Crossword Image"
            />
            {crosswordUrl ? (
              <img src={crosswordUrl} alt="Crossword preview" className="w-full h-auto block border border-foreground/20" />
            ) : (
              <div className="w-full flex flex-col items-center justify-center bg-foreground/5 border border-foreground/20 py-12 gap-2">
                <Puzzle className="h-10 w-10 text-foreground/20" />
                <p className="text-xs font-mono text-foreground/40 uppercase tracking-widest">No image uploaded</p>
              </div>
            )}
          </div>

          <div className="border-4 border-foreground bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-foreground pb-3 mb-2">
              <Puzzle className="h-4 w-4" />
              <h2 className="font-mono text-xs uppercase tracking-widest font-bold">Word Search</h2>
            </div>
            <ImageUpload
              value={wordSearchUrl}
              onChange={setWordSearchUrl}
              label="Word Search Image"
            />
            {wordSearchUrl ? (
              <img src={wordSearchUrl} alt="Word search preview" className="w-full h-auto block border border-foreground/20" />
            ) : (
              <div className="w-full flex flex-col items-center justify-center bg-foreground/5 border border-foreground/20 py-12 gap-2">
                <Puzzle className="h-10 w-10 text-foreground/20" />
                <p className="text-xs font-mono text-foreground/40 uppercase tracking-widest">No image uploaded</p>
              </div>
            )}
          </div>
        </div>
      )}

      <p className="text-xs font-serif italic text-foreground/50">Puzzles appear side by side on the front page and in the print edition, after the comic strip.</p>
    </div>
  );
}
