import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { 
  Building2, 
  FileText, 
  Receipt, 
  Bell, 
  Search, 
  Users, 
  FolderOpen,
  Calculator,
  BarChart3,
  Shield,
  type LucideIcon
} from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "hero" | "outline";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  secondaryAction,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "glass-frosted rounded-2xl p-8 md:p-12 text-center animate-fade-in",
      className
    )}>
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 glow-primary animate-float">
        <Icon className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
        {title}
      </h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-6">
        {description}
      </p>
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {action && (
            <Button
              variant={action.variant || "hero"}
              onClick={action.onClick}
              className="hover-lift"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              className="hover-scale"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// Pre-configured empty states for common use cases
export function NoBusinessesEmpty({ onAddBusiness, onAddSamples }: { 
  onAddBusiness: () => void; 
  onAddSamples?: () => void;
}) {
  return (
    <EmptyState
      icon={Building2}
      title="No Saved Businesses"
      description="Start by adding your first business or load sample data to explore the features."
      action={{ label: "Add Business", onClick: onAddBusiness }}
      secondaryAction={onAddSamples ? { label: "Add Sample Data", onClick: onAddSamples } : undefined}
    />
  );
}

export function NoInvoicesEmpty({ onCreateInvoice }: { onCreateInvoice: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No Invoices Yet"
      description="Create your first professional invoice with automatic VAT calculation."
      action={{ label: "Create Invoice", onClick: onCreateInvoice }}
    />
  );
}

export function NoExpensesEmpty({ onAddExpense }: { onAddExpense: () => void }) {
  return (
    <EmptyState
      icon={Receipt}
      title="No Expenses Recorded"
      description="Track your business expenses to maximize tax deductions and stay organized."
      action={{ label: "Add Expense", onClick: onAddExpense }}
    />
  );
}

export function NoRemindersEmpty({ onAddReminder }: { onAddReminder: () => void }) {
  return (
    <EmptyState
      icon={Bell}
      title="No Reminders Set"
      description="Never miss a tax deadline. Set reminders for important filing dates."
      action={{ label: "Add Reminder", onClick: onAddReminder }}
    />
  );
}

export function NoSearchResultsEmpty({ query, onClearSearch }: { 
  query: string; 
  onClearSearch: () => void;
}) {
  return (
    <EmptyState
      icon={Search}
      title="No Results Found"
      description={`We couldn't find anything matching "${query}". Try a different search term.`}
      action={{ label: "Clear Search", onClick: onClearSearch, variant: "outline" }}
    />
  );
}

export function NoTeamMembersEmpty({ onInvite }: { onInvite: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="No Team Members"
      description="Invite team members to collaborate on tax calculations and business management."
      action={{ label: "Invite Member", onClick: onInvite }}
    />
  );
}

export function NoCalculationsEmpty({ onGoToCalculator }: { onGoToCalculator: () => void }) {
  return (
    <EmptyState
      icon={Calculator}
      title="No Calculations Yet"
      description="Start by running a tax calculation to see your tax obligations and savings opportunities."
      action={{ label: "Go to Calculator", onClick: onGoToCalculator }}
    />
  );
}

export function NoDataEmpty({ onRefresh }: { onRefresh: () => void }) {
  return (
    <EmptyState
      icon={BarChart3}
      title="No Data Available"
      description="There's no data to display yet. Check back later or refresh to try again."
      action={{ label: "Refresh", onClick: onRefresh, variant: "outline" }}
    />
  );
}

export function AccessDeniedEmpty({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <EmptyState
      icon={Shield}
      title="Upgrade Required"
      description="This feature requires a higher subscription tier. Upgrade to unlock it."
      action={{ label: "View Plans", onClick: onUpgrade }}
    />
  );
}
