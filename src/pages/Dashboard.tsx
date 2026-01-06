import { useState, useEffect, useMemo } from "react";
import { NavMenu } from "@/components/NavMenu";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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
} from "lucide-react";
import { formatCurrency } from "@/lib/taxCalculations";
import { format, isAfter, addDays, subDays, subMonths, startOfWeek, startOfMonth, startOfQuarter, startOfYear, eachDayOfInterval, isWithinInterval } from "date-fns";
import { SparklineChart } from "@/components/SparklineChart";
import { exportDashboardToPDF, exportDashboardToCSV, DashboardExportData } from "@/lib/dashboardExport";
import { toast } from "sonner";
import { ExpenseCharts } from "@/components/ExpenseCharts";
import { WelcomeSplash } from "@/components/WelcomeSplash";
import { DisclaimerModal } from "@/components/DisclaimerModal";
import { FeedbackForm } from "@/components/FeedbackForm";
import { seedSampleData } from "@/lib/sampleData";
import { useUpcomingReminders } from "@/hooks/useUpcomingReminders";
import { Badge } from "@/components/ui/badge";

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
  const [dataSeeded, setDataSeeded] = useState(false);
  const [expandedBusinessId, setExpandedBusinessId] = useState<string | null>(null);
  const [expandedReminderId, setExpandedReminderId] = useState<string | null>(null);
  const [summaryExpanded, setSummaryExpanded] = useState(() => {
    const saved = localStorage.getItem('dashboard_summary_expanded');
    return saved !== 'false'; // Default to expanded
  });
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>(() => {
    const saved = localStorage.getItem('dashboard_date_range');
    return (saved as 'week' | 'month' | 'quarter' | 'year') || 'month';
  });

  // Persist date range
  useEffect(() => {
    localStorage.setItem('dashboard_date_range', dateRange);
  }, [dateRange]);

  // Persist summary expanded state
  useEffect(() => {
    localStorage.setItem('dashboard_summary_expanded', summaryExpanded.toString());
  }, [summaryExpanded]);

  useEffect(() => {
    if (user) {
      if (!localStorage.getItem('taxforge_disclaimer_accepted')) {
        setShowDisclaimer(true);
      } else if (!localStorage.getItem('taxforge_welcome_shown')) {
        setShowWelcome(true);
      }
    }
  }, [user]);

  useEffect(() => {
    const seedData = async () => {
      if (!user || dataSeeded) return;
      const result = await seedSampleData(user.id);
      if (result.success && result.businessId) {
        refreshBusinesses();
        setDataSeeded(true);
      }
    };
    if (user && !businessLoading) {
      seedData();
    }
  }, [user, businessLoading, dataSeeded, refreshBusinesses]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: expenseData } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
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

      const { data: reminders } = await supabase
        .from('reminders')
        .select('id, title, due_date, business_id')
        .eq('user_id', user.id)
        .eq('notify_email', true)
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

    if (!businessLoading) {
      fetchDashboardData();
    }
  }, [user, businessLoading, savedBusinesses, dataSeeded]);

  // Calculate date range start - must be before early returns
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

  // Filter expenses by date range - must be before early returns
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return isWithinInterval(expenseDate, { start: dateRangeStart, end: new Date() });
    });
  }, [expenses, dateRangeStart]);

  // Calculate filtered summary - must be before early returns
  const filteredSummary = useMemo(() => {
    const income = filteredExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const expense = filteredExpenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    const deductible = filteredExpenses.filter(e => e.isDeductible).reduce((sum, e) => sum + e.amount, 0);
    return { totalIncome: income, totalExpenses: expense, deductibleExpenses: deductible };
  }, [filteredExpenses]);

  // Calculate 7-day sparkline data - must be before early returns
  const sparklineData = useMemo(() => {
    const today = new Date();
    const last7Days = eachDayOfInterval({ start: subDays(today, 6), end: today });
    
    const incomeByDay = last7Days.map(day => {
      return expenses
        .filter(e => e.type === 'income' && format(new Date(e.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
        .reduce((sum, e) => sum + e.amount, 0);
    });
    
    const expensesByDay = last7Days.map(day => {
      return expenses
        .filter(e => e.type === 'expense' && format(new Date(e.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
        .reduce((sum, e) => sum + e.amount, 0);
    });
    
    const netByDay = incomeByDay.map((inc, i) => inc - expensesByDay[i]);
    
    return { income: incomeByDay, expenses: expensesByDay, net: netByDay };
  }, [expenses]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh pointer-events-none" />
        <NavMenu />
        <div className="container mx-auto px-4 py-20 text-center relative z-10">
          <div className="mx-auto max-w-md glass-frosted rounded-3xl p-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-primary glow-primary">
              <LayoutDashboard className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Dashboard</h1>
            <p className="text-muted-foreground mb-6">Sign in to view your dashboard overview.</p>
            <Button variant="glow" size="lg" onClick={() => navigate('/auth')}>Sign In</Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || businessLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh pointer-events-none" />
        <NavMenu />
        <div className="container mx-auto px-4 py-20 text-center relative z-10">
          <div className="glass-frosted rounded-2xl p-12 max-w-sm mx-auto">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary glow-primary" />
            <p className="text-muted-foreground mt-4">Loading dashboard...</p>
          </div>
        </div>
      </div>
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
        toast.success('Dashboard report downloaded as PDF');
      } else {
        exportDashboardToCSV(exportData);
        toast.success('Dashboard data exported as CSV');
      }
    } catch (error) {
      toast.error('Failed to export dashboard data');
      console.error('Export error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative w-full max-w-full overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-hero pointer-events-none" />
      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      <div className="fixed inset-0 bg-dots opacity-15 pointer-events-none" />
      
      <NavMenu />
      
      {showDisclaimer && (
        <DisclaimerModal onAccept={() => {
          setShowDisclaimer(false);
          if (!localStorage.getItem('taxforge_welcome_shown')) {
            setShowWelcome(true);
          }
        }} />
      )}
      
      {showWelcome && <WelcomeSplash onComplete={() => setShowWelcome(false)} />}

      <main className="flex-1 relative z-10 py-6 pb-8 px-4 w-full overflow-x-hidden">
        <div className="w-full max-w-6xl mx-auto overflow-hidden">
          {/* Header */}
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-lg glow-primary shrink-0">
                <LayoutDashboard className="h-7 w-7 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">Dashboard</h1>
                <p className="text-muted-foreground text-sm truncate">Overview of your businesses, expenses, and reminders</p>
              </div>
            </div>
          </div>

          {/* Collapsible Summary Section */}
          <Collapsible open={summaryExpanded} onOpenChange={setSummaryExpanded} className="mb-6 animate-slide-up">
            <div className="glass-frosted rounded-2xl shadow-futuristic border-border/40 overflow-hidden">
              <CollapsibleTrigger asChild>
                <button className="w-full p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                      <Activity className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="text-left">
                      <h2 className="font-semibold text-foreground">Financial Summary</h2>
                      <p className="text-xs text-muted-foreground">
                        {summaryExpanded ? 'Click to collapse' : `${savedBusinesses.length} businesses • ${formatCurrency(netIncome)} net income`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!summaryExpanded && (
                      <div className="hidden sm:flex items-center gap-3 mr-4">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10">
                          <Building2 className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-medium text-primary">{savedBusinesses.length}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-success/10">
                          <TrendingUp className="h-3.5 w-3.5 text-success" />
                          <span className="text-xs font-medium text-success">{formatCurrency(filteredSummary.totalIncome)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-destructive/10">
                          <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                          <span className="text-xs font-medium text-destructive">{formatCurrency(filteredSummary.totalExpenses)}</span>
                        </div>
                        {urgentCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {urgentCount} urgent
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="h-8 w-8 rounded-lg bg-secondary/50 flex items-center justify-center">
                      {summaryExpanded ? (
                        <Minimize2 className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Maximize2 className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </button>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="px-4 pb-4 pt-2 border-t border-border/30">
                  {/* Date Range Filter and Export Buttons */}
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Filter className="h-4 w-4" />
                      <span>Showing data for:</span>
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
                        className="h-8 text-xs gap-1.5"
                        onClick={() => handleExport('pdf')}
                      >
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                        onClick={() => handleExport('csv')}
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                        CSV
                      </Button>
                    </div>
                  </div>

                  {/* Bento Grid Summary Cards */}
                  <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 [&>*]:min-w-0 [&>*]:overflow-hidden">
                    <StatCard
                      icon={Building2}
                      label="Businesses"
                      value={savedBusinesses.length.toString()}
                      subtext={`${formatCurrency(totalTurnover)} turnover`}
                      gradient="from-primary/20 to-primary/5"
                      iconColor="text-primary"
                      compact
                    />
                    <StatCard
                      icon={TrendingUp}
                      label="Income"
                      value={formatCurrency(filteredSummary.totalIncome)}
                      subtext={dateRangeLabels[dateRange]}
                      gradient="from-success/20 to-success/5"
                      iconColor="text-success"
                      valueColor="text-success"
                      sparklineData={sparklineData.income}
                      sparklineColor="hsl(var(--success))"
                      compact
                    />
                    <StatCard
                      icon={TrendingDown}
                      label="Expenses"
                      value={formatCurrency(filteredSummary.totalExpenses)}
                      subtext={`${formatCurrency(filteredSummary.deductibleExpenses)} deductible`}
                      gradient="from-destructive/20 to-destructive/5"
                      iconColor="text-destructive"
                      valueColor="text-destructive"
                      sparklineData={sparklineData.expenses}
                      sparklineColor="hsl(var(--destructive))"
                      compact
                    />
                    <StatCard
                      icon={Calculator}
                      label="Net Income"
                      value={formatCurrency(netIncome)}
                      subtext={dateRangeLabels[dateRange]}
                      gradient={netIncome >= 0 ? "from-success/20 to-success/5" : "from-destructive/20 to-destructive/5"}
                      iconColor={netIncome >= 0 ? "text-success" : "text-destructive"}
                      valueColor={netIncome >= 0 ? "text-success" : "text-destructive"}
                      sparklineData={sparklineData.net}
                      sparklineColor="auto"
                      compact
                    />
                  </div>
                  
                  {/* Quick Stats Row */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-secondary/50">
                      <PieChart className="h-3.5 w-3.5" />
                      <span>{expenses.length} transactions</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-secondary/50">
                      <Bell className="h-3.5 w-3.5" />
                      <span>{upcomingReminders.length} reminders</span>
                    </div>
                    {urgentCount > 0 && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-destructive/10 text-destructive">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>{urgentCount} urgent due</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-secondary/50">
                      <Receipt className="h-3.5 w-3.5" />
                      <span>{formatCurrency(expenseSummary.deductibleExpenses)} deductible</span>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-2 animate-slide-up-delay-1 [&>*]:min-w-0 [&>*]:overflow-hidden">
            {/* Saved Businesses */}
            <Card className="glass-frosted shadow-futuristic border-border/40 hover-glow-primary transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    Saved Businesses
                  </CardTitle>
                  <Link to="/businesses">
                    <Button variant="ghost" size="sm" className="group">
                      View All
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {savedBusinesses.length === 0 ? (
                  <div className="text-center py-10 glass-subtle rounded-xl">
                    <Building2 className="h-14 w-14 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">No businesses saved yet</p>
                    <Link to="/calculator">
                      <Button variant="outline" size="sm" className="neon-border">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Business
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[280px] overflow-y-auto">
                    {savedBusinesses.slice(0, 4).map((business) => {
                      const isExpanded = expandedBusinessId === business.id;
                      return (
                        <div
                          key={business.id}
                          className="p-4 rounded-xl glass-subtle hover:bg-secondary/50 transition-all duration-300 group cursor-pointer active:opacity-80"
                          onClick={() => setExpandedBusinessId(isExpanded ? null : business.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className={`font-medium text-foreground ${isExpanded ? '' : 'truncate'}`}>
                                {business.name}
                              </p>
                              <p className={`text-sm text-muted-foreground ${isExpanded ? '' : 'truncate'}`}>
                                {business.entityType === 'company' ? 'LLC' : 'Business Name'} • {formatCurrency(business.turnover)}
                              </p>
                              {isExpanded && business.sector && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Sector: {business.sector}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {business.verificationStatus === 'verified' && (
                                <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full border border-success/30 whitespace-nowrap">
                                  Verified
                                </span>
                              )}
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {savedBusinesses.length > 4 && (
                      <p className="text-sm text-muted-foreground text-center pt-2">
                        +{savedBusinesses.length - 4} more businesses
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Reminders */}
            <Card className="glass-frosted shadow-futuristic border-border/40 hover-glow-accent transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center relative">
                      <Bell className="h-4 w-4 text-accent" />
                      {urgentCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center animate-pulse"
                        >
                          {urgentCount > 9 ? '9+' : urgentCount}
                        </Badge>
                      )}
                    </div>
                    Upcoming Reminders
                    {urgentCount > 0 && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        {urgentCount} urgent
                      </Badge>
                    )}
                  </CardTitle>
                  <Link to="/reminders">
                    <Button variant="ghost" size="sm" className="group">
                      Manage
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {upcomingReminders.length === 0 ? (
                  <div className="text-center py-10 glass-subtle rounded-xl">
                    <Bell className="h-14 w-14 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">No active reminders</p>
                    <Link to="/reminders">
                      <Button variant="outline" size="sm" className="neon-border-accent">
                        <Plus className="h-4 w-4 mr-1" />
                        Set Reminders
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[280px] overflow-y-auto">
                    {upcomingReminders.map((reminder) => {
                      const dueDate = new Date(reminder.dueDate);
                      const isOverdue = isAfter(new Date(), dueDate);
                      const isDueSoon = isAfter(addDays(new Date(), 7), dueDate) && !isOverdue;
                      const isExpanded = expandedReminderId === reminder.id;

                      return (
                        <div
                          key={reminder.id}
                          className="p-4 rounded-xl glass-subtle transition-all duration-300 cursor-pointer active:opacity-80"
                          onClick={() => setExpandedReminderId(isExpanded ? null : reminder.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              isOverdue ? 'bg-destructive/20' : isDueSoon ? 'bg-warning/20' : 'bg-success/20'
                            }`}>
                              {isOverdue ? (
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                              ) : (
                                <Calendar className={`h-5 w-5 ${isDueSoon ? 'text-warning' : 'text-success'}`} />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`font-medium text-foreground text-sm ${isExpanded ? '' : 'truncate'}`}>
                                  {reminder.title}
                                </p>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className={`text-xs font-medium whitespace-nowrap ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                                    {format(dueDate, 'MMM d')}
                                  </span>
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                              <p className={`text-xs text-muted-foreground ${isExpanded ? '' : 'truncate'}`}>
                                {reminder.businessName}
                              </p>
                              {isExpanded && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Due: {format(dueDate, 'EEEE, MMMM d, yyyy')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expense Charts - Two Separate Cards */}
            <div className="lg:col-span-2">
              {expenses.length === 0 ? (
                <Card className="glass-frosted shadow-futuristic border-border/40">
                  <CardContent className="py-12">
                    <div className="text-center glass-subtle rounded-xl py-12">
                      <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground mb-4">No expenses tracked yet</p>
                      <Link to="/expenses">
                        <Button variant="glow" size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Expense
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <ExpenseCharts expenses={expenses} />
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid gap-3 grid-cols-2 lg:grid-cols-4 animate-slide-up-delay-2">
            <Link to="/calculator" className="block">
              <Button variant="outline" className="w-full h-12 sm:h-14 glass-subtle neon-border hover-lift group px-3">
                <Calculator className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary shrink-0" />
                <span className="text-foreground text-sm sm:text-base truncate">New Calculation</span>
              </Button>
            </Link>
            <Link to="/expenses" className="block">
              <Button variant="outline" className="w-full h-12 sm:h-14 glass-subtle neon-border hover-lift group px-3">
                <Receipt className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-success shrink-0" />
                <span className="text-foreground text-sm sm:text-base truncate">Track Expense</span>
              </Button>
            </Link>
            <Link to="/reminders" className="block">
              <Button variant="outline" className="w-full h-12 sm:h-14 glass-subtle neon-border hover-lift group px-3">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-accent shrink-0" />
                <span className="text-foreground text-sm sm:text-base truncate">Set Reminder</span>
              </Button>
            </Link>
            <Link to="/learn" className="block">
              <Button variant="outline" className="w-full h-12 sm:h-14 glass-subtle neon-border hover-lift group px-3">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-warning shrink-0" />
                <span className="text-foreground text-sm sm:text-base truncate">Tax Tips</span>
              </Button>
            </Link>
          </div>

          <div className="mt-8">
            <FeedbackForm />
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  gradient,
  iconColor,
  valueColor,
  compact = false,
  sparklineData,
  sparklineColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext: string;
  gradient: string;
  iconColor: string;
  valueColor?: string;
  compact?: boolean;
  sparklineData?: number[];
  sparklineColor?: string;
}) => (
  <div className={`glass-frosted rounded-2xl shadow-futuristic overflow-hidden hover-lift transition-all duration-300 relative group min-w-0 ${compact ? 'p-2.5 sm:p-3' : 'p-3 sm:p-4'}`}>
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50 group-hover:opacity-70 transition-opacity`} />
    <div className="relative z-10 min-w-0">
      <div className={`flex items-center justify-between gap-2 ${compact ? 'mb-1.5 sm:mb-2' : 'mb-2 sm:mb-3'}`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className={`rounded-xl bg-background/50 flex items-center justify-center shrink-0 ${compact ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-8 w-8 sm:h-9 sm:w-9'}`}>
            <Icon className={`${compact ? 'h-3.5 w-3.5 sm:h-4 sm:w-4' : 'h-4 w-4 sm:h-5 sm:w-5'} ${iconColor}`} />
          </div>
          <span className={`text-muted-foreground font-medium truncate ${compact ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-xs'}`}>{label}</span>
        </div>
        {sparklineData && sparklineData.length > 0 && (
          <div className="shrink-0 hidden sm:block">
            <SparklineChart 
              data={sparklineData} 
              color={sparklineColor} 
              width={50} 
              height={20}
            />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className={`font-bold truncate ${valueColor || 'text-foreground'} ${compact ? 'text-sm sm:text-base lg:text-lg' : 'text-base sm:text-xl lg:text-2xl'}`}>{value}</p>
          <p className={`text-muted-foreground mt-1 truncate ${compact ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-xs'}`}>{subtext}</p>
        </div>
        {sparklineData && sparklineData.length > 0 && (
          <div className="shrink-0 sm:hidden">
            <SparklineChart 
              data={sparklineData} 
              color={sparklineColor} 
              width={40} 
              height={16}
            />
          </div>
        )}
      </div>
    </div>
  </div>
);

export default Dashboard;