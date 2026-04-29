import { Layout } from "@/components/layout/Layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(2, "Your name is required"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Please enter a subject"),
  message: z.string().min(20, "Your letter is too short"),
});

type FormValues = z.infer<typeof formSchema>;

export default function SubmitStory() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/letter-to-editor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Submission failed",
          description: data.error || "Something went wrong. Please try again.",
          variant: "destructive",
          className: "font-mono border-2 border-destructive",
        });
        return;
      }

      toast({
        title: "Letter received!",
        description: "Thank you for writing in. The editor will review your submission.",
        className: "font-mono border-2 border-foreground bg-background",
      });

      form.reset();
    } catch {
      toast({
        title: "Submission failed",
        description: "Could not reach the server. Please try again.",
        variant: "destructive",
        className: "font-mono border-2 border-destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-12 border-b-4 border-double border-foreground pb-8">
          <h1 className="font-headline text-4xl md:text-5xl font-bold uppercase tracking-widest mb-4">
            Letter to the Editor
          </h1>
          <p className="font-serif italic text-lg text-foreground/80">
            Have something to say? Write in — we read every letter. Submissions may be printed in an upcoming issue.
          </p>
        </header>

        <div className="bg-foreground/[0.02] border border-foreground p-6 md:p-10 shadow-sm relative">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-foreground"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-foreground"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-foreground"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-foreground"></div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 font-serif">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline font-bold uppercase tracking-widest text-sm">Your Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Jane Smith"
                          className="font-serif rounded-none border-foreground/30 focus-visible:ring-foreground focus-visible:ring-offset-0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="font-mono text-xs text-destructive" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-headline font-bold uppercase tracking-widest text-sm">Your Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="jane@example.com"
                          className="font-serif rounded-none border-foreground/30 focus-visible:ring-foreground focus-visible:ring-offset-0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="font-mono text-xs text-destructive" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline font-bold uppercase tracking-widest text-sm">Subject</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Thoughts on the new park renovation"
                        className="font-serif rounded-none border-foreground/30 focus-visible:ring-foreground focus-visible:ring-offset-0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="font-mono text-xs text-destructive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline font-bold uppercase tracking-widest text-sm">Your Letter</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Dear Editor,&#10;&#10;I wanted to share my thoughts on…"
                        className="font-serif min-h-[280px] rounded-none border-foreground/30 focus-visible:ring-foreground focus-visible:ring-offset-0 leading-loose"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="font-mono text-xs text-destructive" />
                  </FormItem>
                )}
              />

              <p className="font-mono text-[11px] text-foreground/50 text-center leading-relaxed">
                Your letter will be sent directly to the editor's inbox.
                <br />We read every submission and may print it in an upcoming issue.
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-foreground text-background font-mono uppercase tracking-widest py-4 mt-2 hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Sending…" : "Submit to Editor"}
              </button>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
