import { Layout } from "@/components/layout/Layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateArticle, useListCategories, getListArticlesQueryKey } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  subtitle: z.string().optional(),
  author: z.string().min(2, "Author name required"),
  category: z.string().min(1, "Please select a category"),
  content: z.string().min(20, "Story content is too short"),
});

export default function SubmitStory() {
  const { data: categoriesData } = useListCategories();
  const { mutate: createArticle, isPending } = useCreateArticle();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      author: "",
      category: "",
      content: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createArticle(
      { data: values },
      {
        onSuccess: () => {
          toast({
            title: "Submission Received",
            description: "Your story has been filed with the editor.",
            className: "font-mono border-2 border-foreground bg-background",
          });
          form.reset();
          queryClient.invalidateQueries({ queryKey: getListArticlesQueryKey() });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Could not submit your story. The press might be jammed.",
            variant: "destructive",
          });
        }
      }
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-12 border-b-4 border-double border-foreground pb-8">
          <h1 className="font-headline text-4xl md:text-5xl font-bold uppercase tracking-widest mb-4">
            Letter to the Editor
          </h1>
          <p className="font-serif italic text-lg text-foreground/80">
            Have a story for the community? A recipe to share? A classified ad? Submit it below for review by our editorial team.
          </p>
        </header>

        <div className="bg-foreground/[0.02] border border-foreground p-6 md:p-10 shadow-sm relative">
          {/* Decorative corner pieces */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-foreground"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-foreground"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-foreground"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-foreground"></div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 font-serif">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline font-bold uppercase tracking-widest text-sm">Headline</FormLabel>
                    <FormControl>
                      <Input placeholder="Local Pie Contest Winners Announced" className="font-serif rounded-none border-foreground/30 focus-visible:ring-foreground focus-visible:ring-offset-0" {...field} />
                    </FormControl>
                    <FormMessage className="font-mono text-xs text-destructive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline font-bold uppercase tracking-widest text-sm">Sub-headline (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Mrs. Higgins takes first prize again" className="font-serif italic rounded-none border-foreground/30 focus-visible:ring-foreground focus-visible:ring-offset-0" {...field} />
                    </FormControl>
                    <FormMessage className="font-mono text-xs text-destructive" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline font-bold uppercase tracking-widest text-sm">Byline (Your Name)</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" className="font-serif rounded-none border-foreground/30 focus-visible:ring-foreground focus-visible:ring-offset-0" {...field} />
                      </FormControl>
                      <FormMessage className="font-mono text-xs text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline font-bold uppercase tracking-widest text-sm">Section</FormLabel>
                      <FormControl>
                        <select 
                          className="flex h-10 w-full rounded-none border border-foreground/30 bg-background px-3 py-2 text-sm font-serif ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="" disabled>Select a section...</option>
                          {categoriesData?.categories.map((cat) => (
                            <option key={cat.id} value={cat.slug}>{cat.name}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage className="font-mono text-xs text-destructive" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline font-bold uppercase tracking-widest text-sm">Story Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write your story here..." 
                        className="font-serif min-h-[250px] rounded-none border-foreground/30 focus-visible:ring-foreground focus-visible:ring-offset-0 leading-loose" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="font-mono text-xs text-destructive" />
                  </FormItem>
                )}
              />

              <button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-foreground text-background font-mono uppercase tracking-widest py-4 mt-8 hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                {isPending ? "Filing Story..." : "Submit to Editor"}
              </button>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
