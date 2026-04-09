import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function BulkEmailDialog() {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; total: number } | null>(null);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!subject.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${BASE}/api/newsletter/send-edition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Send failed";
      toast({ variant: "destructive", title: "Send failed", description: msg });
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSubject("");
    setMessage("");
    setResult(null);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-widest border-2 border-foreground bg-[#f5f0e8] hover:bg-foreground hover:text-background transition-colors"
      >
        <Mail className="h-3.5 w-3.5 shrink-0" /> Send Bulletin
      </button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
        <DialogContent className="rounded-none border-4 border-foreground bg-[#f5f0e8] font-serif max-w-lg p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b-2 border-foreground bg-white">
            <p className="text-xs font-mono uppercase tracking-widest text-foreground/50 mb-1">The Front Porch Bulletin</p>
            <DialogTitle className="font-headline text-2xl font-bold uppercase tracking-widest">
              Send Bulletin to Subscribers
            </DialogTitle>
          </DialogHeader>

          {result ? (
            <div className="px-6 py-8 text-center space-y-3">
              <p className="font-headline text-4xl font-bold">{result.sent}</p>
              <p className="font-serif italic text-lg text-foreground/70">
                {result.sent === 1 ? "edition" : "editions"} dispatched to {result.total} subscriber{result.total !== 1 ? "s" : ""}
              </p>
              {result.sent < result.total && (
                <p className="font-mono text-xs text-foreground/50 uppercase tracking-widest">
                  {result.total - result.sent} could not be delivered
                </p>
              )}
              <DialogFooter className="pt-6 justify-center">
                <Button onClick={handleClose} className="rounded-none border-2 border-foreground bg-foreground text-background hover:bg-foreground/90 uppercase tracking-widest font-bold px-8">
                  Close
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="px-6 py-6 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2">Subject Line</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="The Front Porch Bulletin — April 2026"
                  className="rounded-none border-2 border-foreground focus-visible:ring-0 focus-visible:border-primary font-serif text-base bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2">
                  Opening Message <span className="normal-case font-normal text-foreground/40 tracking-normal">(optional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Dear neighbors, this week's edition is ready..."
                  className="w-full rounded-none border-2 border-foreground focus:outline-none focus:border-primary font-serif text-sm p-3 bg-white resize-none"
                />
              </div>
              <p className="text-xs font-mono uppercase tracking-widest text-foreground/40">
                The current front page headlines will be included automatically.
              </p>
              <DialogFooter className="pt-2 border-t-2 border-foreground/20">
                <Button variant="outline" onClick={handleClose} className="rounded-none border-2 border-foreground uppercase tracking-widest font-bold">
                  Cancel
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={sending || !subject.trim()}
                  className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {sending ? "Dispatching..." : "Send to All Subscribers"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
