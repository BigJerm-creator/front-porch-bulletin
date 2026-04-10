import { useState } from "react";
import { useListCategories, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Tags, Pencil, Trash2, X, Save, PlusCircle } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type CategoryWithCount = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  showInEvents: boolean;
  articleCount: number;
};

const emptyForm = { name: "", slug: "", description: "", showInEvents: false };

function CategoryDialog({
  category,
  onClose,
}: {
  category: CategoryWithCount | null;
  onClose: () => void;
}) {
  const isNew = category === null;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState(
    isNew
      ? emptyForm
      : {
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          showInEvents: category.showInEvents,
        }
  );
  const [saving, setSaving] = useState(false);

  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      slug: isNew ? name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") : f.slug,
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast({ title: "Name and slug are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const url = isNew ? `${BASE}/api/categories` : `${BASE}/api/categories/${category.id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || null,
          showInEvents: form.showInEvents,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      toast({ title: isNew ? "Section created" : "Section updated" });
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
          <h2 className="font-headline font-bold text-2xl uppercase tracking-widest">
            {isNew ? "New Section" : "Edit Section"}
          </h2>
          <button onClick={onClose} className="hover:opacity-70 transition-opacity">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="font-mono text-xs uppercase tracking-widest block mb-1">Name</label>
            <Input
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="border-2 border-foreground font-serif"
              autoFocus
            />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-widest block mb-1">Slug</label>
            <Input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") }))}
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
          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="showInEvents"
              checked={form.showInEvents}
              onChange={(e) => setForm((f) => ({ ...f, showInEvents: e.target.checked }))}
              className="h-4 w-4 border-2 border-foreground"
            />
            <label htmlFor="showInEvents" className="font-mono text-xs uppercase tracking-widest cursor-pointer">
              Show in Upcoming Events
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving} className="flex-1 font-headline font-bold uppercase tracking-widest">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving…" : isNew ? "Create" : "Save"}
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryWithCount | null>(null);
  const [toggling, setToggling] = useState<number | null>(null);

  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (cat: CategoryWithCount) => { setEditing(cat); setDialogOpen(true); };
  const closeDialog = () => setDialogOpen(false);

  const handleToggleEvents = async (category: CategoryWithCount) => {
    setToggling(category.id);
    try {
      const res = await fetch(`${BASE}/api/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: category.name,
          slug: category.slug,
          description: category.description || null,
          showInEvents: !category.showInEvents,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    } finally {
      setToggling(null);
    }
  };

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
      {dialogOpen && (
        <CategoryDialog category={editing} onClose={closeDialog} />
      )}

      <header className="border-b-4 border-foreground pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl sm:text-5xl font-headline font-bold uppercase tracking-widest mb-2">Sections</h1>
          <p className="text-xl text-muted-foreground italic font-serif">Publication categories and beats.</p>
        </div>
        <Button onClick={openNew} className="font-headline font-bold uppercase tracking-widest shrink-0">
          <PlusCircle className="h-4 w-4 mr-2" />
          New Section
        </Button>
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
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground py-4 text-base hidden md:table-cell">Slug</TableHead>
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground py-4 text-base hidden lg:table-cell">Description</TableHead>
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground py-4 text-base text-center">In Events</TableHead>
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground py-4 text-base text-right">Count</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.categories as CategoryWithCount[] | undefined)?.map((category) => (
                <TableRow
                  key={category.id}
                  className="border-b-2 border-foreground/20 hover:bg-[#f5f0e8]/50 transition-colors cursor-pointer"
                  onClick={() => openEdit(category)}
                >
                  <TableCell className="font-headline font-bold text-xl py-4">
                    <span className="flex items-center gap-2">
                      <Tags className="h-4 w-4 text-primary shrink-0" />
                      {category.name}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 hidden md:table-cell">
                    <span className="font-mono text-sm bg-muted px-2 py-1 border border-border">{category.slug}</span>
                  </TableCell>
                  <TableCell className="italic text-muted-foreground py-4 max-w-xs truncate hidden lg:table-cell">
                    {category.description || "-"}
                  </TableCell>
                  <TableCell className="py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={category.showInEvents}
                      disabled={toggling === category.id}
                      onChange={() => handleToggleEvents(category)}
                      className="h-4 w-4 border-2 border-foreground cursor-pointer disabled:opacity-50"
                      title="Show articles from this section in Upcoming Events"
                    />
                  </TableCell>
                  <TableCell className="text-right font-headline font-bold text-2xl py-4 text-primary">
                    {category.articleCount}
                  </TableCell>
                  <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(category); }}
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
                              onClick={() => handleDelete(category)}
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
              {data?.categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 font-serif italic text-muted-foreground">
                    No sections yet. Add your first one above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
