import { useAuth } from "@/hooks/useAuth";
import { ReactNode, useState, useEffect } from "react";
import { LavaLampBackground } from "./LavaLampBackground";

interface AuthLoadingScreenProps {
  children: ReactNode;
}

export const AuthLoadingScreen = ({ children }: AuthLoadingScreenProps) => {
  const { loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!loading && showSplash) {
      setIsExiting(true);
      const timer = setTimeout(() => setShowSplash(false), 400);
      return () => clearTimeout(timer);
    }
  }, [loading, showSplash]);

  useEffect(() => {
    const forceTimeout = setTimeout(() => {
      if (showSplash) {
        console.warn('[AuthLoadingScreen] Force hiding splash after 15s timeout');
        setIsExiting(true);
        setTimeout(() => setShowSplash(false), 400);
      }
    }, 15000);
    return () => clearTimeout(forceTimeout);
  }, [showSplash]);

  if (showSplash && (loading || isExiting)) {
    return (
      <div
        className={`min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden transition-opacity duration-400 ${
          isExiting ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <LavaLampBackground />

        <div className={`relative z-10 flex flex-col items-center gap-5 transition-all duration-300 ${
          isExiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}>
          {/* Logo */}
          <img
            src="/icon-192.png"
            alt="TaxForge"
            className="w-16 h-16 rounded-2xl shadow-lg"
          />

          {/* Brand text */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">TaxForge</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Nigeria Tax Calculator</p>
          </div>

          {/* Dual-ring spinner */}
          <div className="relative w-10 h-10 mt-2">
            <div
              className="absolute inset-0 rounded-full animate-spin"
              style={{
                border: '2.5px solid transparent',
                borderTopColor: 'hsl(var(--primary))',
                borderRightColor: 'hsl(var(--primary) / 0.3)',
                animationDuration: '1s',
              }}
            />
            <div
              className="absolute inset-1.5 rounded-full animate-spin"
              style={{
                border: '2px solid transparent',
                borderBottomColor: 'hsl(var(--accent))',
                borderLeftColor: 'hsl(var(--accent) / 0.3)',
                animationDirection: 'reverse',
                animationDuration: '1.4s',
              }}
            />
          </div>

          <p className="text-xs text-muted-foreground animate-pulse">Loading your session…</p>
        </div>

        {/* Bottom gradient progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden">
          <div
            className="h-full w-1/3 rounded-full animate-shimmer"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))',
              backgroundSize: '200% 100%',
            }}
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
