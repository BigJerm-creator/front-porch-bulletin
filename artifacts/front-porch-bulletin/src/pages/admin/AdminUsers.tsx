import { useListAdminUsers, getListAdminUsersQueryKey, useSetUserRole, useRevokeUserRole, useGetMyRole, getGetMyRoleQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ShieldBan, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { SetUserRoleBodyRole } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUsers() {
  const { data: roleData } = useGetMyRole({ query: { queryKey: getGetMyRoleQueryKey() } });
  const { data, isLoading } = useListAdminUsers({ query: { queryKey: getListAdminUsersQueryKey(), enabled: !!roleData?.isAdmin } });
  
  const setUserRole = useSetUserRole();
  const revokeUserRole = useRevokeUserRole();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [roleDrafts, setRoleDrafts] = useState<Record<string, SetUserRoleBodyRole>>({});

  if (roleData && !roleData.isAdmin) {
    return (
      <div className="p-12 text-center max-w-xl mx-auto mt-20 border-4 border-foreground bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <ShieldBan className="h-20 w-20 mx-auto mb-6 text-destructive" />
        <h1 className="text-4xl font-headline font-bold uppercase tracking-widest mb-4">Access Denied</h1>
        <div className="newspaper-divider" />
        <p className="text-xl italic font-serif leading-relaxed">
          This area is strictly restricted to the Editor-in-Chief. 
          Standard staff members cannot view or modify the staff roster.
        </p>
      </div>
    );
  }

  const handleRoleChange = (clerkUserId: string, role: SetUserRoleBodyRole) => {
    setRoleDrafts(prev => ({ ...prev, [clerkUserId]: role }));
  };

  const handleSaveRole = async (clerkUserId: string) => {
    const newRole = roleDrafts[clerkUserId];
    if (!newRole) return;

    try {
      await setUserRole.mutateAsync({ data: { role: newRole }, clerkUserId });
      toast({ title: "Role updated", description: "Staff credentials modified successfully." });
      queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() });
      setRoleDrafts(prev => {
        const next = { ...prev };
        delete next[clerkUserId];
        return next;
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not update staff role." });
    }
  };

  const handleRevoke = async (clerkUserId: string) => {
    try {
      await revokeUserRole.mutateAsync({ clerkUserId });
      toast({ title: "Role revoked", description: "Staff access terminated." });
      queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not revoke staff access." });
    }
  };

  return (
    <div className="space-y-8">
      <header className="border-b-4 border-foreground pb-6 mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-4xl sm:text-5xl font-headline font-bold uppercase tracking-widest mb-2">Staff Roster</h1>
          <p className="text-xl text-muted-foreground italic font-serif">Manage editorial permissions and newspaper access.</p>
        </div>
        <ShieldAlert className="h-12 w-12 text-primary opacity-20 hidden sm:block" />
      </header>

      {isLoading ? (
        <div className="border-4 border-foreground bg-white p-4 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <div className="border-4 border-foreground bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-[#f5f0e8] border-b-4 border-foreground">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground text-base py-4">Staff Member</TableHead>
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground text-base py-4">Clerk ID</TableHead>
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground text-base py-4">Clearance Level</TableHead>
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground text-base py-4">Granted On</TableHead>
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground text-base py-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.users.map((u) => {
                const draftRole = roleDrafts[u.clerkUserId];
                const hasDraft = draftRole && draftRole !== u.role;
                
                return (
                  <TableRow key={u.clerkUserId} className="border-b-2 border-foreground/20 hover:bg-[#f5f0e8]/50 transition-colors">
                    <TableCell className="py-4">
                      <div className="font-headline font-bold text-lg">{u.name || "Unknown Staff"}</div>
                      <div className="text-sm italic text-muted-foreground">{u.email || "No email provided"}</div>
                    </TableCell>
                    <TableCell className="py-4 font-mono text-xs text-muted-foreground">{u.clerkUserId.substring(0, 12)}...</TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <Select 
                          value={draftRole || u.role as string} 
                          onValueChange={(val) => handleRoleChange(u.clerkUserId, val as SetUserRoleBodyRole)}
                        >
                          <SelectTrigger className="w-[180px] rounded-none border-2 border-foreground h-10 text-xs font-bold uppercase tracking-widest bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-none border-2 border-foreground">
                            <SelectItem value="admin" className="text-xs uppercase font-bold tracking-widest">Editor-in-Chief</SelectItem>
                            <SelectItem value="approved_user" className="text-xs uppercase font-bold tracking-widest">Staff Writer</SelectItem>
                          </SelectContent>
                        </Select>
                        {hasDraft && (
                          <Button size="sm" onClick={() => handleSaveRole(u.clerkUserId)} className="h-10 rounded-none border-2 border-transparent bg-primary text-primary-foreground uppercase tracking-widest text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                            Save
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-sm font-mono">
                      {format(new Date(u.grantedAt), "MM/dd/yyyy")}
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleRevoke(u.clerkUserId)}
                        className="rounded-none border-2 border-foreground text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive uppercase tracking-widest font-bold text-xs h-10 px-4"
                      >
                        Revoke Access
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
