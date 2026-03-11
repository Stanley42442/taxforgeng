import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, Globe, Monitor, Smartphone, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const PRODUCTION_URL = "https://taxforgeng.com";

type BrowserType = "firefox-desktop" | "firefox-android" | "ios-safari" | "android-generic" | "generic";

function detectBrowser(): BrowserType {
  const ua = navigator.userAgent;
  const isFirefox = /Firefox/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua);

  if (isIOS && isSafari) return "ios-safari";
  if (isFirefox && isAndroid) return "firefox-android";
  if (isFirefox) return "firefox-desktop";
  if (isAndroid) return "android-generic";
  return "generic";
}

interface Step {
  icon: React.ReactNode;
  text: string;
}

function getInstructions(browser: BrowserType): { title: string; description: string; steps: Step[] } {
  switch (browser) {
    case "firefox-desktop":
      return {
        title: "Install on Firefox Desktop",
        description: "Firefox desktop doesn't support one-click PWA install. Here's how to get the app:",
        steps: [
          { icon: <Globe className="h-5 w-5 text-primary" />, text: "Copy the link below and open it in Chrome or Edge for native install support." },
          { icon: <Monitor className="h-5 w-5 text-primary" />, text: "Or bookmark the site and pin it to your taskbar for quick access." },
        ],
      };
    case "firefox-android":
      return {
        title: "Install on Firefox Android",
        description: "You can install this app from Firefox:",
        steps: [
          { icon: <Smartphone className="h-5 w-5 text-primary" />, text: "Tap the three-dot menu (⋮) in the toolbar." },
          { icon: <ExternalLink className="h-5 w-5 text-primary" />, text: 'Select "Install" or "Add to Home Screen".' },
        ],
      };
    case "ios-safari":
      return {
        title: "Install on iPhone / iPad",
        description: "Add the app to your home screen:",
        steps: [
          { icon: <ExternalLink className="h-5 w-5 text-primary" />, text: "Tap the Share button (square with arrow) at the bottom of Safari." },
          { icon: <Smartphone className="h-5 w-5 text-primary" />, text: 'Scroll down and tap "Add to Home Screen".' },
        ],
      };
    case "android-generic":
      return {
        title: "Install App",
        description: "Add the app to your device:",
        steps: [
          { icon: <Smartphone className="h-5 w-5 text-primary" />, text: "Tap the browser menu (⋮ or ⋯)." },
          { icon: <ExternalLink className="h-5 w-5 text-primary" />, text: 'Select "Install app" or "Add to Home Screen".' },
        ],
      };
    default:
      return {
        title: "Install App",
        description: "Open the link below in Chrome or Edge for the best install experience:",
        steps: [
          { icon: <Globe className="h-5 w-5 text-primary" />, text: "Copy the link and open it in a supported browser." },
          { icon: <Monitor className="h-5 w-5 text-primary" />, text: "Click the install icon in the browser's address bar." },
        ],
      };
  }
}

interface InstallAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InstallAppDialog = ({ open, onOpenChange }: InstallAppDialogProps) => {
  const [copied, setCopied] = useState(false);
  const browser = detectBrowser();
  const { title, description, steps } = getInstructions(browser);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PRODUCTION_URL);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">{step.icon}</div>
              <p className="text-sm text-foreground">{step.text}</p>
            </div>
          ))}

          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
            <code className="flex-1 text-sm text-foreground truncate">{PRODUCTION_URL}</code>
            <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="ml-1.5">{copied ? "Copied" : "Copy"}</span>
            </Button>
          </div>

          <Button
            variant="default"
            className="w-full"
            onClick={() => window.open(PRODUCTION_URL, "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in Browser
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
