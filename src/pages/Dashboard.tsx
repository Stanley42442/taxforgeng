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
            <p className="text-muted-foreground mb-6">Please sign in to access your dashboard</p>
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
            <p className="text-muted-foreground mt-4">Loading...</p>
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
        toast.success('PDF downloaded successfully');
      } else {
        exportDashboardToCSV(exportData);
        toast.success('CSV exported successfully');
      }
    } catch (error) {
      toast.error('Export failed');
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
                <p className="text-muted-foreground text-sm truncate">Your business overview at a glance</p>
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
                  
                  {/* Financial Summary Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Total Income */}
                    <div className="rounded-xl p-4 bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Income</span>
                        <TrendingUp className="h-4 w-4 text-success" />
                      </div>
                      <p className="text-lg font-bold text-foreground">{formatCurrency(filteredSummary.totalIncome)}</p>
                      <div className="mt-2">
                        <SparklineChart data={sparklineData.income} color="hsl(var(--success))" />
                      </div>
                    </div>
                    
                    {/* Total Expenses */}
                    <div className="rounded-xl p-4 bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Expenses</span>
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      </div>
                      <p className="text-lg font-bold text-foreground">{formatCurrency(filteredSummary.totalExpenses)}</p>
                      <div className="mt-2">
                        <SparklineChart data={sparklineData.expenses} color="hsl(var(--destructive))" />
                      </div>
                    </div>
                    
                    {/* Net Income */}
                    <div className="rounded-xl p-4 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Net Income</span>
                        <Calculator className="h-4 w-4 text-primary" />
                      </div>
                      <p className={`text-lg font-bold ${netIncome >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(netIncome)}
                      </p>
                      <div className="mt-2">
                        <SparklineChart data={sparklineData.net} color={netIncome >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"} />
                      </div>
                    </div>
                    
                    {/* Deductible Expenses */}
                    <div className="rounded-xl p-4 bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Deductible</span>
                        <Receipt className="h-4 w-4 text-accent" />
                      </div>
                      <p className="text-lg font-bold text-foreground">{formatCurrency(filteredSummary.deductibleExpenses)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Tax savings potential</p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 animate-slide-up">
            <Link to="/calculator">
              <Card className="glass-frosted hover:bg-secondary/30 transition-all cursor-pointer h-full border-border/40">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center mb-2">
                    <Calculator className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Tax Calculator</span>
                </CardContent>
              </Card>
            </Link>
            <Link to="/expenses">
              <Card className="glass-frosted hover:bg-secondary/30 transition-all cursor-pointer h-full border-border/40">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="h-10 w-10 rounded-xl bg-gradient-accent flex items-center justify-center mb-2">
                    <Receipt className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Expenses</span>
                </CardContent>
              </Card>
            </Link>
            <Link to="/reminders">
              <Card className="glass-frosted hover:bg-secondary/30 transition-all cursor-pointer h-full border-border/40">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="h-10 w-10 rounded-xl bg-warning/20 flex items-center justify-center mb-2 relative">
                    <Bell className="h-5 w-5 text-warning" />
                    {urgentCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center font-bold">
                        {urgentCount}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground">Reminders</span>
                </CardContent>
              </Card>
            </Link>
            <Link to="/businesses">
              <Card className="glass-frosted hover:bg-secondary/30 transition-all cursor-pointer h-full border-border/40">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="h-10 w-10 rounded-xl bg-success/20 flex items-center justify-center mb-2">
                    <Building2 className="h-5 w-5 text-success" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Businesses</span>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Businesses Section */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass-frosted shadow-futuristic border-border/40">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Your Businesses</CardTitle>
                        <CardDescription className="text-xs">{savedBusinesses.length} registered</CardDescription>
                      </div>
                    </div>
                    <Link to="/businesses">
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        Add New
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {savedBusinesses.length === 0 ? (
                    <div className="text-center py-8">
                      <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground text-sm mb-4">No businesses registered yet</p>
                      <Link to="/businesses">
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Register Business
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedBusinesses.slice(0, 5).map((business) => (
                        <Collapsible 
                          key={business.id}
                          open={expandedBusinessId === business.id}
                          onOpenChange={(open) => setExpandedBusinessId(open ? business.id : null)}
                        >
                          <div className="rounded-xl bg-secondary/30 border border-border/30 overflow-hidden">
                            <CollapsibleTrigger asChild>
                              <button className="w-full p-3 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                                    business.entityType === 'company' ? 'bg-primary/15 text-primary' : 'bg-accent/15 text-accent'
                                  }`}>
                                    {business.entityType === 'company' ? (
                                      <Building2 className="h-4 w-4" />
                                    ) : (
                                      <FileText className="h-4 w-4" />
                                    )}
                                  </div>
                                  <div className="text-left">
                                    <p className="font-medium text-foreground text-sm">{business.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {business.entityType === 'company' ? 'Limited Company' : 'Business Name'} • {formatCurrency(business.turnover)}
                                    </p>
                                  </div>
                                </div>
                                {expandedBusinessId === business.id ? (
                                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )}
                              </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="px-3 pb-3 pt-1 border-t border-border/30">
                                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                  <div>
                                    <span className="text-muted-foreground">Sector:</span>
                                    <span className="ml-1 font-medium text-foreground">{business.sector || 'General'}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Status:</span>
                                    <span className={`ml-1 font-medium ${business.verificationStatus === 'verified' ? 'text-success' : 'text-warning'}`}>
                                      {business.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
                                    </span>
                                  </div>
                                </div>
                                <Link to={`/calculator`} state={{ entityType: business.entityType }}>
                                  <Button variant="outline" size="sm" className="w-full h-7 text-xs">
                                    <Calculator className="h-3 w-3 mr-1" />
                                    Calculate Tax
                                  </Button>
                                </Link>
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      ))}
                      {savedBusinesses.length > 5 && (
                        <Link to="/businesses" className="block">
                          <Button variant="ghost" size="sm" className="w-full text-xs">
                            View all {savedBusinesses.length} businesses
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expense Charts */}
              {expenses.length > 0 && (
                <Card className="glass-frosted shadow-futuristic border-border/40">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-accent flex items-center justify-center">
                        <PieChart className="h-4 w-4 text-accent-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Expense Breakdown</CardTitle>
                        <CardDescription className="text-xs">Your spending by category</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ExpenseCharts expenses={expenses} />
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Reminders */}
              <Card className="glass-frosted shadow-futuristic border-border/40">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-warning/20 flex items-center justify-center relative">
                        <Bell className="h-4 w-4 text-warning" />
                        {urgentCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center font-bold">
                            {urgentCount}
                          </span>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">Reminders</CardTitle>
                        <CardDescription className="text-xs">Upcoming deadlines</CardDescription>
                      </div>
                    </div>
                    <Link to="/reminders">
                      <Button variant="ghost" size="sm" className="h-8">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {upcomingReminders.length === 0 ? (
                    <div className="text-center py-6">
                      <Calendar className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-muted-foreground text-sm">No upcoming reminders</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {upcomingReminders.map((reminder) => {
                        const dueDate = new Date(reminder.dueDate);
                        const isOverdue = dueDate < new Date();
                        const isUrgent = !isOverdue && dueDate <= addDays(new Date(), 3);
                        
                        return (
                          <Collapsible
                            key={reminder.id}
                            open={expandedReminderId === reminder.id}
                            onOpenChange={(open) => setExpandedReminderId(open ? reminder.id : null)}
                          >
                            <div className={`rounded-xl border overflow-hidden ${
                              isOverdue ? 'bg-destructive/10 border-destructive/30' :
                              isUrgent ? 'bg-warning/10 border-warning/30' :
                              'bg-secondary/30 border-border/30'
                            }`}>
                              <CollapsibleTrigger asChild>
                                <button className="w-full p-3 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                                  <div className="flex items-center gap-2 min-w-0">
                                    {isOverdue ? (
                                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                                    ) : isUrgent ? (
                                      <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                                    ) : (
                                      <Calendar className="h-4 w-4 text-primary shrink-0" />
                                    )}
                                    <span className="text-sm font-medium text-foreground truncate">{reminder.title}</span>
                                  </div>
                                  {expandedReminderId === reminder.id ? (
                                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                                  )}
                                </button>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="px-3 pb-3 pt-1 border-t border-border/30 text-xs space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Due:</span>
                                    <span className={`font-medium ${isOverdue ? 'text-destructive' : isUrgent ? 'text-warning' : 'text-foreground'}`}>
                                      {format(dueDate, 'MMM dd, yyyy')}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Business:</span>
                                    <span className="font-medium text-foreground">{reminder.businessName}</span>
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Feedback Form */}
              <FeedbackForm />

              {/* Premium Features */}
              {tier === 'free' && (
                <Card className="glass-frosted shadow-futuristic border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Upgrade to Pro</h3>
                        <p className="text-xs text-muted-foreground">Unlock premium features</p>
                      </div>
                    </div>
                    <ul className="space-y-1.5 text-xs text-muted-foreground mb-4">
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Unlimited businesses
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Advanced analytics
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        PDF exports without watermark
                      </li>
                    </ul>
                    <Link to="/pricing">
                      <Button variant="glow" size="sm" className="w-full">
                        <Sparkles className="h-4 w-4 mr-1" />
                        View Plans
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
