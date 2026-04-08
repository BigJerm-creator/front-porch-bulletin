import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { useGetMyRole, getGetMyRoleQueryKey } from "@workspace/api-client-react";
import { Newspaper, FileText, Tags, Users, LogOut, LayoutDashboard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { data: roleData, isLoading } = useGetMyRole({ query: { queryKey: getGetMyRoleQueryKey() } });

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/articles", label: "Articles", icon: FileText },
    { href: "/admin/categories", label: "Categories", icon: Tags },
  ];

  if (roleData?.isAdmin) {
    navItems.push({ href: "/admin/users", label: "Users", icon: Users });
  }

  if (isLoading) {
    return <div className="p-8 font-serif uppercase tracking-widest animate-pulse">Loading admin workspace...</div>;
  }

  return (
    <div className="flex min-h-screen bg-background font-serif text-foreground selection:bg-primary selection:text-primary-foreground">
      <aside className="w-64 border-r-4 border-foreground flex flex-col bg-[#f5f0e8] z-10 relative shadow-[4px_0_0_0_rgba(0,0,0,0.1)]">
        <div className="p-6 border-b-4 border-foreground bg-white">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <Newspaper className="h-8 w-8" />
            <span className="font-headline font-bold uppercase tracking-widest text-sm leading-tight">The Front Porch<br/>Bulletin</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-4 px-2">Editorial Desk</div>
          {navItems.map((item) => {
            const isActive = item.exact ? location === item.href : location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-none border-2 transition-colors font-bold ${
                  isActive 
                    ? "bg-foreground text-background border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]" 
                    : "border-transparent hover:border-foreground hover:bg-white"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="uppercase tracking-widest text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-6 border-t-4 border-foreground space-y-4 bg-white">
          <div className="text-sm">
            <p className="font-bold font-headline text-lg">{user?.fullName || "Staff Member"}</p>
            <p className="text-muted-foreground break-all text-xs mt-1">{user?.primaryEmailAddress?.emailAddress}</p>
            <p className="text-xs uppercase tracking-widest text-primary mt-2 font-bold bg-primary/10 inline-block px-2 py-1 border border-primary/20">
              {roleData?.isAdmin ? 'Editor-in-Chief' : (roleData?.role || 'Pending')}
            </p>
          </div>
          <Button 
            variant="outline" 
            className="w-full border-2 border-foreground rounded-none uppercase tracking-widest text-xs font-bold hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4 mr-2" /> Clock Out
          </Button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="flex-1 overflow-auto p-8 lg:p-12 z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
