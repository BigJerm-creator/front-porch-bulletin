import { useState } from "react";
import { useListCategories, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Tags, Pencil, Trash2, X, Save } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type CategoryWithCount = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  articleCount: number;
};

function EditDialog({
  category,
  onClose,
}: {
  category: CategoryWithCount;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast({ title: "Name and slug are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      toast({ title: "Section updated" });
      onClose();
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md p-6 space-y-4">
        <div className="flex justify-between items-center border-b-2 border-foreground pb-3">
          <h2 className="font-headline font-bold text-2xl uppercase tracking-widest">Edit Section</h2>
          <button onClick={onClose} className="hover:opacity-70 transition-opacity">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="font-mono text-xs uppercase tracking-widest block mb-1">Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="border-2 border-foreground font-serif"
            />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-widest block mb-1">Slug</label>
            <Input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
              className="border-2 border-foreground font-mono"
            />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-widest block mb-1">Description</label>
            <Input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="border-2 border-foreground font-serif"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving} className="flex-1 font-headline font-bold uppercase tracking-widest">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button variant="outline" onClick={onClose} className="border-2 border-foreground font-headline uppercase tracking-widest">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCategories() {
  const { data, isLoading } = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<CategoryWithCount | null>(null);

  const handleDelete = async (category: CategoryWithCount) => {
    try {
      const res = await fetch(`${BASE}/api/categories/${category.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      toast({ title: `"${category.name}" removed` });
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8">
      {editing && <EditDialog category={editing} onClose={() => setEditing(null)} />}

      <header className="border-b-4 border-foreground pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl sm:text-5xl font-headline font-bold uppercase tracking-widest mb-2">Sections</h1>
          <p className="text-xl text-muted-foreground italic font-serif">Publication categories and beats.</p>
        </div>
      </header>

      {isLoading ? (
        <div className="border-4 border-foreground bg-white p-4 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <div className="border-4 border-foreground bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <Table>
            <TableHeader className="bg-[#f5f0e8] border-b-4 border-foreground">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground py-4 text-base">Section Name</TableHead>
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground py-4 text-base">Slug</TableHead>
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground py-4 text-base hidden md:table-cell">Description</TableHead>
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground py-4 text-base text-right">Count</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.categories.map((category) => (
                <TableRow
                  key={category.id}
                  className="border-b-2 border-foreground/20 hover:bg-[#f5f0e8]/50 transition-colors cursor-pointer"
                  onClick={() => setEditing(category as CategoryWithCount)}
                >
                  <TableCell className="font-headline font-bold text-xl py-4">
                    <span className="flex items-center gap-2">
                      <Tags className="h-4 w-4 text-primary shrink-0" />
                      {category.name}
                    </span>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="font-mono text-sm bg-muted px-2 py-1 border border-border">{category.slug}</span>
                  </TableCell>
                  <TableCell className="italic text-muted-foreground py-4 max-w-xs truncate hidden md:table-cell">
                    {category.description || "-"}
                  </TableCell>
                  <TableCell className="text-right font-headline font-bold text-2xl py-4 text-primary">
                    {category.articleCount}
                  </TableCell>
                  <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditing(category as CategoryWithCount); }}
                        className="p-1.5 hover:bg-foreground/10 rounded transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="p-1.5 hover:bg-destructive/10 text-destructive rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border-4 border-foreground">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-headline font-bold uppercase tracking-widest">
                              Remove "{category.name}"?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="font-serif">
                              This will permanently delete the section. Articles in this category will not be deleted, but they will no longer be organized under it.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="font-headline uppercase tracking-widest border-2 border-foreground">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(category as CategoryWithCount)}
                              className="font-headline uppercase tracking-widest bg-destructive text-white hover:bg-destructive/80"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
