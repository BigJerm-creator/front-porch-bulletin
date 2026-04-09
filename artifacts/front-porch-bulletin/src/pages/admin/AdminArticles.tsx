import { Link } from "wouter";
import { useListArticles, getListArticlesQueryKey, useDeleteArticle, getGetArticlesSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Trash2, Edit, PlusCircle, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminArticles() {
  const { data, isLoading } = useListArticles({ limit: 100 }, { query: { queryKey: getListArticlesQueryKey({ limit: 100 }) } });
  const deleteArticle = useDeleteArticle();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = async (id: number) => {
    try {
      await deleteArticle.mutateAsync({ id });
      toast({ title: "Article deleted", description: "The article has been permanently removed." });
      queryClient.invalidateQueries({ queryKey: getListArticlesQueryKey({ limit: 100 }) });
      queryClient.invalidateQueries({ queryKey: getGetArticlesSummaryQueryKey() });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete article." });
    }
  };

  return (
    <div className="space-y-8">
      <header className="border-b-4 border-foreground pb-6 mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-headline font-bold uppercase tracking-widest mb-2">Articles Desk</h1>
          <p className="text-xl text-muted-foreground italic font-serif">Manage publication content.</p>
        </div>
        <Button asChild className="rounded-none border-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest font-bold h-12 px-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all shrink-0">
          <Link href="/admin/articles/new">
            <PlusCircle className="mr-2 h-5 w-5" /> Draft New
          </Link>
        </Button>
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
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground text-base py-4">Headline</TableHead>
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground text-base py-4">Byline</TableHead>
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground text-base py-4">Section</TableHead>
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground text-base py-4 text-center">Front Page</TableHead>
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground text-base py-4">Print Date</TableHead>
                <TableHead className="font-headline font-bold uppercase tracking-widest text-foreground text-base py-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.articles.map((article) => (
                <TableRow key={article.id} className="border-b-2 border-foreground/20 hover:bg-[#f5f0e8]/50 transition-colors group">
                  <TableCell className="font-medium max-w-xs py-4">
                    <div className="truncate font-headline font-bold text-lg leading-tight group-hover:text-primary transition-colors">{article.title}</div>
                  </TableCell>
                  <TableCell className="py-4 italic text-muted-foreground">{article.author}</TableCell>
                  <TableCell className="uppercase text-xs font-bold tracking-widest py-4">
                    <span className="bg-muted px-2 py-1 border border-border">{article.category}</span>
                  </TableCell>
                  <TableCell className="text-center py-4">
                    {article.featured && <Star className="h-5 w-5 mx-auto text-primary fill-primary drop-shadow-sm" />}
                  </TableCell>
                  <TableCell className="py-4 font-mono text-sm">
                    {format(new Date(article.publishedAt), "MM/dd/yyyy")}
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild className="rounded-none border-2 border-foreground uppercase text-xs font-bold tracking-wider h-8 hover:bg-foreground hover:text-background">
                        <Link href={`/admin/articles/${article.id}/edit`}>
                          <Edit className="h-3 w-3 mr-1" /> Edit
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="rounded-none border-2 border-foreground text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive uppercase text-xs h-8 px-2">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-none border-4 border-foreground font-serif bg-[#f5f0e8] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-headline text-3xl uppercase tracking-widest border-b-2 border-foreground pb-4">Retract Article?</AlertDialogTitle>
                            <AlertDialogDescription className="text-lg text-foreground/80 italic pt-4">
                              This will permanently burn this piece from the archives. It cannot be recovered.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-6 pt-4 border-t-2 border-foreground/20">
                            <AlertDialogCancel className="rounded-none border-2 border-foreground uppercase tracking-widest font-bold">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(article.id)} className="rounded-none border-2 border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90 uppercase tracking-widest font-bold">Retract & Destroy</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {data?.articles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-12 w-12 mb-4 opacity-20" />
                      <p className="text-xl italic font-serif">No articles in the archives.</p>
                      <p className="text-sm uppercase tracking-widest mt-2 font-bold opacity-50">Time to start writing.</p>
                    </div>
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
