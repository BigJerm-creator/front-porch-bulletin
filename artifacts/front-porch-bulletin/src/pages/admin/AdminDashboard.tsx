import { Link } from "wouter";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGetArticlesSummary, getGetArticlesSummaryQueryKey, useGetMyRole, getGetMyRoleQueryKey, useListChurches, getListChurchesQueryKey, useGetSpotlight, getGetSpotlightQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Star, Church, Info, Users, ArrowRight, PlusCircle, Newspaper } from "lucide-react";

function SectionCard({
  href,
  icon: Icon,
  title,
  description,
  meta,
  metaLoading,
  accent,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  meta?: string;
  metaLoading?: boolean;
  accent?: boolean;
}) {
  return (
    <Link href={href}>
      <div className={`group border-4 border-foreground bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1.5 hover:translate-y-1.5 transition-all cursor-pointer h-full flex flex-col ${accent ? "bg-primary text-primary-foreground" : ""}`}>
        <div className={`px-5 pt-5 pb-4 border-b-2 border-foreground flex items-center justify-between ${accent ? "bg-primary/80" : "bg-[#f5f0e8]"}`}>
          <div className="flex items-center gap-3">
            <Icon className={`h-5 w-5 shrink-0 ${accent ? "text-primary-foreground" : "text-primary"}`} />
            <h2 className={`font-headline font-bold uppercase tracking-widest text-base ${accent ? "text-primary-foreground" : ""}`}>{title}</h2>
          </div>
          <ArrowRight className={`h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ${accent ? "text-primary-foreground" : ""}`} />
        </div>
        <div className="px-5 py-4 flex-1 flex flex-col justify-between gap-3">
          <p className={`font-serif text-sm leading-relaxed ${accent ? "text-primary-foreground/80" : "text-foreground/70"}`}>{description}</p>
          {metaLoading ? (
            <Skeleton className="h-4 w-24" />
          ) : meta ? (
            <p className={`font-mono text-xs uppercase tracking-widest font-bold ${accent ? "text-primary-foreground/60" : "text-foreground/40"}`}>{meta}</p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  const currentUser = useCurrentUser();
  const { data: summary, isLoading: summaryLoading } = useGetArticlesSummary({ query: { queryKey: getGetArticlesSummaryQueryKey() } });
  const { data: roleData } = useGetMyRole({ query: { queryKey: getGetMyRoleQueryKey() } });
  const { data: churches, isLoading: churchesLoading } = useListChurches({ query: { queryKey: getListChurchesQueryKey() } });
  const { data: spotlight, isLoading: spotlightLoading } = useGetSpotlight({ query: { queryKey: getGetSpotlightQueryKey() } });

  return (
    <div className="space-y-10">
      <header className="border-b-4 border-foreground pb-6">
        <div className="flex justify-between items-end gap-4">
          <div>
            <h1 className="text-5xl font-headline font-bold uppercase tracking-widest mb-2">Editorial Desk</h1>
            <p className="text-2xl text-muted-foreground italic font-serif">Good to see you, {currentUser?.name?.split(" ")[0] || "Editor"}.</p>
          </div>
          <div className="text-right hidden sm:block shrink-0">
            <div className="text-xs uppercase tracking-widest font-bold text-muted-foreground border-b-2 border-foreground/30 pb-1 mb-1">Today's Edition</div>
            <div className="font-headline text-lg">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
          </div>
        </div>
      </header>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-5 border-b border-foreground/20 pb-2">Front Page Sections — click any to edit</p>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          <SectionCard
            href="/admin/articles"
            icon={FileText}
            title="Articles"
            description="Manage published stories, write new pieces, or archive old ones. The main editorial engine of the paper."
            meta={summaryLoading ? undefined : `${summary?.totalArticles ?? 0} articles · ${summary?.recentCount ?? 0} this week`}
            metaLoading={summaryLoading}
            accent
          />

          <SectionCard
            href="/admin/spotlight"
            icon={Star}
            title="Student Spotlight"
            description="Feature a local student on the front page. Update the name, school, grade, and write-up."
            meta={spotlightLoading ? undefined : spotlight ? `Currently: ${spotlight.name}` : "No spotlight set"}
            metaLoading={spotlightLoading}
          />

          <SectionCard
            href="/admin/churches"
            icon={Church}
            title="Church Directory"
            description="Maintain the church listing on the front page. Add congregations, update service times, or remove listings."
            meta={churchesLoading ? undefined : `${churches?.churches.length ?? 0} listings`}
            metaLoading={churchesLoading}
          />

          <SectionCard
            href="/admin/about"
            icon={Info}
            title="About"
            description="Edit the founding story, body text, office location, and editorial staff listed on the About page."
          />

          <SectionCard
            href="/admin/issue-settings"
            icon={Newspaper}
            title="Issue Settings"
            description="Set the current issue number, month, and year. These appear in the page header and printed edition."
          />

          {roleData?.isAdmin && (
            <SectionCard
              href="/admin/users"
              icon={Users}
              title="Staff"
              description="Approve new staff members, manage roles, and review everyone with access to the editorial desk."
              meta="Admin only"
            />
          )}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-5 border-b border-foreground/20 pb-2">Quick Actions</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/articles/new">
            <div className="flex items-center gap-2 px-5 h-11 border-4 border-foreground bg-primary text-primary-foreground font-bold uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer">
              <PlusCircle className="h-4 w-4" /> Draft New Article
            </div>
          </Link>
          <Link href="/admin/churches">
            <div className="flex items-center gap-2 px-5 h-11 border-4 border-foreground bg-white font-bold uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer hover:bg-[#f5f0e8]">
              <PlusCircle className="h-4 w-4" /> Add Church
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
