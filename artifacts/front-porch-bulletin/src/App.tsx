import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { setAuthTokenGetter } from "@workspace/api-client-react";

import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Articles from "@/pages/Articles";
import ArticleDetail from "@/pages/ArticleDetail";
import Categories from "@/pages/Categories";
import SubmitStory from "@/pages/SubmitStory";
import About from "@/pages/About";
import NewsletterSignup from "@/pages/NewsletterSignup";
import Donate from "@/pages/Donate";
import SignInPage from "@/pages/auth/SignInPage";
import AdminRoute from "@/pages/admin/AdminRoute";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const queryClient = new QueryClient();

function AuthBootstrap() {
  useEffect(() => {
    // Capture token from OAuth callback redirect (?token=...&user=...)
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const user = params.get("user");
    if (token) {
      localStorage.setItem("session_token", token);
      if (user) localStorage.setItem("user_info", user);
      // Clean token out of the URL without a page reload
      const clean = new URL(window.location.href);
      clean.searchParams.delete("token");
      clean.searchParams.delete("user");
      window.history.replaceState({}, "", clean.toString());
    }
    // Wire up the API client to send the JWT as a Bearer token on every request
    setAuthTokenGetter(() => localStorage.getItem("session_token"));
    return () => setAuthTokenGetter(null);
  }, []);

  return null;
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthBootstrap />
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/articles" component={Articles} />
            <Route path="/articles/:id" component={ArticleDetail} />
            <Route path="/categories" component={Categories} />
            <Route path="/about" component={About} />
            <Route path="/submit" component={SubmitStory} />
            <Route path="/newsletter" component={NewsletterSignup} />
            <Route path="/donate" component={Donate} />
            <Route path="/sign-in" component={SignInPage} />
            <Route path="/admin" component={AdminRoute} />
            <Route path="/admin/*" component={AdminRoute} />
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </WouterRouter>
  );
}

export default App;
