import { useGetMyRole, getGetMyRoleQueryKey } from "@workspace/api-client-react";
import { Show } from "@clerk/react";
import { Redirect, useLocation, Route, Switch } from "wouter";
import AdminLayout from "./AdminLayout";
import AdminDashboard from "./AdminDashboard";
import AdminArticles from "./AdminArticles";
import AdminArticleForm from "./AdminArticleForm";
import AdminCategories from "./AdminCategories";
import AdminUsers from "./AdminUsers";
import AdminSpotlight from "./AdminSpotlight";
import AdminObituaries from "./AdminObituaries";
import AdminChurches from "./AdminChurches";
import { Newspaper } from "lucide-react";

export default function AdminRoute() {
  const [, setLocation] = useLocation();
  const { data: roleData, isLoading } = useGetMyRole({ query: { queryKey: getGetMyRoleQueryKey() } });

  return (
    <>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
      
      <Show when="signed-in">
        {isLoading ? (
          <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-serif text-foreground">
            <Newspaper className="h-20 w-20 animate-pulse mb-6 opacity-30 text-primary" />
            <h2 className="text-3xl font-headline font-bold uppercase tracking-widest text-primary">Verifying Credentials...</h2>
          </div>
        ) : (!roleData?.isAdmin && !roleData?.isApproved) ? (
          <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-serif text-foreground">
            <div className="max-w-lg text-center border-4 border-foreground p-12 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <Newspaper className="h-16 w-16 mx-auto mb-6 text-primary" />
              <h2 className="text-4xl font-headline font-bold uppercase tracking-widest mb-6 text-foreground">Pending Approval</h2>
              <div className="newspaper-divider border-t-4 border-b-4 border-foreground" />
              <p className="text-xl italic leading-relaxed text-muted-foreground mt-6 mb-8">
                Your credentials have been received by the editorial desk, but you must be cleared by the Editor-in-Chief before accessing the staff room. 
              </p>
              <div className="bg-primary/5 border-2 border-primary p-4">
                <p className="text-sm font-bold uppercase tracking-widest text-primary">
                  Please check back later or contact the editor.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <AdminLayout>
            <Switch>
              <Route path="/admin" component={AdminDashboard} />
              <Route path="/admin/articles" component={AdminArticles} />
              <Route path="/admin/articles/new" component={AdminArticleForm} />
              <Route path="/admin/articles/:id/edit" component={AdminArticleForm} />
              <Route path="/admin/categories" component={AdminCategories} />
              <Route path="/admin/spotlight" component={AdminSpotlight} />
              <Route path="/admin/obituaries" component={AdminObituaries} />
              <Route path="/admin/churches" component={AdminChurches} />
              <Route path="/admin/users" component={AdminUsers} />
            </Switch>
          </AdminLayout>
        )}
      </Show>
    </>
  );
}
