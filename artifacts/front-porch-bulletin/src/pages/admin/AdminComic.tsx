import { useState, useEffect } from "react";
import { useGetComic, useUpdateComic, getGetComicQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Save, Laugh } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

export default function AdminComic() {
  const { data, isLoading } = useGetComic({
    query: { queryKey: getGetComicQueryKey(), retry: false },
  });
  const updateComic = useUpdateComic();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");

  useEffect(() => {
    if (data) {
      setImageUrl(data.imageUrl ?? null);
      setCaption(data.caption ?? "");
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await updateComic.mutateAsync({
        data: { imageUrl: imageUrl ?? null, caption: caption || null },
      });
      queryClient.invalidateQueries({ queryKey: getGetComicQueryKey() });
      toast({ title: "Comic updated", description: "The comic strip has been saved." });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to save comic." });
    }
  };

  return (
    <div className="space-y-8">
      <header className="border-b-4 border-foreground pb-6 mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-headline font-bold uppercase tracking-widest mb-2">Comics</h1>
          <p className="text-xl text-muted-foreground italic font-serif">Upload the comic strip for the print edition.</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={updateComic.isPending}
          className="rounded-none border-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest font-bold h-12 px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all shrink-0"
        >
          <Save className="mr-2 h-5 w-5" /> Save Comic
        </Button>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6 border-4 border-foreground bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              label="Comic Strip Image"
            />
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1">Caption / Credit (optional)</label>
              <Input
                className="rounded-none border-2 border-foreground font-serif text-base"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder='e.g. "Bob + Marley" by Jane Doe'
              />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-foreground/50">Preview</p>
            <div className="border-2 border-foreground p-4 bg-[#f5f0e8]">
              <p className="text-xs font-mono uppercase tracking-widest font-bold border-b border-foreground pb-1 mb-3">Comics</p>
              {imageUrl ? (
                <img src={imageUrl} alt="Comic strip preview" className="w-full h-auto block" />
              ) : (
                <div className="w-full flex flex-col items-center justify-center bg-foreground/10 border border-foreground/20 py-12 gap-2">
                  <Laugh className="h-10 w-10 text-foreground/20" />
                  <p className="text-xs font-mono text-foreground/40 uppercase tracking-widest">No image uploaded</p>
                </div>
              )}
              {caption && (
                <p className="text-xs font-mono text-foreground/50 italic mt-2 text-center">{caption}</p>
              )}
            </div>
            <p className="text-xs font-serif italic text-foreground/50">The comic strip appears on its own page in the print edition, before the Church Directory.</p>
          </div>
        </div>
      )}
    </div>
  );
}
