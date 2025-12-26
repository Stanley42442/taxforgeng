import { useState, useEffect } from "react";
import { NavMenu } from "@/components/NavMenu";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { formatCurrency } from "@/lib/taxCalculations";
import { format, isAfter, addDays } from "date-fns";
import { ExpenseCharts } from "@/components/ExpenseCharts";
import { WelcomeSplash } from "@/components/WelcomeSplash";
import { DisclaimerModal } from "@/components/DisclaimerModal";
import { FeedbackForm } from "@/components/FeedbackForm";
import { seedSampleData } from "@/lib/sampleData";

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

  // Check for welcome splash and disclaimer
  useEffect(() => {
    if (user) {
      if (!localStorage.getItem('taxforge_disclaimer_accepted')) {
        setShowDisclaimer(true);
      } else if (!localStorage.getItem('taxforge_welcome_shown')) {
        setShowWelcome(true);
      }
    }
  }, [user]);

  // Seed sample data for new users
  useEffect(() => {
    const seedData = async () => {
      if (!user || dataSeeded) return;
      
      const result = await seedSampleData(user.id);
      if (result.success && result.businessId) {
        // Data was seeded, refresh the businesses
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

      // Fetch expense summary
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

        const income = mapped
          .filter(e => e.type === 'income')
          .reduce((sum, e) => sum + e.amount, 0);
        const expense = mapped
          .filter(e => e.type === 'expense')
          .reduce((sum, e) => sum + e.amount, 0);
        const deductible = mapped
          .filter(e => e.isDeductible)
          .reduce((sum, e) => sum + e.amount, 0);

        setExpenseSummary({
          totalIncome: income,
          totalExpenses: expense,
          deductibleExpenses: deductible,
        });
      }

      // Fetch upcoming reminders with business names
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <NavMenu />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
              <LayoutDashboard className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Dashboard</h1>
            <p className="text-muted-foreground mb-6">
              Sign in to view your dashboard overview.
            </p>
            <Button variant="hero" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || businessLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <NavMenu />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const netIncome = expenseSummary.totalIncome - expenseSummary.totalExpenses;
  const totalTurnover = savedBusinesses.reduce((sum, b) => sum + b.turnover, 0);

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col overflow-x-hidden">
      <NavMenu />
      
      {/* Disclaimer Modal - must accept before using */}
      {showDisclaimer && (
        <DisclaimerModal onAccept={() => {
          setShowDisclaimer(false);
          if (!localStorage.getItem('taxforge_welcome_shown')) {
            setShowWelcome(true);
          }
        }} />
      )}
      
      {/* Welcome Splash for new users */}
      {showWelcome && <WelcomeSplash onComplete={() => setShowWelcome(false)} />}

      <main className="container mx-auto px-4 py-6 pb-8 flex-1">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary">
                <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground text-sm">
                  Overview of your businesses, expenses, and reminders
                </p>
              </div>
            </div>
          </div>

          {/* Summary Cards Row */}
          <div className="grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-6 animate-slide-up">
            <Card className="shadow-card overflow-hidden">
              <CardHeader className="pb-1 p-2 sm:p-4 sm:pb-2">
                <CardDescription className="flex items-center gap-1 text-[10px] sm:text-sm">
                  <Building2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">Businesses</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 pt-0">
                <p className="text-lg sm:text-3xl font-bold text-foreground">{savedBusinesses.length}</p>
                <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5 truncate">
                  {formatCurrency(totalTurnover)} turnover
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card overflow-hidden">
              <CardHeader className="pb-1 p-2 sm:p-4 sm:pb-2">
                <CardDescription className="flex items-center gap-1 text-success text-[10px] sm:text-sm">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">Income</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 pt-0">
                <p className="text-lg sm:text-3xl font-bold text-success truncate">{formatCurrency(expenseSummary.totalIncome)}</p>
                <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5 truncate">Tracked entries</p>
              </CardContent>
            </Card>

            <Card className="shadow-card overflow-hidden">
              <CardHeader className="pb-1 p-2 sm:p-4 sm:pb-2">
                <CardDescription className="flex items-center gap-1 text-destructive text-[10px] sm:text-sm">
                  <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">Expenses</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 pt-0">
                <p className="text-lg sm:text-3xl font-bold text-destructive truncate">{formatCurrency(expenseSummary.totalExpenses)}</p>
                <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5 truncate">
                  {formatCurrency(expenseSummary.deductibleExpenses)} deductible
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card overflow-hidden">
              <CardHeader className="pb-1 p-2 sm:p-4 sm:pb-2">
                <CardDescription className="flex items-center gap-1 text-[10px] sm:text-sm">
                  <Calculator className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">Net Income</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 pt-0">
                <p className={`text-lg sm:text-3xl font-bold truncate ${netIncome >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(netIncome)}
                </p>
                <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5 truncate">Income - expenses</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-2 animate-slide-up">
            {/* Saved Businesses */}
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Saved Businesses
                  </CardTitle>
                  <Link to="/businesses">
                    <Button variant="ghost" size="sm">
                      View All
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {savedBusinesses.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">No businesses saved yet</p>
                    <Link to="/calculator">
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Business
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedBusinesses.slice(0, 4).map((business) => (
                      <div
                        key={business.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-foreground">{business.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {business.entityType === 'company' ? 'LLC' : 'Business Name'} • {formatCurrency(business.turnover)}
                          </p>
                        </div>
                        {business.verificationStatus === 'verified' && (
                          <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                    ))}
                    {savedBusinesses.length > 4 && (
                      <p className="text-sm text-muted-foreground text-center">
                        +{savedBusinesses.length - 4} more businesses
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Reminders */}
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Upcoming Reminders
                  </CardTitle>
                  <Link to="/reminders">
                    <Button variant="ghost" size="sm">
                      Manage
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {upcomingReminders.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">No active reminders</p>
                    <Link to="/reminders">
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Set Reminders
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingReminders.map((reminder) => {
                      const dueDate = new Date(reminder.dueDate);
                      const isOverdue = isAfter(new Date(), dueDate);
                      const isDueSoon = isAfter(addDays(new Date(), 7), dueDate) && !isOverdue;

                      return (
                        <div
                          key={reminder.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-border"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isOverdue ? 'bg-destructive/20' : isDueSoon ? 'bg-warning/20' : 'bg-success/20'
                            }`}>
                              {isOverdue ? (
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                              ) : (
                                <Calendar className={`h-5 w-5 ${isDueSoon ? 'text-warning' : 'text-success'}`} />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm">{reminder.title}</p>
                              <p className="text-xs text-muted-foreground">{reminder.businessName}</p>
                            </div>
                          </div>
                          <span className={`text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {format(dueDate, 'MMM d')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Expenses */}
            <Card className="shadow-card lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-primary" />
                    Expense Summary
                  </CardTitle>
                  <div className="flex gap-2">
                    <Link to="/business-report">
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Reports
                      </Button>
                    </Link>
                    <Link to="/expenses">
                      <Button variant="ghost" size="sm">
                        View Details
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-3 mb-4 sm:mb-6">
                  <div className="p-3 sm:p-4 rounded-lg bg-success/10 border border-success/20">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Income</p>
                    <p className="text-lg sm:text-2xl font-bold text-success">{formatCurrency(expenseSummary.totalIncome)}</p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Expenses</p>
                    <p className="text-lg sm:text-2xl font-bold text-destructive">{formatCurrency(expenseSummary.totalExpenses)}</p>
                  </div>
                  <div className="p-3 sm:p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Tax Deductible</p>
                    <p className="text-lg sm:text-2xl font-bold text-primary">{formatCurrency(expenseSummary.deductibleExpenses)}</p>
                  </div>
                </div>

                {/* Expense Charts */}
                {tier !== 'free' && expenses.length > 0 && (
                  <ExpenseCharts expenses={expenses} />
                )}

                {tier !== 'free' && (
                  <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
                    <Link to="/expenses">
                      <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Add Expense
                      </Button>
                    </Link>
                    <Link to="/business-report">
                      <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Reports
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs sm:text-sm"
                      onClick={() => navigate('/calculator', { 
                        state: { 
                          prefill: { 
                            turnover: expenseSummary.totalIncome, 
                            expenses: expenseSummary.deductibleExpenses 
                          } 
                        } 
                      })}
                      disabled={expenseSummary.totalIncome === 0}
                    >
                      <Calculator className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Calculate Tax
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
