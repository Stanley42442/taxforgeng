import * as React from "react";
import { Loader2, Check, X } from "lucide-react";
import { Button, type ButtonProps } from "./button";
import { cn } from "@/lib/utils";

type LoadingState = "idle" | "loading" | "success" | "error";

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  state?: LoadingState;
  onLoadingComplete?: () => void;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      className,
      children,
      loading = false,
      loadingText,
      successText,
      errorText,
      state: externalState,
      onLoadingComplete,
      disabled,
      ...props
    },
    ref
  ) => {
    const [internalState, setInternalState] = React.useState<LoadingState>("idle");
    const state = externalState ?? (loading ? "loading" : internalState);

    React.useEffect(() => {
      if (state === "success" || state === "error") {
        const timer = setTimeout(() => {
          setInternalState("idle");
          onLoadingComplete?.();
        }, 2000);
        return () => clearTimeout(timer);
      }
    }, [state, onLoadingComplete]);

    const isDisabled = disabled || state === "loading";

    const stateClasses = {
      idle: "",
      loading: "cursor-wait",
      success: "bg-success hover:bg-success text-success-foreground",
      error: "bg-destructive hover:bg-destructive text-destructive-foreground animate-shake",
    };

    const renderContent = () => {
      switch (state) {
        case "loading":
          return (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {loadingText || children}
            </>
          );
        case "success":
          return (
            <>
              <Check className="h-4 w-4 animate-scale-in" />
              {successText || "Success!"}
            </>
          );
        case "error":
          return (
            <>
              <X className="h-4 w-4" />
              {errorText || "Error"}
            </>
          );
        default:
          return children;
      }
    };

    return (
      <Button
        ref={ref}
        className={cn(
          "transition-all duration-300",
          stateClasses[state],
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {renderContent()}
      </Button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";

export { LoadingButton, type LoadingButtonProps, type LoadingState };
