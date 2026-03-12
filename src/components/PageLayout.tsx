import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { LavaLampBackground } from "./LavaLampBackground";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl" | "7xl" | "full";
  showBackground?: boolean;
  className?: string;
  headerActions?: ReactNode;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-[1400px]",
  full: "max-w-full",
};

export const PageLayout = ({
  children,
  title,
  description,
  icon: Icon,
  maxWidth = "7xl",
  showBackground = true,
  className = "",
  headerActions,
}: PageLayoutProps) => {
  return (
    <div className={`min-h-screen flex flex-col relative w-full overflow-x-hidden bg-background ${showBackground ? 'bg-ambient' : ''}`}>
      {showBackground && <LavaLampBackground />}
      <main className={`flex-1 relative z-10 py-6 sm:py-8 pb-10 px-4 sm:px-6 lg:px-8 w-full ${className}`}>
        <div className={`w-full ${maxWidthClasses[maxWidth]} mx-auto`}>
          {/* Header */}
          {(title || Icon) && (
            <div className="mb-8 sm:mb-10 animate-slide-up">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {Icon && (
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground break-words">
                      {title}
                    </h1>
                    {description && (
                      <p className="text-muted-foreground text-sm mt-1 break-words">
                        {description}
                      </p>
                    )}
                  </div>
                </div>
                {headerActions && (
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {headerActions}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="w-full overflow-hidden [&>*]:max-w-full [&_.overflow-x-auto]:max-w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PageLayout;
