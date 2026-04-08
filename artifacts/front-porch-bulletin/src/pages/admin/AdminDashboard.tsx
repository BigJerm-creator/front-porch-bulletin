import { Link } from "wouter";
import { useUser } from "@clerk/react";
import { useGetArticlesSummary, getGetArticlesSummaryQueryKey, useGetMyRole, getGetMyRoleQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FileText, Users, PlusCircle, TrendingUp, Clock } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useUser();
  const { data: summary, isLoading } = useGetArticlesSummary({ query: { queryKey: getGetArticlesSummaryQueryKey() } });
  const { data: roleData } = useGetMyRole({ query: { queryKey: getGetMyRoleQueryKey() } });

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <header className="border-b-4 border-foreground pb-6 mb-8 relative">
        <div className="absolute -top-4 -left-4 text-primary opacity-10">
          <FileText className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-5xl font-headline font-bold uppercase tracking-widest mb-2 text-foreground">Editorial Desk</h1>
              <p className="text-2xl text-muted-foreground italic font-serif">Good morning, {user?.firstName || "Editor"}.</p>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-sm uppercase tracking-widest font-bold text-muted-foreground border-b-2 border-foreground/30 pb-1 mb-1">Today's Edition</div>
              <div className="font-headline text-xl">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-4">
        <Button asChild className="rounded-none border-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest font-bold h-12 px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
          <Link href="/admin/articles/new">
            <PlusCircle className="mr-2 h-5 w-5" /> Draft New Article
          </Link>
        </Button>
        {roleData?.isAdmin && (
          <Button variant="outline" asChild className="rounded-none border-2 border-foreground uppercase tracking-widest font-bold h-12 px-6 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all hover:bg-[#f5f0e8]">
            <Link href="/admin/users">
              <Users className="mr-2 h-5 w-5" /> Manage Staff
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <Card className="rounded-none border-4 border-foreground bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="border-b-2 border-foreground pb-4 bg-[#f5f0e8]">
            <CardTitle className="font-headline uppercase tracking-widest text-lg flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" /> Total Articles
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 pb-8 text-center">
            {isLoading ? <Skeleton className="h-16 w-24 mx-auto" /> : (
              <p className="text-7xl font-bold font-headline text-foreground">{summary?.totalArticles}</p>
            )}
            <p className="text-sm uppercase tracking-widest text-muted-foreground mt-4 font-bold">In Archives</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-none border-4 border-foreground bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="border-b-2 border-foreground pb-4 bg-[#f5f0e8]">
            <CardTitle className="font-headline uppercase tracking-widest text-lg flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" /> Recent Output
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 pb-8 text-center">
            {isLoading ? <Skeleton className="h-16 w-24 mx-auto" /> : (
              <p className="text-7xl font-bold font-headline text-primary">{summary?.recentCount}</p>
            )}
            <p className="text-sm uppercase tracking-widest text-muted-foreground mt-4 font-bold">Published Last 7 Days</p>
          </CardContent>
        </Card>

        <Card className="rounded-none border-4 border-foreground bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:row-span-2 flex flex-col">
          <CardHeader className="border-b-2 border-foreground pb-4 bg-[#f5f0e8]">
            <CardTitle className="font-headline uppercase tracking-widest text-lg flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" /> By Section
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex-1 overflow-auto">
            {isLoading ? <div className="space-y-4"><Skeleton className="h-6 w-full"/><Skeleton className="h-6 w-full"/><Skeleton className="h-6 w-full"/></div> : (
              <ul className="space-y-4">
                {summary?.byCategory.map(c => (
                  <li key={c.category} className="group">
                    <div className="flex justify-between items-end border-b-2 border-dotted border-foreground/30 pb-1 mb-1 group-hover:border-primary/50 transition-colors">
                      <span className="uppercase tracking-widest text-sm font-bold text-foreground group-hover:text-primary transition-colors">{c.category}</span>
                      <span className="font-headline font-bold text-2xl">{c.count}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
