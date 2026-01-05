import { useAuth } from "@/hooks/useAuth";
import { ReactNode } from "react";

interface AuthLoadingScreenProps {
  children: ReactNode;
}

export const AuthLoadingScreen = ({ children }: AuthLoadingScreenProps) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">T</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">TaxForge</h1>
            <p className="text-xs text-muted-foreground">Nigeria Tax Calculator</p>
          </div>
        </div>

        {/* Loading spinner */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full border-3 border-muted" />
            <div className="absolute inset-0 h-10 w-10 rounded-full border-3 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading your session...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
