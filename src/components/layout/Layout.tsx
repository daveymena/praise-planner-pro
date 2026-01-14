import { ReactNode } from "react";
import { Navigation } from "./Navigation";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Main Content Area */}
      <main className="min-h-screen pt-20 lg:pt-28 pb-32 lg:pb-12 px-4 group/main">
        <div className="max-w-[1700px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </main>

      {/* Decorative Blobs */}
      <div className="fixed top-0 left-0 w-[50vw] h-[50vh] bg-primary/2 overflow-hidden -z-10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[50vw] h-[50vh] bg-primary/2 overflow-hidden -z-10 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
