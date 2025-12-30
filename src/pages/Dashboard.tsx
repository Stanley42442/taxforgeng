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
  Sparkles,
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

  const netIncome = expenseSummary.totalIncome - expenseSummary.totalExpenses;
  const totalTurnover = savedBusinesses.reduce((sum, b) => sum + b.turnover, 0);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden relative">
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

      <main className="container mx-auto px-4 py-6 pb-8 flex-1 relative z-10">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary shadow-lg glow-primary">
                <LayoutDashboard className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground text-sm">Overview of your businesses, expenses, and reminders</p>
              </div>
            </div>
          </div>

          {/* Bento Grid Summary Cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8 animate-slide-up">
            <StatCard
              icon={Building2}
              label="Businesses"
              value={savedBusinesses.length.toString()}
              subtext={`${formatCurrency(totalTurnover)} turnover`}
              gradient="from-primary/20 to-primary/5"
              iconColor="text-primary"
            />
            <StatCard
              icon={TrendingUp}
              label="Income"
              value={formatCurrency(expenseSummary.totalIncome)}
              subtext="Tracked entries"
              gradient="from-success/20 to-success/5"
              iconColor="text-success"
              valueColor="text-success"
            />
            <StatCard
              icon={TrendingDown}
              label="Expenses"
              value={formatCurrency(expenseSummary.totalExpenses)}
              subtext={`${formatCurrency(expenseSummary.deductibleExpenses)} deductible`}
              gradient="from-destructive/20 to-destructive/5"
              iconColor="text-destructive"
              valueColor="text-destructive"
            />
            <StatCard
              icon={Calculator}
              label="Net Income"
              value={formatCurrency(netIncome)}
              subtext="Income - expenses"
              gradient={netIncome >= 0 ? "from-success/20 to-success/5" : "from-destructive/20 to-destructive/5"}
              iconColor={netIncome >= 0 ? "text-success" : "text-destructive"}
              valueColor={netIncome >= 0 ? "text-success" : "text-destructive"}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-2 animate-slide-up-delay-1">
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
                  <div className="space-y-3">
                    {savedBusinesses.slice(0, 4).map((business) => (
                      <div
                        key={business.id}
                        className="flex items-center justify-between p-4 rounded-xl glass-subtle hover:bg-secondary/50 transition-all duration-300 group hover-lift"
                      >
                        <div>
                          <p className="font-medium text-foreground">{business.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {business.entityType === 'company' ? 'LLC' : 'Business Name'} • {formatCurrency(business.turnover)}
                          </p>
                        </div>
                        {business.verificationStatus === 'verified' && (
                          <span className="text-xs bg-success/20 text-success px-3 py-1 rounded-full border border-success/30">
                            Verified
                          </span>
                        )}
                      </div>
                    ))}
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
                    <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Bell className="h-4 w-4 text-accent" />
                    </div>
                    Upcoming Reminders
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
                  <div className="space-y-3">
                    {upcomingReminders.map((reminder) => {
                      const dueDate = new Date(reminder.dueDate);
                      const isOverdue = isAfter(new Date(), dueDate);
                      const isDueSoon = isAfter(addDays(new Date(), 7), dueDate) && !isOverdue;

                      return (
                        <div
                          key={reminder.id}
                          className="flex items-center justify-between p-4 rounded-xl glass-subtle hover-lift transition-all duration-300"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
                              isOverdue ? 'bg-destructive/20 glow-primary' : isDueSoon ? 'bg-warning/20' : 'bg-success/20'
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
                          <span className={`text-xs font-medium ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {format(dueDate, 'MMM d')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expense Summary - Full Width */}
            <Card className="glass-frosted shadow-futuristic border-border/40 lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Receipt className="h-4 w-4 text-primary" />
                    </div>
                    Expense Summary
                  </CardTitle>
                  <div className="flex gap-2">
                    <Link to="/business-report">
                      <Button variant="outline" size="sm" className="hidden sm:flex">
                        <FileText className="h-4 w-4 mr-1" />
                        Report
                      </Button>
                    </Link>
                    <Link to="/expenses">
                      <Button variant="ghost" size="sm" className="group">
                        Manage
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <div className="text-center py-12 glass-subtle rounded-xl">
                    <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-4">No expenses tracked yet</p>
                    <Link to="/expenses">
                      <Button variant="glow" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Expense
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="chart-glass-container">
                    <ExpenseCharts expenses={expenses} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up-delay-2">
            <Link to="/calculator">
              <Button variant="outline" className="w-full h-14 glass-subtle neon-border hover-lift group">
                <Calculator className="h-5 w-5 mr-2 text-primary" />
                <span className="text-foreground">New Calculation</span>
              </Button>
            </Link>
            <Link to="/expenses">
              <Button variant="outline" className="w-full h-14 glass-subtle neon-border hover-lift group">
                <Receipt className="h-5 w-5 mr-2 text-success" />
                <span className="text-foreground">Track Expense</span>
              </Button>
            </Link>
            <Link to="/reminders">
              <Button variant="outline" className="w-full h-14 glass-subtle neon-border hover-lift group">
                <Bell className="h-5 w-5 mr-2 text-accent" />
                <span className="text-foreground">Set Reminder</span>
              </Button>
            </Link>
            <Link to="/learn">
              <Button variant="outline" className="w-full h-14 glass-subtle neon-border hover-lift group">
                <Sparkles className="h-5 w-5 mr-2 text-warning" />
                <span className="text-foreground">Tax Tips</span>
              </Button>
            </Link>
          </div>

          <FeedbackForm />
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
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext: string;
  gradient: string;
  iconColor: string;
  valueColor?: string;
}) => (
  <div className={`glass-frosted rounded-2xl p-4 sm:p-5 shadow-futuristic overflow-hidden hover-lift transition-all duration-300 relative group`}>
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50 group-hover:opacity-70 transition-opacity`} />
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-3">
        <div className={`h-9 w-9 rounded-xl bg-background/50 flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <span className="text-xs sm:text-sm text-muted-foreground font-medium">{label}</span>
      </div>
      <p className={`text-xl sm:text-2xl font-bold truncate ${valueColor || 'text-foreground'}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1 truncate">{subtext}</p>
    </div>
  </div>
);

export default Dashboard;