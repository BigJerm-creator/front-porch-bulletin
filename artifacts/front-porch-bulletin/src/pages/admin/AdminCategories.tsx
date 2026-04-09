import { useListCategories, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tags } from "lucide-react";

export default function AdminCategories() {
  const { data, isLoading } = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });

  return (
    <div className="space-y-8">
      <header className="border-b-4 border-foreground pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl sm:text-5xl font-headline font-bold uppercase tracking-widest mb-2">Sections</h1>
          <p className="text-xl text-muted-foreground italic font-serif">Publication categories and beats.</p>
        </div>
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
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground py-4 text-base">Slug</TableHead>
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground py-4 text-base">Description</TableHead>
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground py-4 text-base text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.categories.map((category) => (
                <TableRow key={category.id} className="border-b-2 border-foreground/20 hover:bg-[#f5f0e8]/50 transition-colors">
                  <TableCell className="font-headline font-bold text-xl py-4 flex items-center gap-2">
                    <Tags className="h-4 w-4 text-primary" /> {category.name}
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="font-mono text-sm bg-muted px-2 py-1 border border-border">{category.slug}</span>
                  </TableCell>
                  <TableCell className="italic text-muted-foreground py-4 max-w-xs truncate">{category.description || "-"}</TableCell>
                  <TableCell className="text-right font-headline font-bold text-2xl py-4 text-primary">{category.articleCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
