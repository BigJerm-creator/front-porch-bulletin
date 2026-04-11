import { useState } from "react";
import { useListChurches, getListChurchesQueryKey, useCreateChurch, useUpdateChurch, useDeleteChurch } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, PlusCircle, X, Save } from "lucide-react";
import type { Church } from "@workspace/api-client-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

const emptyForm = {
  name: "",
  address: "",
  pastor: "",
  serviceTimes: "",
  phone: "",
  sortOrder: 0,
  photoUrl: null as string | null,
  photoCredit: null as string | null,
};

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">Church Name</label>
          <Input className="rounded-none border-2 border-foreground font-serif text-base" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="First Baptist Church" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">Pastor</label>
          <Input className="rounded-none border-2 border-foreground font-serif text-base" value={form.pastor} onChange={(e) => setForm({ ...form, pastor: e.target.value })} placeholder="Rev. John Smith" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">Phone</label>
          <Input className="rounded-none border-2 border-foreground font-mono text-sm" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(940) 000-0000" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">Service Times</label>
          <Input className="rounded-none border-2 border-foreground text-sm" value={form.serviceTimes} onChange={(e) => setForm({ ...form, serviceTimes: e.target.value })} placeholder="Sun. 10am | Wed. 7pm" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">Address</label>
          <Input className="rounded-none border-2 border-foreground text-sm" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-1">Sort Order</label>
          <Input type="number" className="rounded-none border-2 border-foreground font-mono text-sm" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
        </div>
        <div className="sm:col-span-2">
          <ImageUpload
            value={form.photoUrl}
            onChange={(url) => setForm({ ...form, photoUrl: url })}
            label="Photo (optional)"
          />
          {form.photoUrl && (
            <div className="mt-3">
              <label className="block text-xs font-bold uppercase tracking-widest mb-1">Photo Credit</label>
              <Input
                className="rounded-none border-2 border-foreground font-serif text-sm"
                value={form.photoCredit ?? ""}
                onChange={(e) => setForm({ ...form, photoCredit: e.target.value || null })}
                placeholder="e.g. Photo by Jane Smith"
              />
            </div>
          )}
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

export default function AdminChurches() {
  const { data, isLoading } = useListChurches({ query: { queryKey: getListChurchesQueryKey() } });
  const createChurch = useCreateChurch();
  const updateChurch = useUpdateChurch();
  const deleteChurch = useDeleteChurch();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListChurchesQueryKey() });

  const startEdit = (church: Church) => {
    setEditingId(church.id);
    setShowNew(false);
    setForm({
      name: church.name,
      address: church.address,
      pastor: church.pastor,
      serviceTimes: church.serviceTimes,
      phone: church.phone,
      sortOrder: church.sortOrder,
      photoUrl: church.photoUrl ?? null,
      photoCredit: church.photoCredit ?? null,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowNew(false);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    try {
      if (editingId !== null) {
        await updateChurch.mutateAsync({ id: editingId, data: form });
        toast({ title: "Church updated" });
      } else {
        await createChurch.mutateAsync({ data: form });
        toast({ title: "Church added" });
      }
      invalidate();
      cancelEdit();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to save church." });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteChurch.mutateAsync({ id });
      toast({ title: "Church removed" });
      invalidate();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete church." });
    }
  };

  return (
    <div className="space-y-8">
      <header className="border-b-4 border-foreground pb-6 mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-headline font-bold uppercase tracking-widest mb-2">Church Directory</h1>
          <p className="text-xl text-muted-foreground italic font-serif">Manage the church listings on the front page.</p>
        </div>
        <Button
          onClick={() => { setShowNew(true); setEditingId(null); setForm(emptyForm); }}
          className="rounded-none border-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest font-bold h-12 px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all shrink-0"
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Add Church
        </Button>
      </header>

      {showNew && (
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">New Church</p>
          <FormCard form={form} setForm={setForm} onSave={handleSave} onCancel={cancelEdit} saving={createChurch.isPending} />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        <div className="space-y-3">
          {!data?.churches.length && !showNew && (
            <div className="border-4 border-foreground bg-white p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-muted-foreground italic font-serif text-lg">No churches in the directory yet.</p>
            </div>
          )}
          {data?.churches.map((church) => (
            <div key={church.id}>
              {editingId === church.id ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">Editing: {church.name}</p>
                  <FormCard form={form} setForm={setForm} onSave={handleSave} onCancel={cancelEdit} saving={updateChurch.isPending} />
                </div>
              ) : (
                <div className="border-4 border-foreground bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                  <div className="flex items-start justify-between p-5 gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      {church.photoUrl && (
                        <img src={church.photoUrl} alt={church.name} className="w-14 h-14 object-cover border-2 border-foreground shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-headline font-bold text-lg leading-tight">{church.name}</p>
                        <p className="font-mono text-xs uppercase tracking-wide text-foreground/60 mt-0.5">{church.pastor}</p>
                        <p className="text-sm text-foreground/70 mt-1 font-serif">{church.serviceTimes}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => startEdit(church)} className="rounded-none border-2 border-foreground uppercase text-xs font-bold tracking-wider h-8 hover:bg-foreground hover:text-background">
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
                            <AlertDialogTitle className="font-headline text-2xl uppercase tracking-widest border-b-2 border-foreground pb-3">Remove Church?</AlertDialogTitle>
                            <AlertDialogDescription className="text-base italic pt-3">
                              This will remove {church.name} from the church directory.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="pt-4 border-t-2 border-foreground/20">
                            <AlertDialogCancel className="rounded-none border-2 border-foreground uppercase tracking-widest font-bold">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(church.id)} className="rounded-none bg-destructive text-destructive-foreground uppercase tracking-widest font-bold">Remove</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
