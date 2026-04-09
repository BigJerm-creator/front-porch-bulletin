import { useState } from "react";
import { useListObituaries, getListObituariesQueryKey, useCreateObituary, useUpdateObituary, useDeleteObituary } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, PlusCircle, X, Save, ChevronDown, ChevronUp } from "lucide-react";
import type { Obituary } from "@workspace/api-client-react";

const emptyForm = { name: "", birthDate: "", deathDate: "", hometown: "", content: "" };

function FormCard({
  form,
  setForm,
  onSave,
  onCancel,
  saving,
}: {
  form: typeof emptyForm;
  setForm: (f: typeof emptyForm) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="border-4 border-foreground bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">Full Name</label>
          <Input className="rounded-none border-2 border-foreground font-serif text-base" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name of the deceased" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">Date of Birth <span className="text-foreground/40 normal-case tracking-normal font-normal">(optional)</span></label>
          <Input type="date" className="rounded-none border-2 border-foreground font-mono text-sm" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">Date of Passing <span className="text-foreground/40 normal-case tracking-normal font-normal">(optional)</span></label>
          <Input type="date" className="rounded-none border-2 border-foreground font-mono text-sm" value={form.deathDate} onChange={(e) => setForm({ ...form, deathDate: e.target.value })} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">Hometown <span className="text-foreground/40 normal-case tracking-normal font-normal">(optional)</span></label>
          <Input className="rounded-none border-2 border-foreground font-serif text-base" value={form.hometown} onChange={(e) => setForm({ ...form, hometown: e.target.value })} placeholder="e.g. Haskell, TX" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">Obituary Text</label>
          <textarea
            className="w-full rounded-none border-2 border-foreground font-serif text-sm p-3 bg-background resize-y min-h-[140px]"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Write the obituary text here..."
          />
        </div>
      </div>
      <div className="flex gap-3 pt-2 border-t-2 border-foreground/20">
        <Button onClick={onSave} disabled={saving} className="rounded-none border-2 border-transparent bg-primary text-primary-foreground uppercase tracking-widest font-bold h-10 px-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
          <Save className="mr-2 h-4 w-4" /> Save
        </Button>
        <Button variant="outline" onClick={onCancel} className="rounded-none border-2 border-foreground uppercase tracking-widest font-bold h-10 px-4">
          <X className="mr-2 h-4 w-4" /> Cancel
        </Button>
      </div>
    </div>
  );
}

export default function AdminObituaries() {
  const { data, isLoading } = useListObituaries({ query: { queryKey: getListObituariesQueryKey() } });
  const createObituary = useCreateObituary();
  const updateObituary = useUpdateObituary();
  const deleteObituary = useDeleteObituary();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [expanded, setExpanded] = useState<number | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListObituariesQueryKey() });

  const startEdit = (obit: Obituary) => {
    setEditingId(obit.id);
    setShowNew(false);
    setForm({
      name: obit.name,
      birthDate: obit.birthDate ?? "",
      deathDate: obit.deathDate ?? "",
      hometown: obit.hometown ?? "",
      content: obit.content,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowNew(false);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: form.name,
        birthDate: form.birthDate || null,
        deathDate: form.deathDate || null,
        hometown: form.hometown || null,
        content: form.content,
      };
      if (editingId !== null) {
        await updateObituary.mutateAsync({ id: editingId, data: payload });
        toast({ title: "Obituary updated" });
      } else {
        await createObituary.mutateAsync({ data: payload });
        toast({ title: "Obituary added" });
      }
      invalidate();
      cancelEdit();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to save obituary." });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteObituary.mutateAsync({ id });
      toast({ title: "Obituary removed" });
      invalidate();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete obituary." });
    }
  };

  const formatDateDisplay = (d: string | null | undefined) => {
    if (!d) return null;
    const [year, month, day] = d.split("-");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${months[Number(month) - 1]} ${Number(day)}, ${year}`;
  };

  return (
    <div className="space-y-8">
      <header className="border-b-4 border-foreground pb-6 mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-headline font-bold uppercase tracking-widest mb-2">Obituaries</h1>
          <p className="text-xl text-muted-foreground italic font-serif">Record and honor those who have passed.</p>
        </div>
        <Button
          onClick={() => { setShowNew(true); setEditingId(null); setForm(emptyForm); }}
          className="rounded-none border-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest font-bold h-12 px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all shrink-0"
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Add Obituary
        </Button>
      </header>

      {showNew && (
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">New Obituary</p>
          <FormCard form={form} setForm={setForm} onSave={handleSave} onCancel={cancelEdit} saving={createObituary.isPending} />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        <div className="space-y-3">
          {!data?.obituaries.length && !showNew && (
            <div className="border-4 border-foreground bg-white p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-muted-foreground italic font-serif text-lg">No obituaries on record.</p>
            </div>
          )}
          {data?.obituaries.map((obit) => (
            <div key={obit.id}>
              {editingId === obit.id ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">Editing: {obit.name}</p>
                  <FormCard form={form} setForm={setForm} onSave={handleSave} onCancel={cancelEdit} saving={updateObituary.isPending} />
                </div>
              ) : (
                <div className="border-4 border-foreground bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                  <div className="flex items-start justify-between p-5 gap-4">
                    <div className="min-w-0">
                      <p className="font-headline font-bold text-lg leading-tight">{obit.name}</p>
                      <p className="font-mono text-xs uppercase tracking-wide text-foreground/60 mt-0.5">
                        {[formatDateDisplay(obit.birthDate), formatDateDisplay(obit.deathDate)].filter(Boolean).join(" \u2013 ")}
                        {obit.hometown && ((obit.birthDate || obit.deathDate) ? " \u00b7 " : "") + obit.hometown}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => startEdit(obit)} className="rounded-none border-2 border-foreground uppercase text-xs font-bold tracking-wider h-8 hover:bg-foreground hover:text-background">
                        <Edit className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="rounded-none border-2 border-foreground text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive uppercase text-xs h-8 px-2">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-none border-4 border-foreground font-serif bg-[#f5f0e8]">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-headline text-2xl uppercase tracking-widest border-b-2 border-foreground pb-3">Remove Obituary?</AlertDialogTitle>
                            <AlertDialogDescription className="text-base italic pt-3">
                              This will permanently remove the obituary for {obit.name}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="pt-4 border-t-2 border-foreground/20">
                            <AlertDialogCancel className="rounded-none border-2 border-foreground uppercase tracking-widest font-bold">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(obit.id)} className="rounded-none bg-destructive text-destructive-foreground uppercase tracking-widest font-bold">Remove</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button variant="ghost" size="sm" onClick={() => setExpanded(expanded === obit.id ? null : obit.id)} className="rounded-none h-8 px-2 hover:bg-foreground/5">
                        {expanded === obit.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  {expanded === obit.id && (
                    <div className="px-5 pb-5 border-t-2 border-foreground/20 pt-4">
                      <p className="font-serif text-sm leading-relaxed text-foreground/80">{obit.content}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
