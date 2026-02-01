import { useState, useEffect, useMemo } from "react";
import { PageLayout } from "@/components/PageLayout";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutDashboard,
  Building2,
  Receipt,
  Bell,
  TrendingUp,
  TrendingDown,
  Calculator,
  ArrowRight,
  Plus,
  Loader2,
  Calendar,
  AlertTriangle,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
  PieChart,
  Activity,
  Filter,
  Download,
  FileSpreadsheet,
  User,
  Home,
  Heart,
  Wallet,
  Shield,
} from "lucide-react";
import { formatCurrency } from "@/lib/taxCalculations";
import { format, isAfter, addDays, subDays, subMonths, startOfWeek, startOfMonth, startOfQuarter, startOfYear, eachDayOfInterval, isWithinInterval } from "date-fns";
import { SparklineChart } from "@/components/SparklineChart";
import { exportDashboardToPDF, exportDashboardToCSV, DashboardExportData } from "@/lib/dashboardExport";
import { toast } from "sonner";
import logger from "@/lib/logger";
import { safeLocalStorage } from "@/lib/safeStorage";
import { ExpenseCharts } from "@/components/ExpenseCharts";
import { PremiumOnboarding } from "@/components/PremiumOnboarding";
import { DisclaimerModal } from "@/components/DisclaimerModal";
import { FeedbackForm } from "@/components/FeedbackForm";
// seedSampleData import removed - sample data is now opt-in only
import { useUpcomingReminders } from "@/hooks/useUpcomingReminders";
import { Badge } from "@/components/ui/badge";
import { SharedElement } from "@/components/PageTransition";
import { motion } from "framer-motion";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { usePersonalExpenses } from "@/hooks/usePersonalExpenses";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  isDeductible: boolean;
  businessId?: string;
}

interface ExpenseSummary {
  totalIncome: number;
  totalExpenses: number;
  deductibleExpenses: number;
}

interface ReminderSummary {
  id: string;
  title: string;
  dueDate: string;
  businessName: string;
}

const Dashboard = () => {
  const { tier, savedBusinesses, loading: businessLoading, refreshBusinesses } = useSubscription();
  const { user } = useAuth();
  const { urgentCount } = useUpcomingReminders();
  const navigate = useNavigate();
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    deductibleExpenses: 0,
  });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<ReminderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  // dataSeeded state removed - sample data is now opt-in only
  const [expandedBusinessId, setExpandedBusinessId] = useState<string | null>(null);
  const [expandedReminderId, setExpandedReminderId] = useState<string | null>(null);
  const [summaryExpanded, setSummaryExpanded] = useState(() => {
    const saved = safeLocalStorage.getItem('dashboard_summary_expanded');
    return saved !== 'false';
  });
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>(() => {
    const saved = safeLocalStorage.getItem('dashboard_date_range');
    return (saved as 'week' | 'month' | 'quarter' | 'year') || 'month';
  });
  const [dashboardMode, setDashboardMode] = useState<'business' | 'personal'>(() => {
    const saved = safeLocalStorage.getItem('dashboard_mode');
    return (saved as 'business' | 'personal') || 'business';
  });
  
  // Personal expenses data
  const { annualTotals, totalDeductible, loading: personalLoading } = usePersonalExpenses();

  useEffect(() => {
    safeLocalStorage.setItem('dashboard_date_range', dateRange);
  }, [dateRange]);

  useEffect(() => {
    safeLocalStorage.setItem('dashboard_summary_expanded', summaryExpanded.toString());
  }, [summaryExpanded]);
  
  useEffect(() => {
    safeLocalStorage.setItem('dashboard_mode', dashboardMode);
  }, [dashboardMode]);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;
      
      // Check if user has completed onboarding
      const { data } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();

      // Show onboarding wizard if not completed
      if (data && data.onboarding_completed === false) {
        setShowOnboarding(true);
      } else {
        if (!safeLocalStorage.getItem('taxforge_disclaimer_accepted')) {
          setShowDisclaimer(true);
        } else if (!safeLocalStorage.getItem('taxforge_welcome_shown')) {
          setShowWelcome(true);
        }
      }
    };

    checkOnboardingStatus();
  }, [user]);

  // Auto-seeding removed - sample data is now opt-in only via SavedBusinesses page

  // Fetch dashboard data function - extracted to allow re-use
  const fetchDashboardData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: expenseData } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('date', { ascending: false });

    if (expenseData) {
      const mapped: Expense[] = expenseData.map(e => ({
        id: e.id,
        date: e.date,
        description: e.description || '',
        amount: Number(e.amount),
        category: e.category,
        type: e.type as 'income' | 'expense',
        isDeductible: e.is_deductible,
        businessId: e.business_id || undefined,
      }));
      setExpenses(mapped);

      const income = mapped.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
      const expense = mapped.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
      const deductible = mapped.filter(e => e.isDeductible).reduce((sum, e) => sum + e.amount, 0);

      setExpenseSummary({ totalIncome: income, totalExpenses: expense, deductibleExpenses: deductible });
    }

    // Fetch incomplete reminders (not completed) for dashboard
    const { data: reminders } = await supabase
      .from('reminders')
      .select('id, title, due_date, business_id, is_completed')
      .eq('user_id', user.id)
      .eq('is_completed', false)
      .order('due_date', { ascending: true })
      .limit(5);

    if (reminders) {
      const reminderList: ReminderSummary[] = reminders.map(r => {
        const business = savedBusinesses.find(b => b.id === r.business_id);
        return {
          id: r.id,
          title: r.title,
          dueDate: r.due_date,
          businessName: business?.name || 'General',
        };
      });
      setUpcomingReminders(reminderList);
    }

    setLoading(false);
  };

  // Initial data fetch
  useEffect(() => {
    if (!businessLoading) {
      fetchDashboardData();
    }
  }, [user, businessLoading, savedBusinesses]);

  // Realtime subscription for expenses - updates dashboard when expenses change
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('dashboard-expenses')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refetch data when expenses change
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const dateRangeStart = useMemo(() => {
    const now = new Date();
    switch (dateRange) {
      case 'week': return startOfWeek(now);
      case 'month': return startOfMonth(now);
      case 'quarter': return startOfQuarter(now);
      case 'year': return startOfYear(now);
      default: return startOfMonth(now);
    }
  }, [dateRange]);

  // Create set of active business IDs for filtering orphaned expenses
  const activeBusinessIds = useMemo(() => 
    new Set(savedBusinesses.map(b => b.id)),
    [savedBusinesses]
  );

  // Filter expenses to only include those from active businesses
  const validExpenses = useMemo(() => {
    return expenses.filter(e => {
      // Keep expenses without business_id (general expenses)
      if (!e.businessId) return true;
      // Only keep expenses linked to active businesses
      return activeBusinessIds.has(e.businessId);
    });
  }, [expenses, activeBusinessIds]);

  const filteredExpenses = useMemo(() => {
    return validExpenses.filter(e => {
      const expenseDate = new Date(e.date);
      return isWithinInterval(expenseDate, { start: dateRangeStart, end: new Date() });
    });
  }, [validExpenses, dateRangeStart]);

  const filteredSummary = useMemo(() => {
    const income = filteredExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const expense = filteredExpenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    const deductible = filteredExpenses.filter(e => e.isDeductible).reduce((sum, e) => sum + e.amount, 0);
    return { totalIncome: income, totalExpenses: expense, deductibleExpenses: deductible };
  }, [filteredExpenses]);

  const sparklineData = useMemo(() => {
    const today = new Date();
    const last7Days = eachDayOfInterval({ start: subDays(today, 6), end: today });
    
    const incomeByDay = last7Days.map(day => {
      return validExpenses
        .filter(e => e.type === 'income' && format(new Date(e.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
        .reduce((sum, e) => sum + e.amount, 0);
    });
    
    const expensesByDay = last7Days.map(day => {
      return validExpenses
        .filter(e => e.type === 'expense' && format(new Date(e.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
        .reduce((sum, e) => sum + e.amount, 0);
    });
    
    const netByDay = incomeByDay.map((inc, i) => inc - expensesByDay[i]);
    
    return { income: incomeByDay, expenses: expensesByDay, net: netByDay };
  }, [validExpenses]);

  if (!user) {
    return (
      <PageLayout title="Dashboard" description="Please sign in to access your dashboard" icon={LayoutDashboard}>
        <div className="max-w-md mx-auto text-center">
          <div className="glass-frosted rounded-3xl p-10">
            <p className="text-muted-foreground mb-6">Please sign in to access your dashboard</p>
            <Button variant="glow" size="lg" onClick={() => navigate('/auth')}>Sign In</Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (loading || businessLoading || personalLoading) {
    return (
      <PageLayout title="Dashboard" icon={LayoutDashboard}>
        <div className="space-y-6 animate-fade-in">
          {/* Summary section skeleton */}
          <div className="glass-frosted rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="skeleton-shimmer h-10 w-10 rounded-xl" />
              <div className="space-y-2">
                <div className="skeleton-shimmer h-5 w-40 rounded" />
                <div className="skeleton-shimmer h-3 w-24 rounded" />
              </div>
            </div>
            
            {/* Stats grid skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass rounded-xl p-4">
                  <div className="skeleton-shimmer h-3 w-16 mb-2 rounded" />
                  <div className="skeleton-shimmer h-6 w-24 mb-1 rounded" />
                  <div className="skeleton-shimmer h-3 w-12 rounded" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Quick actions skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-frosted rounded-xl p-5 flex flex-col items-center gap-3">
                <div className="skeleton-shimmer h-12 w-12 rounded-xl" />
                <div className="skeleton-shimmer h-4 w-20 rounded" />
              </div>
            ))}
          </div>
          
          {/* Content grid skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="glass-frosted rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="skeleton-shimmer h-5 w-32 rounded" />
                  <div className="skeleton-shimmer h-8 w-20 rounded-lg" />
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="skeleton-shimmer h-10 w-10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="skeleton-shimmer h-4 w-3/4 rounded" />
                        <div className="skeleton-shimmer h-3 w-1/2 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  const netIncome = filteredSummary.totalIncome - filteredSummary.totalExpenses;
  const totalTurnover = savedBusinesses.reduce((sum, b) => sum + b.turnover, 0);

  const dateRangeLabels = {
    week: 'This Week',
    month: 'This Month',
    quarter: 'This Quarter',
    year: 'This Year',
  };

  const handleExport = (format: 'pdf' | 'csv') => {
    const exportData: DashboardExportData = {
      dateRange: dateRangeLabels[dateRange],
      dateRangeStart: dateRangeStart,
      dateRangeEnd: new Date(),
      totalIncome: filteredSummary.totalIncome,
      totalExpenses: filteredSummary.totalExpenses,
      netIncome: netIncome,
      deductibleExpenses: filteredSummary.deductibleExpenses,
      businessCount: savedBusinesses.length,
      totalTurnover: totalTurnover,
      transactionCount: expenses.length,
      reminderCount: upcomingReminders.length,
      urgentCount: urgentCount,
      businesses: savedBusinesses.map(b => ({
        name: b.name,
        entityType: b.entityType,
        turnover: b.turnover,
        sector: b.sector,
      })),
    };

    try {
      if (format === 'pdf') {
        exportDashboardToPDF(exportData);
        toast.success('PDF downloaded successfully');
      } else {
        exportDashboardToCSV(exportData);
        toast.success('CSV exported successfully');
      }
    } catch (error) {
      toast.error('Export failed');
      logger.error('Export error:', error);
    }
  };

  return (
    <PageLayout title="Dashboard" description="Your business overview at a glance" icon={LayoutDashboard}>
      {/* Onboarding Wizard - shown for new users */}
      <OnboardingWizard 
        open={showOnboarding} 
        onComplete={() => setShowOnboarding(false)} 
      />

      {showDisclaimer && (
        <DisclaimerModal onAccept={() => {
          setShowDisclaimer(false);
          if (!safeLocalStorage.getItem('taxforge_welcome_shown')) {
            setShowWelcome(true);
          }
        }} />
      )}
      
      {showWelcome && <PremiumOnboarding onComplete={() => setShowWelcome(false)} />}

      {/* Collapsible Summary Section */}
      <Collapsible open={summaryExpanded} onOpenChange={setSummaryExpanded} className="mb-6 animate-slide-up">
        <div className="glass-frosted rounded-2xl shadow-futuristic border-border/40 overflow-hidden">
          {/* Toggle Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/30">
            <ToggleGroup 
              type="single" 
              value={dashboardMode} 
              onValueChange={(value) => value && setDashboardMode(value as 'business' | 'personal')}
              className="bg-muted/50 rounded-lg p-1"
            >
              <ToggleGroupItem 
                value="business" 
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground px-4 py-2 text-sm gap-2"
              >
                <Building2 className="h-4 w-4" />
                Business
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="personal" 
                className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground px-4 py-2 text-sm gap-2"
              >
                <User className="h-4 w-4" />
                Personal
              </ToggleGroupItem>
            </ToggleGroup>
            
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                {summaryExpanded ? (
                  <Minimize2 className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Maximize2 className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent>
            <div className="px-4 pb-4 pt-2">
              {dashboardMode === 'business' ? (
                <>
                  {/* Date Range Filter and Export Buttons */}
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Filter className="h-4 w-4" />
                      <span>Showing data for</span>
                      <Select value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                          <SelectItem value="quarter">This Quarter</SelectItem>
                          <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-xs"
                        onClick={() => handleExport('pdf')}
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        PDF
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-xs"
                        onClick={() => handleExport('csv')}
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                        CSV
                      </Button>
                    </div>
                  </div>

                  {/* Business Summary Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="glass p-4 rounded-xl hover-lift min-h-[100px]">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="text-xs text-muted-foreground">Income</span>
                      </div>
                      <p className="text-lg font-bold text-success">{formatCurrency(filteredSummary.totalIncome)}</p>
                      <div className="mt-2">
                        <SparklineChart data={sparklineData.income} color="hsl(var(--success))" height={30} width={100} />
                      </div>
                    </div>
                    <div className="glass p-4 rounded-xl hover-lift min-h-[100px]">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="h-4 w-4 text-destructive" />
                        <span className="text-xs text-muted-foreground">Expenses</span>
                      </div>
                      <p className="text-lg font-bold text-destructive">{formatCurrency(filteredSummary.totalExpenses)}</p>
                      <div className="mt-2">
                        <SparklineChart data={sparklineData.expenses} color="hsl(var(--destructive))" height={30} width={100} />
                      </div>
                    </div>
                    <div className="glass p-4 rounded-xl hover-lift min-h-[100px]">
                      <div className="flex items-center gap-2 mb-2">
                        <PieChart className="h-4 w-4 text-primary" />
                        <span className="text-xs text-muted-foreground">Net</span>
                      </div>
                      <p className={`text-lg font-bold ${netIncome >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(netIncome)}
                      </p>
                      <div className="mt-2">
                        <SparklineChart data={sparklineData.net} color={netIncome >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"} height={30} width={100} />
                      </div>
                    </div>
                    <div className="glass p-4 rounded-xl hover-lift min-h-[100px]">
                      <div className="flex items-center gap-2 mb-2">
                        <Receipt className="h-4 w-4 text-accent" />
                        <span className="text-xs text-muted-foreground">Deductible</span>
                      </div>
                      <p className="text-lg font-bold text-accent">{formatCurrency(filteredSummary.deductibleExpenses)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Tax savings potential</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Personal Summary Header */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      Your personal tax deductions for {new Date().getFullYear()}
                    </p>
                    <Link to="/personal-expenses">
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        Manage <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>

                  {/* Personal Summary Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="glass p-4 rounded-xl hover-lift min-h-[100px]">
                      <div className="flex items-center gap-2 mb-2">
                        <Home className="h-4 w-4 text-primary" />
                        <span className="text-xs text-muted-foreground">Rent Relief</span>
                      </div>
                      <p className="text-lg font-bold text-primary">{formatCurrency(annualTotals.rent)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Annual rent paid</p>
                    </div>
                    <div className="glass p-4 rounded-xl hover-lift min-h-[100px]">
                      <div className="flex items-center gap-2 mb-2">
                        <Wallet className="h-4 w-4 text-success" />
                        <span className="text-xs text-muted-foreground">Pension</span>
                      </div>
                      <p className="text-lg font-bold text-success">
                        {formatCurrency(annualTotals.pension_contribution + annualTotals.nhf_contribution)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Contributions</p>
                    </div>
                    <div className="glass p-4 rounded-xl hover-lift min-h-[100px]">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-4 w-4 text-accent" />
                        <span className="text-xs text-muted-foreground">Insurance</span>
                      </div>
                      <p className="text-lg font-bold text-accent">
                        {formatCurrency(annualTotals.health_insurance + annualTotals.life_insurance)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Health + Life</p>
                    </div>
                    <div className="glass p-4 rounded-xl hover-lift min-h-[100px]">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-warning" />
                        <span className="text-xs text-muted-foreground">Total Deductible</span>
                      </div>
                      <p className="text-lg font-bold text-warning">{formatCurrency(totalDeductible)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Tax relief potential</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 animate-slide-up-delay-1">
        <Link to="/calculator">
          <Card className="h-full glass-frosted hover:shadow-futuristic hover:border-primary/30 transition-all cursor-pointer group hover-lift">
            <CardContent className="p-4 text-center">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/20 transition-colors group-hover:glow-primary">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium text-sm">Calculator</h3>
              <p className="text-xs text-muted-foreground">Calculate taxes</p>
            </CardContent>
          </Card>
        </Link>
        <Link to={dashboardMode === 'business' ? '/expenses' : '/personal-expenses'}>
          <Card className="h-full glass-frosted hover:shadow-futuristic hover:border-accent/30 transition-all cursor-pointer group hover-lift">
            <CardContent className="p-4 text-center">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-accent/20 transition-colors">
                <Receipt className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-medium text-sm">{dashboardMode === 'business' ? 'Expenses' : 'Personal'}</h3>
              <p className="text-xs text-muted-foreground">{dashboardMode === 'business' ? 'Track spending' : 'Tax deductions'}</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/reminders">
          <Card className="h-full glass-frosted hover:shadow-futuristic hover:border-warning/30 transition-all cursor-pointer group relative hover-lift">
            <CardContent className="p-4 text-center">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-warning/20 transition-colors">
                <Bell className="h-5 w-5 text-warning" />
              </div>
              <h3 className="font-medium text-sm">Reminders</h3>
              <p className="text-xs text-muted-foreground">Tax deadlines</p>
              {urgentCount > 0 && (
                <Badge variant="destructive" size="sm" className="absolute -top-1 -right-1 h-5 min-w-5 px-1.5 flex items-center justify-center animate-pulse">
                  {urgentCount}
                </Badge>
              )}
            </CardContent>
          </Card>
        </Link>
        <Link to="/businesses">
          <Card className="h-full glass-frosted hover:shadow-futuristic hover:border-success/30 transition-all cursor-pointer group hover-lift">
            <CardContent className="p-4 text-center">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-success/20 transition-colors">
                <Building2 className="h-5 w-5 text-success" />
              </div>
              <h3 className="font-medium text-sm">Businesses</h3>
              <p className="text-xs text-muted-foreground">{savedBusinesses.length} saved</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2 animate-slide-up-delay-2">
        {/* Businesses Card */}
        <Card className="glass-frosted shadow-futuristic">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                My Businesses
              </CardTitle>
              <CardDescription>
                {savedBusinesses.length === 0 ? 'No businesses saved yet' : `${savedBusinesses.length} business${savedBusinesses.length > 1 ? 'es' : ''}`}
              </CardDescription>
            </div>
            <Link to="/businesses">
              <Button variant="outline" size="sm">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {savedBusinesses.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Start by calculating taxes for your business</p>
                <Link to="/calculator">
                  <Button variant="hero" size="sm">
                    <Plus className="h-4 w-4" />
                    Add Business
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {savedBusinesses.slice(0, 5).map((business, index) => (
                  <SharedElement key={business.id} id={`business-card-${business.id}`}>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Collapsible
                        open={expandedBusinessId === business.id}
                        onOpenChange={() => setExpandedBusinessId(expandedBusinessId === business.id ? null : business.id)}
                      >
                        <div className="glass p-3 rounded-xl hover:bg-muted/50 transition-colors">
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <SharedElement id={`business-icon-${business.id}`}>
                                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                    business.entityType === 'company' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                                  }`}>
                                    <Building2 className="h-5 w-5" />
                                  </div>
                                </SharedElement>
                                <div className="text-left">
                                  <SharedElement id={`business-name-${business.id}`}>
                                    <p className="font-medium text-sm">{business.name}</p>
                                  </SharedElement>
                                  <p className="text-xs text-muted-foreground">{formatCurrency(business.turnover)}</p>
                                </div>
                              </div>
                              {expandedBusinessId === business.id ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                              <p>Entity: {business.entityType === 'company' ? 'Limited Company' : 'Business Name'}</p>
                              {business.sector && <p>Sector: {business.sector.replace(/_/g, ' ')}</p>}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    </motion.div>
                  </SharedElement>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reminders Card */}
        <Card className="glass-frosted shadow-futuristic">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-warning" />
                </div>
                Upcoming Reminders
              </CardTitle>
              <CardDescription>
                {upcomingReminders.length === 0 ? 'No upcoming reminders' : `${upcomingReminders.length} reminder${upcomingReminders.length > 1 ? 's' : ''}`}
              </CardDescription>
            </div>
            <Link to="/reminders">
              <Button variant="outline" size="sm">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingReminders.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No upcoming tax reminders</p>
                <Link to="/reminders">
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                    Add Reminder
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {upcomingReminders.map((reminder) => {
                  const dueDate = new Date(reminder.dueDate);
                  const isUrgent = dueDate <= addDays(new Date(), 7);
                  
                  return (
                    <div key={reminder.id} className={`glass p-3 rounded-xl ${isUrgent ? 'border border-warning/30' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {isUrgent ? (
                            <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                          ) : (
                            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{reminder.title}</p>
                            <p className="text-xs text-muted-foreground">{reminder.businessName}</p>
                          </div>
                        </div>
                        <Badge variant={isUrgent ? "destructive" : "secondary"} className="text-xs">
                          {format(dueDate, 'MMM d')}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      {expenses.length > 0 && (
        <div className="mt-6 animate-slide-up-delay-2">
          <ExpenseCharts expenses={expenses} />
        </div>
      )}

      {/* Feedback Form */}
      <div className="mt-8">
        <FeedbackForm />
      </div>
    </PageLayout>
  );
};

export default Dashboard;
