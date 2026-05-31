import { useState, useEffect } from "react";
import {
  useGetBusinessSpotlight,
  useUpdateBusinessSpotlight,
  useToggleBusinessSpotlight,
  getGetBusinessSpotlightQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Save, Building2, Eye, EyeOff } from "lucide-react";
import { MultiImageUpload, type Photo } from "@/components/admin/MultiImageUpload";

export default function AdminBusinessSpotlight() {
  const { data, isLoading } = useGetBusinessSpotlight({
    query: { queryKey: getGetBusinessSpotlightQueryKey(), retry: false },
  });
  const updateSpotlight = useUpdateBusinessSpotlight();
  const toggleSpotlight = useToggleBusinessSpotlight();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const isEnabled = data?.status !== "disabled";

  const handleToggle = async () => {
    try {
      await toggleSpotlight.mutateAsync();
      queryClient.invalidateQueries({ queryKey: getGetBusinessSpotlightQueryKey() });
      toast({ title: isEnabled ? "Spotlight hidden" : "Spotlight enabled", description: isEnabled ? "The business spotlight is now hidden from this issue." : "The business spotlight is now visible." });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to update spotlight visibility." });
    }
  };

  const [form, setForm] = useState({
    name: "",
    businessType: "",
    description: "",
  });
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    if (data) {
      setForm({
        name: data.name,
        businessType: data.businessType,
        description: data.description,
      });
      const rawPhotos = (data as any).photos as Photo[] | null;
      if (rawPhotos && rawPhotos.length > 0) {
        setPhotos(rawPhotos);
      } else if (data.photoUrl) {
        setPhotos([{ url: data.photoUrl, credit: (data as any).photoCredit ?? "" }]);
      } else {
        setPhotos([]);
      }
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await updateSpotlight.mutateAsync({
        data: {
          name: form.name,
          businessType: form.businessType,
          description: form.description,
          photoUrl: photos[0]?.url ?? null,
          photos: photos as any,
        } as any,
      });
      queryClient.invalidateQueries({ queryKey: getGetBusinessSpotlightQueryKey() });
      toast({ title: "Business Spotlight updated", description: "The business spotlight has been saved." });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to save business spotlight." });
    }
  };

  return (
    <div className="space-y-8">
      <header className="border-b-4 border-foreground pb-6 mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-headline font-bold uppercase tracking-widest mb-2">Business Spotlight</h1>
          <p className="text-xl text-muted-foreground italic font-serif">Feature a local business on the front page.</p>
        </div>
        <div className="flex gap-3 items-center shrink-0">
          {data && (
            <Button
              onClick={handleToggle}
              disabled={toggleSpotlight.isPending}
              variant="outline"
              className={`rounded-none border-2 uppercase tracking-widest font-bold h-12 px-5 transition-all ${isEnabled ? "border-foreground bg-white text-foreground hover:bg-foreground/5" : "border-foreground/30 bg-foreground/5 text-foreground/40"}`}
            >
              {isEnabled ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}
              {isEnabled ? "Enabled" : "Disabled"}
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={updateSpotlight.isPending}
            className="rounded-none border-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest font-bold h-12 px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            <Save className="mr-2 h-5 w-5" /> Save Spotlight
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6 border-4 border-foreground bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1">Business Name</label>
              <Input
                className="rounded-none border-2 border-foreground font-serif text-base"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Haskell Feed & Farm Supply"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1">Business Type</label>
              <Input
                className="rounded-none border-2 border-foreground font-serif text-base"
                value={form.businessType}
                onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                placeholder="e.g. Hardware Store, Restaurant, Pharmacy"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1">Description</label>
              <textarea
                className="w-full rounded-none border-2 border-foreground font-serif text-base p-3 bg-background resize-y min-h-[120px]"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Write a brief description of the business..."
              />
            </div>
            <MultiImageUpload
              value={photos}
              onChange={setPhotos}
              label="Photos (optional)"
            />
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-foreground/50">Preview</p>
            <div className="border-2 border-foreground p-4 bg-[#f5f0e8]">
              <p className="text-xs font-mono uppercase tracking-widest font-bold border-b border-foreground pb-1 mb-3">Business Spotlight</p>
              <div
                className="w-full mb-2 border border-foreground flex flex-col items-center justify-end overflow-hidden bg-foreground/10"
                style={{ aspectRatio: "4/3" }}
              >
                {photos[0]?.url ? (
                  <img src={photos[0].url} alt={form.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <Building2 className="h-12 w-12 text-foreground/20" />
                  </div>
                )}
              </div>
              <p className="text-xs font-mono uppercase tracking-widest text-foreground/60 mb-1 text-center">Business of the Week</p>
              <p className="font-headline font-bold text-base leading-tight mb-0.5">{form.name || "Business Name"}</p>
              <p className="text-xs font-mono uppercase tracking-wider text-foreground/70 mb-1">{form.businessType || "Business Type"}</p>
              <div className="font-serif text-xs leading-relaxed text-foreground/80">
                {form.description
                  ? form.description.split('\n\n').map((para, i) => (
                      <p key={i} className={i > 0 ? "mt-2" : ""}>{para}</p>
                    ))
                  : "Description will appear here."}
              </div>
              {photos.length > 1 && (
                <p className="text-xs font-mono text-foreground/40 mt-2">+{photos.length - 1} more photo{photos.length > 2 ? "s" : ""}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
