import { useAuth } from "@/hooks/useAuth";
import { ReactNode, useState, useEffect } from "react";

interface AuthLoadingScreenProps {
  children: ReactNode;
}

export const AuthLoadingScreen = ({ children }: AuthLoadingScreenProps) => {
  const { loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!loading && showSplash) {
      // Start fade-out animation
      setIsExiting(true);
      // Remove splash after animation completes
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 400); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [loading, showSplash]);

  if (showSplash && (loading || isExiting)) {
    return (
      <div 
        className={`min-h-screen bg-background flex flex-col items-center justify-center gap-6 transition-opacity duration-400 ${
          isExiting ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Logo/Brand */}
        <div className={`flex items-center gap-3 transition-all duration-300 ${
          isExiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}>
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">T</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">TaxForge</h1>
            <p className="text-xs text-muted-foreground">Nigeria Tax Calculator</p>
          </div>
        </div>

        {/* Loading spinner */}
        <div className={`flex flex-col items-center gap-3 transition-all duration-300 delay-75 ${
          isExiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}>
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
