import { useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = "Photo" }: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
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

      onChange(`${BASE}/api/storage${objectPath}`);
      toast({ title: "Photo uploaded" });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Upload failed", description: "Could not upload the photo." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest mb-2">{label}</label>
      <div className="flex gap-3 items-start">
        <div
          className="border-2 border-foreground bg-[#f5f0e8] flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:border-primary transition-colors"
          style={{ width: 100, height: 75 }}
          onClick={() => !uploading && fileRef.current?.click()}
        >
          {value ? (
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="h-8 w-8 text-foreground/30" />
          )}
        </div>

        <div className="flex flex-col gap-2">
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
            className="rounded-none border-2 border-foreground uppercase text-xs font-bold tracking-wider h-8 hover:bg-foreground hover:text-background"
          >
            <Upload className="h-3 w-3 mr-1.5" />
            {uploading ? "Uploading..." : "Upload Photo"}
          </Button>
          {value && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange(null)}
              className="rounded-none border-2 border-foreground/40 text-foreground/50 uppercase text-xs font-bold tracking-wider h-8 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
            >
              <X className="h-3 w-3 mr-1.5" /> Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
