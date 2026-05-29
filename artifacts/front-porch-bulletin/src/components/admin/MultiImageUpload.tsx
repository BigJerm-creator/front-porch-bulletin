import { useRef, useState } from "react";
import { X, Copy, Check, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export interface Photo {
  url: string;
  credit: string;
}

interface MultiImageUploadProps {
  value: Photo[];
  onChange: (photos: Photo[]) => void;
  label?: string;
}

export function MultiImageUpload({ value, onChange, label = "Photos" }: MultiImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Images only", description: "Please select an image file." });
      return;
    }
    setUploading(true);
    try {
      const res = await fetch(`${BASE}/api/storage/uploads/request-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      if (!res.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await res.json();

      const putRes = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) throw new Error("Upload to storage failed");

      const url = `${BASE}/api/storage${objectPath}`;
      onChange([...value, { url, credit: "" }]);
      toast({ title: "Photo uploaded" });
    } catch {
      toast({ variant: "destructive", title: "Upload failed", description: "Could not upload the photo." });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateCredit = (index: number, credit: string) => {
    onChange(value.map((p, i) => (i === index ? { ...p, credit } : p)));
  };

  const copyRef = (index: number) => {
    navigator.clipboard.writeText(`[photo-${index + 1}]`);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest mb-3">{label}</label>
      <div className="space-y-2">
        {value.map((photo, index) => (
          <div key={photo.url + index} className="flex gap-3 items-start border-2 border-foreground/20 p-3 bg-white">
            <div
              className="border-2 border-foreground bg-[#f5f0e8] shrink-0 overflow-hidden"
              style={{ width: 80, height: 60 }}
            >
              <img src={photo.url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => copyRef(index)}
                  className="inline-flex items-center gap-1.5 px-2 py-1 bg-foreground text-background font-mono text-xs uppercase tracking-wider hover:bg-primary transition-colors shrink-0"
                  title="Click to copy — paste into body text to place this photo inline"
                >
                  {copiedIndex === index ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {`[photo-${index + 1}]`}
                </button>
                <span className="text-xs text-foreground/50 font-serif italic">
                  {index === 0 ? "Lead photo" : "Paste tag in body to place inline"}
                </span>
              </div>
              <Input
                value={photo.credit}
                onChange={(e) => updateCredit(index, e.target.value)}
                className="rounded-none border-2 border-foreground/30 font-serif text-xs h-8"
                placeholder="Photo credit (optional)"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removePhoto(index)}
              className="rounded-none border-2 border-foreground/40 text-foreground/50 h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive shrink-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}

        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="rounded-none border-2 border-foreground uppercase text-xs font-bold tracking-wider h-9 hover:bg-foreground hover:text-background"
          >
            <PlusCircle className="h-3 w-3 mr-1.5" />
            {uploading ? "Uploading..." : value.length === 0 ? "Upload Photo" : "Add Another Photo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
