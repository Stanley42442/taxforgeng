import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, Loader2 } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      expand={true}
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border/50 group-[.toaster]:shadow-futuristic group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg group-[.toast]:font-medium",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg",
          closeButton: "group-[.toast]:bg-background/80 group-[.toast]:border-border/50 group-[.toast]:hover:bg-secondary",
          success: "group-[.toaster]:border-success/30 group-[.toaster]:bg-success/10",
          error: "group-[.toaster]:border-destructive/30 group-[.toaster]:bg-destructive/10",
          warning: "group-[.toaster]:border-warning/30 group-[.toaster]:bg-warning/10",
          info: "group-[.toaster]:border-primary/30 group-[.toaster]:bg-primary/10",
        },
      }}
      icons={{
        success: <CheckCircle2 className="h-5 w-5 text-success animate-bounce-in" />,
        error: <AlertCircle className="h-5 w-5 text-destructive animate-shake" />,
        warning: <AlertTriangle className="h-5 w-5 text-warning animate-pulse" />,
        info: <Info className="h-5 w-5 text-primary animate-fade-in" />,
        loading: <Loader2 className="h-5 w-5 text-primary animate-spin" />,
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
