import { useEffect } from "react";
import { useLocation } from "wouter";
import logo from "@assets/The_(1)_1775854639167.png";
import { useIsSignedIn } from "@/hooks/useCurrentUser";

export default function SignInPage() {
  const [, setLocation] = useLocation();
  const isSignedIn = useIsSignedIn();

  useEffect(() => {
    if (isSignedIn) setLocation("/admin");
  }, [isSignedIn, setLocation]);

  const params = new URLSearchParams(window.location.search);
  const error = params.get("error");

  const errorMessages: Record<string, string> = {
    access_denied: "Google sign-in was cancelled.",
    invalid_state: "Session mismatch — please try again.",
    token_exchange_failed: "Could not complete sign-in. Please try again.",
    profile_fetch_failed: "Could not retrieve your Google profile. Please try again.",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-serif">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img src={logo} alt="The Front Porch Bulletin" className="h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-headline font-bold uppercase tracking-widest text-primary">
            Bulletin Staff Login
          </h2>
          <div className="newspaper-divider" />
        </div>

        <div className="bg-white p-8 border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
          {error && (
            <p className="text-sm text-destructive font-serif text-center border border-destructive/30 bg-destructive/5 p-3">
              {errorMessages[error] ?? "An error occurred. Please try again."}
            </p>
          )}

          <p className="text-center font-serif italic text-muted-foreground">
            Sign in with your Google account to access the editorial desk.
          </p>

          <a
            href="/auth/google"
            className="flex items-center justify-center gap-3 w-full border-2 border-foreground bg-white hover:bg-[#f5f0e8] px-6 py-3 font-headline font-bold uppercase tracking-widest text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </a>
        </div>
      </div>
    </div>
  );
}
