import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateArticle, useUpdateArticle, useGetArticle, getGetArticleQueryKey, useListCategories, getListCategoriesQueryKey, getListArticlesQueryKey, getGetArticlesSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "wouter";
import { ImageUpload } from "@/components/admin/ImageUpload";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional().nullable(),
  content: z.string().min(1, "Content is required"),
  author: z.string().min(1, "Author is required"),
  category: z.string().min(1, "Category is required"),
  featured: z.boolean().default(false),
  page2Featured: z.boolean().default(false),
  publishedAt: z.string().min(1, "Publish date is required"),
});


type FormValues = z.infer<typeof formSchema>;

export default function AdminArticleForm() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const isEditing = !!params?.id;
  const articleId = isEditing ? parseInt(params.id!) : 0;
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoCredit, setPhotoCredit] = useState<string>("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories } = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });
  const { data: article, isLoading: isLoadingArticle } = useGetArticle(articleId, {
    query: { enabled: isEditing, queryKey: getGetArticleQueryKey(articleId) }
  });

  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      content: "",
      author: "",
      category: "",
      featured: false,
      page2Featured: false,
      publishedAt: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (isEditing && article) {
      form.reset({
        title: article.title,
        subtitle: article.subtitle || "",
        content: article.content,
        author: article.author,
        category: article.category,
        featured: article.featured,
        page2Featured: (article as any).page2Featured ?? false,
        publishedAt: article.publishedAt.split('T')[0],
      });
      setPhotoUrl(article.photoUrl ?? null);
      setPhotoCredit(article.photoCredit ?? "");
    }
  }, [isEditing, article, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const formattedValues = {
        ...values,
        photoUrl,
        photoCredit: photoCredit.trim() || null,
        publishedAt: new Date(values.publishedAt).toISOString(),
      };

      if (isEditing) {
        await updateArticle.mutateAsync({ id: articleId, data: formattedValues });
        toast({ title: "Edits saved successfully" });
        queryClient.invalidateQueries({ queryKey: getGetArticleQueryKey(articleId) });
      } else {
        await createArticle.mutateAsync({ data: formattedValues });
        toast({ title: "Article sent to print" });
      }
      
      queryClient.invalidateQueries({ queryKey: getListArticlesQueryKey({ limit: 100 }) });
      queryClient.invalidateQueries({ queryKey: getGetArticlesSummaryQueryKey() });
      setLocation("/admin/articles");
    } catch (err) {
      toast({ variant: "destructive", title: "Typewriter jammed", description: "Error saving article." });
    }
  };

  if (isEditing && isLoadingArticle) {
    return <div className="p-12 text-center uppercase tracking-widest font-bold animate-pulse text-muted-foreground">Retrieving from archives...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <div className="mb-6">
        <Button variant="link" asChild className="p-0 text-muted-foreground hover:text-foreground font-bold uppercase tracking-widest text-xs h-auto">
          <Link href="/admin/articles">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Articles Desk
          </Link>
        </Button>
      </div>

      <header className="border-b-4 border-foreground pb-6 mb-8">
        <h1 className="text-4xl md:text-5xl font-headline font-bold uppercase tracking-widest mb-2">
          {isEditing ? "Revise Article" : "Draft Article"}
        </h1>
        <p className="text-xl text-muted-foreground italic">
          {isEditing ? "Update an existing piece in the archives." : "Prepare a new piece for publication."}
        </p>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white p-6 md:p-10 border-4 border-foreground space-y-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            
            <div className="space-y-6 border-b-2 border-dashed border-foreground/30 pb-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline font-bold uppercase tracking-widest text-lg">Headline</FormLabel>
                    <FormControl>
                      <Input {...field} className="rounded-none border-x-0 border-t-0 border-b-2 border-foreground bg-transparent focus-visible:ring-0 focus-visible:border-primary text-3xl md:text-4xl font-headline font-bold px-0 h-16 placeholder:text-muted-foreground/30" placeholder="EXTRA! EXTRA!" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline font-bold uppercase tracking-widest text-sm text-muted-foreground">Deck (Subtitle)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} className="rounded-none border-x-0 border-t-0 border-b border-foreground bg-transparent focus-visible:ring-0 focus-visible:border-primary italic text-xl px-0 h-12 placeholder:text-muted-foreground/30" placeholder="A brief summary of the scoop..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#f5f0e8] p-6 border-2 border-foreground">
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline font-bold uppercase tracking-widest text-sm">Byline (Author)</FormLabel>
                    <FormControl>
                      <Input {...field} className="rounded-none border-2 border-foreground focus-visible:ring-0 focus-visible:border-primary font-bold bg-white" placeholder="Jane Doe" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline font-bold uppercase tracking-widest text-sm">Section</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-none border-2 border-foreground focus:ring-0 uppercase tracking-wider text-sm font-bold bg-white h-10">
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-none border-2 border-foreground uppercase tracking-wider text-sm font-bold font-sans">
                        {categories?.categories.map((c) => (
                          <SelectItem key={c.slug} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="publishedAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline font-bold uppercase tracking-widest text-sm">Print Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="rounded-none border-2 border-foreground focus-visible:ring-0 focus-visible:border-primary font-mono text-sm bg-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-4 space-y-0 rounded-none border-2 border-foreground p-4 bg-primary/5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-2 border-foreground rounded-none data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground h-6 w-6 mt-0.5"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-headline font-bold uppercase tracking-widest text-lg cursor-pointer">
                        Front Page Story
                      </FormLabel>
                      <FormDescription className="text-foreground/70 italic font-serif text-base mt-1">
                        Pin this story to the top of the front page.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="page2Featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-4 space-y-0 rounded-none border-2 border-foreground p-4 bg-amber-50">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-2 border-foreground rounded-none data-[state=checked]:bg-amber-700 data-[state=checked]:text-white h-6 w-6 mt-0.5"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-headline font-bold uppercase tracking-widest text-lg cursor-pointer">
                        Page 2 Top Story
                      </FormLabel>
                      <FormDescription className="text-foreground/70 italic font-serif text-base mt-1">
                        Pin this story full-width at the top of page 2.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="border-2 border-foreground/20 p-4 bg-[#f5f0e8] space-y-3">
              <ImageUpload
                value={photoUrl}
                onChange={setPhotoUrl}
                label="Lead Photo (optional)"
              />
              {photoUrl && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-1">Photo Credit</label>
                  <Input
                    value={photoCredit}
                    onChange={(e) => setPhotoCredit(e.target.value)}
                    className="rounded-none border-2 border-foreground font-serif text-sm"
                    placeholder="e.g. Photo by Jane Smith"
                  />
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="pt-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-0.5 bg-foreground flex-1"></div>
                    <FormLabel className="font-headline font-bold uppercase tracking-widest text-xl whitespace-nowrap px-4 border-2 border-foreground py-1 bg-[#f5f0e8]">Article Body</FormLabel>
                    <div className="h-0.5 bg-foreground flex-1"></div>
                  </div>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      className="min-h-[500px] rounded-none border-2 border-foreground focus-visible:ring-0 focus-visible:border-primary font-serif leading-relaxed text-lg resize-y p-6 shadow-inner" 
                      placeholder="Start typing the story..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-4 sticky bottom-8 bg-[#f5f0e8]/80 backdrop-blur p-4 border-t-2 border-b-2 border-foreground z-10">
            <Button type="button" variant="outline" asChild className="rounded-none border-2 border-foreground uppercase tracking-widest font-bold text-lg h-14 px-8 bg-white hover:bg-foreground hover:text-background transition-colors">
              <Link href="/admin/articles">Cancel</Link>
            </Button>
            <Button type="submit" disabled={createArticle.isPending || updateArticle.isPending} className="rounded-none border-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest font-bold text-lg h-14 px-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2">
              <Save className="h-5 w-5" />
              {isEditing ? "Save Revisions" : "Send to Print"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
