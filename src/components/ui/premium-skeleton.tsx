import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "card" | "text" | "avatar" | "button";
}

export function PremiumSkeleton({ className, variant = "default", ...props }: SkeletonProps) {
  const baseClasses = "animate-pulse rounded-md";
  
  const variants = {
    default: "bg-muted/60 dark:bg-muted/40",
    card: "bg-gradient-to-r from-muted/40 via-muted/60 to-muted/40 bg-[length:200%_100%] animate-shimmer",
    text: "bg-muted/50 dark:bg-muted/30 h-4",
    avatar: "bg-muted/60 dark:bg-muted/40 rounded-full",
    button: "bg-muted/50 dark:bg-muted/30 rounded-lg",
  };

  return (
    <div
      className={cn(baseClasses, variants[variant], className)}
      {...props}
    />
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("glass-frosted rounded-xl p-6 space-y-4", className)}>
      <div className="flex items-center gap-3">
        <PremiumSkeleton variant="avatar" className="h-10 w-10" />
        <div className="space-y-2 flex-1">
          <PremiumSkeleton variant="text" className="h-4 w-3/4" />
          <PremiumSkeleton variant="text" className="h-3 w-1/2" />
        </div>
      </div>
      <PremiumSkeleton variant="card" className="h-20 w-full rounded-lg" />
      <div className="flex gap-2">
        <PremiumSkeleton variant="button" className="h-9 w-24" />
        <PremiumSkeleton variant="button" className="h-9 w-20" />
      </div>
    </div>
  );
}

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("glass-frosted rounded-xl p-5", className)}>
      <PremiumSkeleton variant="text" className="h-3 w-24 mb-3" />
      <PremiumSkeleton variant="card" className="h-8 w-32 mb-2" />
      <PremiumSkeleton variant="text" className="h-3 w-16" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border/50">
      {Array.from({ length: columns }).map((_, i) => (
        <PremiumSkeleton
          key={i}
          variant="text"
          className={cn("h-4", i === 0 ? "w-1/4" : "w-1/6")}
        />
      ))}
    </div>
  );
}

export function ListItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 p-4", className)}>
      <PremiumSkeleton variant="avatar" className="h-12 w-12" />
      <div className="flex-1 space-y-2">
        <PremiumSkeleton variant="text" className="h-4 w-3/4" />
        <PremiumSkeleton variant="text" className="h-3 w-1/2" />
      </div>
      <PremiumSkeleton variant="button" className="h-8 w-20" />
    </div>
  );
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("glass-frosted rounded-xl p-6", className)}>
      <div className="flex justify-between items-center mb-6">
        <PremiumSkeleton variant="text" className="h-5 w-32" />
        <PremiumSkeleton variant="button" className="h-8 w-24" />
      </div>
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 7 }).map((_, i) => (
          <PremiumSkeleton
            key={i}
            variant="card"
            className="flex-1 rounded-t-lg"
            style={{ height: `${30 + Math.random() * 70}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <PremiumSkeleton variant="text" className="h-4 w-20" />
          <PremiumSkeleton variant="card" className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <PremiumSkeleton variant="button" className="h-10 w-full" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <PremiumSkeleton variant="text" className="h-8 w-48" />
          <PremiumSkeleton variant="text" className="h-4 w-64" />
        </div>
        <PremiumSkeleton variant="button" className="h-10 w-32" />
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

// ============ Page-Specific Skeletons ============

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="space-y-2">
        <PremiumSkeleton variant="text" className="h-8 w-64" />
        <PremiumSkeleton variant="text" className="h-4 w-96" />
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      
      {/* Recent Activity */}
      <div className="glass-frosted rounded-xl p-6">
        <PremiumSkeleton variant="text" className="h-6 w-40 mb-4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <ListItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function ExpensesSkeleton() {
  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <PremiumSkeleton variant="text" className="h-8 w-40" />
          <PremiumSkeleton variant="text" className="h-4 w-56" />
        </div>
        <div className="flex gap-2">
          <PremiumSkeleton variant="button" className="h-10 w-28" />
          <PremiumSkeleton variant="button" className="h-10 w-32" />
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <PremiumSkeleton variant="button" className="h-9 w-32" />
        <PremiumSkeleton variant="button" className="h-9 w-28" />
        <PremiumSkeleton variant="button" className="h-9 w-36" />
      </div>
      
      {/* Expense List */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-frosted rounded-xl p-4 flex items-center gap-4">
            <PremiumSkeleton variant="avatar" className="h-10 w-10" />
            <div className="flex-1 space-y-2">
              <PremiumSkeleton variant="text" className="h-4 w-48" />
              <PremiumSkeleton variant="text" className="h-3 w-32" />
            </div>
            <PremiumSkeleton variant="text" className="h-5 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CalculatorSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <PremiumSkeleton variant="text" className="h-8 w-64 mx-auto" />
        <PremiumSkeleton variant="text" className="h-4 w-80 mx-auto" />
      </div>
      
      {/* Calculator Form */}
      <div className="glass-frosted rounded-xl p-6">
        <FormSkeleton />
      </div>
      
      {/* Tips Section */}
      <div className="glass-frosted rounded-xl p-6 space-y-4">
        <PremiumSkeleton variant="text" className="h-5 w-32" />
        <div className="space-y-2">
          <PremiumSkeleton variant="text" className="h-3 w-full" />
          <PremiumSkeleton variant="text" className="h-3 w-5/6" />
          <PremiumSkeleton variant="text" className="h-3 w-4/6" />
        </div>
      </div>
    </div>
  );
}

export function PayrollSkeleton() {
  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <PremiumSkeleton variant="text" className="h-8 w-40" />
          <PremiumSkeleton variant="text" className="h-4 w-64" />
        </div>
        <PremiumSkeleton variant="button" className="h-10 w-36" />
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Employee Table */}
      <div className="glass-frosted rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <div className="flex gap-4">
            {['Name', 'Position', 'Salary', 'Status', 'Actions'].map((_, i) => (
              <PremiumSkeleton key={i} variant="text" className="h-4 w-24" />
            ))}
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRowSkeleton key={i} columns={5} />
        ))}
      </div>
    </div>
  );
}

export function InvoicesSkeleton() {
  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <PremiumSkeleton variant="text" className="h-8 w-32" />
          <PremiumSkeleton variant="text" className="h-4 w-48" />
        </div>
        <PremiumSkeleton variant="button" className="h-10 w-32" />
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Invoice List */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-frosted rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <PremiumSkeleton variant="avatar" className="h-10 w-10" />
              <div className="space-y-2">
                <PremiumSkeleton variant="text" className="h-4 w-40" />
                <PremiumSkeleton variant="text" className="h-3 w-24" />
              </div>
            </div>
            <div className="text-right space-y-2">
              <PremiumSkeleton variant="text" className="h-5 w-28" />
              <PremiumSkeleton variant="button" className="h-6 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
