import { Link, useLocation } from "wouter";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGetMyRole, getGetMyRoleQueryKey } from "@workspace/api-client-react";
import { FileText, Users, LogOut, LayoutDashboard, Star, Church, Printer, CalendarDays, Building2, Info, Send, Laugh, Puzzle } from "lucide-react";
import logoSrc from "@assets/The_(1)_1775854639167.png";
import { BulkEmailDialog } from "@/components/admin/BulkEmailDialog";
import { useState, useEffect, useCallback } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const currentUser = useCurrentUser();
  const { data: roleData } = useGetMyRole({ query: { queryKey: getGetMyRoleQueryKey() } });
  const { toast } = useToast();

  const [draftCount, setDraftCount] = useState<number>(0);
  const [publishing, setPublishing] = useState(false);

  const fetchDraftCount = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/draft-count", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setDraftCount(data.count ?? 0);
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    fetchDraftCount();
    const interval = setInterval(fetchDraftCount, 30000);
    return () => clearInterval(interval);
  }, [fetchDraftCount]);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch("/api/admin/publish-edition", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to publish");
      const data = await res.json();
      toast({
        title: "Edition Published",
        description: `${data.published} article${data.published !== 1 ? "s" : ""} are now live to the public.`,
      });
      setDraftCount(0);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to publish edition. Try again." });
    } finally {
      setPublishing(false);
    }
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/articles", label: "Articles", icon: FileText },
    { href: "/admin/about", label: "About", icon: Info },
    { href: "/admin/spotlight", label: "Student", icon: Star },
    { href: "/admin/business-spotlight", label: "Business", icon: Building2 },
    { href: "/admin/group-spotlight", label: "Group", icon: Users },
    { href: "/admin/churches", label: "Churches", icon: Church },
    { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
    { href: "/admin/comic", label: "Comics", icon: Laugh },
    { href: "/admin/puzzles", label: "Puzzles", icon: Puzzle },
  ];

  if (roleData?.isAdmin) {
    navItems.push({ href: "/admin/users", label: "Staff", icon: Users });
  }

  return (
    <div className="flex min-h-screen bg-background font-serif text-foreground">
      <aside className="w-48 border-r-2 border-foreground flex flex-col shrink-0">
        <div className="p-4 border-b-2 border-foreground">
          <Link href="/">
            <img
              src={logoSrc}
              alt="The Front Porch Bulletin"
              className="w-full"
            />
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <p className="text-xs uppercase tracking-widest text-foreground/50 font-bold px-2 pt-1 pb-2">Editorial Desk</p>
          {navItems.map((item) => {
            const isActive = item.exact ? location === item.href : location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-widest transition-colors border ${
                  isActive
                    ? "bg-foreground text-background border-foreground"
                    : "border-transparent hover:border-foreground/30 hover:bg-foreground/5"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}

          {/* Press actions */}
          <div className="pt-3 space-y-1.5">
            <p className="text-xs uppercase tracking-widest text-foreground/30 font-bold px-2 pb-1">Press</p>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  disabled={draftCount === 0 || publishing}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-widest border-2 transition-colors ${
                    draftCount > 0
                      ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                      : "border-foreground/20 bg-foreground/5 text-foreground/30 cursor-not-allowed"
                  }`}
                >
                  <Send className="h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1 text-left">Publish</span>
                  {draftCount > 0 && (
                    <span className="ml-auto bg-primary-foreground text-primary text-[10px] font-black px-1.5 min-w-[18px] text-center leading-[18px] rounded-sm">
                      {draftCount}
                    </span>
                  )}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-none border-4 border-foreground font-serif bg-[#f5f0e8] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-headline text-3xl uppercase tracking-widest border-b-2 border-foreground pb-4">
                    Go to Press?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-lg text-foreground/80 italic pt-4">
                    This will publish <strong>{draftCount} draft article{draftCount !== 1 ? "s" : ""}</strong> to the public front page. Once published, readers will see the new edition immediately.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6 pt-4 border-t-2 border-foreground/20">
                  <AlertDialogCancel className="rounded-none border-2 border-foreground uppercase tracking-widest font-bold">
                    Hold the Presses
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handlePublish}
                    disabled={publishing}
                    className="rounded-none border-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                  >
                    {publishing ? "Publishing…" : "Publish Edition"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <button
              onClick={() => window.open('/?print=1', '_blank')}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-widest border-2 border-foreground bg-[#f5f0e8] hover:bg-foreground hover:text-background transition-colors"
            >
              <Printer className="h-3.5 w-3.5 shrink-0" /> Print Edition
            </button>
            <BulkEmailDialog />
          </div>
        </nav>

        <div className="p-3 border-t-2 border-foreground space-y-2">
          <p className="text-xs font-bold font-headline truncate">{currentUser?.name || "Staff Member"}</p>
          <p className="text-xs uppercase tracking-widest text-primary font-bold">{roleData?.isAdmin ? "Editor-in-Chief" : (roleData?.role || "Pending")}</p>
          <button
            onClick={() => {
              localStorage.removeItem("session_token");
              localStorage.removeItem("user_info");
              window.location.href = "/sign-in";
            }}
            className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-foreground/60 hover:text-foreground transition-colors"
          >
            <LogOut className="h-3 w-3" /> Clock Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
