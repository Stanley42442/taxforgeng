import { useState, useEffect } from "react";
import { Download, X, Share, Plus, ChevronRight, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { safeLocalStorage } from "@/lib/safeStorage";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = 'ios' | 'android' | 'desktop' | null;

const DISMISS_KEY = "pwa-prompt-dismissed";
const SNOOZE_KEY = "pwa-prompt-snoozed-until";
const SNOOZE_DAYS = 7;

export const InstallPWAPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState<Platform>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    const isInStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    
    setIsStandalone(isInStandaloneMode);
    
    if (isInStandaloneMode) return;

    // Check if dismissed permanently
    const isDismissed = safeLocalStorage.getItem(DISMISS_KEY);
    if (isDismissed) return;

    // Check if snoozed
    const snoozedUntil = safeLocalStorage.getItem(SNOOZE_KEY);
    if (snoozedUntil && new Date(snoozedUntil) > new Date()) return;

    // Detect platform
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isAndroid = /Android/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    
    if (isIOS && isSafari) {
      setPlatform('ios');
      // Show prompt after a short delay for iOS
      setTimeout(() => setShowPrompt(true), 3000);
    } else if (isAndroid) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Listen for beforeinstallprompt (Android/Desktop only)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a short delay
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
      safeLocalStorage.setItem(DISMISS_KEY, "true");
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    safeLocalStorage.setItem(DISMISS_KEY, "true");
  };

  const handleSnooze = () => {
    setShowPrompt(false);
    const snoozeDate = new Date();
    snoozeDate.setDate(snoozeDate.getDate() + SNOOZE_DAYS);
    safeLocalStorage.setItem(SNOOZE_KEY, snoozeDate.toISOString());
  };

  // Don't show if already installed or no platform detected
  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50"
      >
        <div className="bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with app icon */}
          <div className="p-4 pb-3 flex items-start gap-3">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
              <img 
                src="/icon-192.png" 
                alt="TaxForge NG" 
                className="h-12 w-12 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<div class="h-8 w-8 text-primary"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg></div>';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-base">
                Install TaxForge NG
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Quick access & offline calculations
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 -m-1"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Platform-specific content */}
          {platform === 'ios' ? (
            <div className="px-4 pb-4">
              <button
                onClick={() => setShowIOSInstructions(!showIOSInstructions)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <span className="text-sm font-medium">How to install on iPhone</span>
                <ChevronRight className={`h-4 w-4 transition-transform ${showIOSInstructions ? 'rotate-90' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showIOSInstructions && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">1</div>
                        <div className="flex-1">
                          <p className="text-sm">Tap the <strong>Share</strong> button</p>
                          <Share className="h-5 w-5 text-muted-foreground mt-1" />
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">2</div>
                        <div className="flex-1">
                          <p className="text-sm">Scroll down and tap <strong>"Add to Home Screen"</strong></p>
                          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                            <Plus className="h-4 w-4" />
                            <span className="text-xs">Add to Home Screen</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">3</div>
                        <p className="text-sm flex-1">Tap <strong>"Add"</strong> to confirm</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleSnooze} 
                  className="flex-1 text-sm h-10"
                >
                  Remind later
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => setShowIOSInstructions(true)} 
                  className="flex-1 text-sm h-10"
                >
                  Got it
                </Button>
              </div>
            </div>
          ) : (
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 mb-3 p-3 rounded-xl bg-muted/50">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Works offline • No app store needed
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleSnooze} 
                  className="flex-1 text-sm h-10"
                >
                  Remind later
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleInstall} 
                  className="flex-1 text-sm h-10 gap-2"
                  disabled={!deferredPrompt}
                >
                  <Download className="h-4 w-4" />
                  Install
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
