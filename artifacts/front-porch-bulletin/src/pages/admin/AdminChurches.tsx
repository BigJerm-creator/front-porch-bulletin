import { useState } from "react";
import { useListChurches, getListChurchesQueryKey, useCreateChurch, useUpdateChurch, useDeleteChurch } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, PlusCircle, X, Save } from "lucide-react";
import type { Church } from "@workspace/api-client-react";

const emptyForm = { name: "", address: "", pastor: "", serviceTimes: "", phone: "", sortOrder: 0 };

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

  const FormRow = () => (
    <TableRow className="bg-[#f5f0e8] border-b-2 border-foreground">
      <TableCell className="py-3">
        <Input className="rounded-none border-2 border-foreground h-8 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Church name" />
      </TableCell>
      <TableCell className="py-3">
        <Input className="rounded-none border-2 border-foreground h-8 text-sm" value={form.pastor} onChange={(e) => setForm({ ...form, pastor: e.target.value })} placeholder="Pastor name" />
      </TableCell>
      <TableCell className="py-3">
        <Input className="rounded-none border-2 border-foreground h-8 text-sm" value={form.serviceTimes} onChange={(e) => setForm({ ...form, serviceTimes: e.target.value })} placeholder="Sun. 10am | Wed. 7pm" />
      </TableCell>
      <TableCell className="py-3">
        <Input className="rounded-none border-2 border-foreground h-8 text-sm font-mono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(940) 000-0000" />
      </TableCell>
      <TableCell className="py-3">
        <Input className="rounded-none border-2 border-foreground h-8 text-sm" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" />
      </TableCell>
      <TableCell className="py-3 text-right">
        <div className="flex justify-end gap-2">
          <Button size="sm" onClick={handleSave} className="rounded-none h-8 uppercase text-xs font-bold tracking-wider bg-primary text-primary-foreground">
            <Save className="h-3 w-3 mr-1" /> Save
          </Button>
          <Button size="sm" variant="outline" onClick={cancelEdit} className="rounded-none border-2 border-foreground h-8 px-2">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

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

      {isLoading ? (
        <div className="border-4 border-foreground bg-white p-4 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <div className="border-4 border-foreground bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader className="bg-[#f5f0e8] border-b-4 border-foreground">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground text-base py-4">Name</TableHead>
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground text-base py-4">Pastor</TableHead>
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground text-base py-4">Service Times</TableHead>
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground text-base py-4">Phone</TableHead>
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground text-base py-4">Address</TableHead>
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground text-base py-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {showNew && <FormRow />}
              {data?.churches.map((church) =>
                editingId === church.id ? (
                  <FormRow key={church.id} />
                ) : (
                  <TableRow key={church.id} className="border-b-2 border-foreground/20 hover:bg-[#f5f0e8]/50 transition-colors group">
                    <TableCell className="py-4 font-headline font-bold">{church.name}</TableCell>
                    <TableCell className="py-4 italic text-muted-foreground">{church.pastor}</TableCell>
                    <TableCell className="py-4 text-sm font-serif">{church.serviceTimes}</TableCell>
                    <TableCell className="py-4 font-mono text-sm">{church.phone}</TableCell>
                    <TableCell className="py-4 text-sm text-foreground/70">{church.address}</TableCell>
                    <TableCell className="py-4 text-right">
                      <div className="flex justify-end gap-2">
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
                    </TableCell>
                  </TableRow>
                )
              )}
              {!data?.churches.length && !showNew && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic font-serif">
                    No churches in the directory yet.
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
