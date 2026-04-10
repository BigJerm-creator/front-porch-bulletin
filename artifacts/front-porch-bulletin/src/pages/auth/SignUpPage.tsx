import { SignUp } from '@clerk/react';
import logo from '@assets/The_(1)_1775854639167.png';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-serif">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img src={logo} alt="The Front Porch Bulletin" className="h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-headline font-bold uppercase tracking-widest text-primary">Bulletin Staff Registry</h2>
          <div className="newspaper-divider" />
        </div>
        <div className="flex justify-center bg-white p-6 border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
        </div>
      </div>
    </div>
  );
}
