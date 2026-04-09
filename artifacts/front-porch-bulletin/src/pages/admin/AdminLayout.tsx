import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { useGetMyRole, getGetMyRoleQueryKey } from "@workspace/api-client-react";
import { FileText, Tags, Users, LogOut, LayoutDashboard, Star, Church, BookOpen, Printer } from "lucide-react";
import logoSrc from "@assets/The_1775669458963.png";
import { BulkEmailDialog } from "@/components/admin/BulkEmailDialog";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { data: roleData } = useGetMyRole({ query: { queryKey: getGetMyRoleQueryKey() } });

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/articles", label: "Articles", icon: FileText },
    { href: "/admin/categories", label: "Categories", icon: Tags },
    { href: "/admin/spotlight", label: "Spotlight", icon: Star },
    { href: "/admin/obituaries", label: "Obituaries", icon: BookOpen },
    { href: "/admin/churches", label: "Churches", icon: Church },
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
              style={{ mixBlendMode: "multiply" }}
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

          {/* Press actions — above the dividing line */}
          <div className="pt-3 space-y-1.5">
            <p className="text-xs uppercase tracking-widest text-foreground/30 font-bold px-2 pb-1">Press</p>
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
          <p className="text-xs font-bold font-headline truncate">{user?.fullName || "Staff Member"}</p>
          <p className="text-xs uppercase tracking-widest text-primary font-bold">{roleData?.isAdmin ? "Editor-in-Chief" : (roleData?.role || "Pending")}</p>
          <button
            onClick={() => signOut()}
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
