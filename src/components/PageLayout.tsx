import { ReactNode } from "react";
import { NavMenu } from "@/components/NavMenu";
import { LucideIcon } from "lucide-react";

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
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

export const PageLayout = ({
  children,
  title,
  description,
  icon: Icon,
  maxWidth = "6xl",
  showBackground = true,
  className = "",
  headerActions,
}: PageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col relative w-full max-w-full overflow-x-hidden">
      {/* Background layers */}
      {showBackground && (
        <>
          <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />
          <div className="fixed inset-0 bg-mesh pointer-events-none" />
          <div className="fixed inset-0 bg-dots opacity-15 pointer-events-none" />
        </>
      )}

      <NavMenu />

      <main className={`flex-1 relative z-10 py-6 pb-8 px-4 sm:px-6 lg:px-8 w-full overflow-x-hidden ${className}`}>
        <div className={`w-full ${maxWidthClasses[maxWidth]} mx-auto overflow-hidden`}>
          {/* Header */}
          {(title || Icon) && (
            <div className="mb-6 sm:mb-8 animate-slide-up">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  {Icon && (
                    <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-primary shadow-lg glow-primary shrink-0">
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    {title && (
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate">
                        {title}
                      </h1>
                    )}
                    {description && (
                      <p className="text-muted-foreground text-sm truncate">
                        {description}
                      </p>
                    )}
                  </div>
                </div>
                {headerActions && (
                  <div className="flex items-center gap-2 shrink-0">
                    {headerActions}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="overflow-hidden">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PageLayout;
