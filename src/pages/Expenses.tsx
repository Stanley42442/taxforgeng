import { useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { notifyExpenseAdded } from "@/lib/notifications";
import {
  Receipt,
  Plus,
  Upload,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calculator,
  Crown,
  FileSpreadsheet,
  PieChart,
  Loader2,
  Sparkles,
  CalendarIcon,
  Filter,
  X,
  Camera,
  Search,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Download,
  AlertTriangle,
  Target,
  Repeat,
  Settings2,
  TrendingUp as TrendUp,
  TrendingDown as TrendDown,
  Bell,
  CalendarClock,
  Flag,
  Trophy,
  Pencil,
  Brain,
  Sparkles as SparklesIcon
} from "lucide-react";
import { formatCurrency } from "@/lib/taxCalculations";
import { jsPDF } from "jspdf";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ExpenseCharts } from "@/components/ExpenseCharts";
import { ExpenseAnalytics } from "@/components/ExpenseAnalytics";
import { OCRReceiptScanner } from "@/components/OCRReceiptScanner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: 'income' | 'rent' | 'transport' | 'marketing' | 'salary' | 'utilities' | 'supplies' | 'other';
  type: 'income' | 'expense';
  isDeductible: boolean;
  businessId?: string;
}

const getExpenseCategories = () => [
  { value: 'income', label: 'Income', type: 'income' as const },
  { value: 'rent', label: 'Rent & Office', type: 'expense' as const, deductible: true },
  { value: 'transport', label: 'Transport & Travel', type: 'expense' as const, deductible: true },
  { value: 'marketing', label: 'Marketing & Ads', type: 'expense' as const, deductible: true },
  { value: 'salary', label: 'Salaries & Wages', type: 'expense' as const, deductible: true },
  { value: 'utilities', label: 'Utilities', type: 'expense' as const, deductible: true },
  { value: 'supplies', label: 'Supplies & Equipment', type: 'expense' as const, deductible: true },
  { value: 'other', label: 'Other Expenses', type: 'expense' as const, deductible: false },
];

const getCategoryIcon = (category: Expense['category']) => {
  const icons: Record<Expense['category'], string> = {
    income: '💰',
    rent: '🏢',
    transport: '🚗',
    marketing: '📢',
    salary: '👥',
    utilities: '💡',
    supplies: '📦',
    other: '📋',
  };
  return icons[category];
};

const getCategoryColor = (category: Expense['category']) => {
  const colors: Record<Expense['category'], string> = {
    income: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    rent: 'bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400',
    transport: 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400',
    marketing: 'bg-pink-500/15 border-pink-500/30 text-pink-600 dark:text-pink-400',
    salary: 'bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-400',
    utilities: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-600 dark:text-cyan-400',
    supplies: 'bg-orange-500/15 border-orange-500/30 text-orange-600 dark:text-orange-400',
    other: 'bg-slate-500/15 border-slate-500/30 text-slate-600 dark:text-slate-400',
  };
  return colors[category];
};

const estimateTax = (income: number): number => {
  if (income <= 800000) return 0;
  let tax = 0;
  let remaining = income;
  
  if (remaining > 800000) {
    const band = Math.min(remaining - 800000, 2200000);
    tax += band * 0.15;
    remaining -= 800000 + band;
  }
  if (remaining > 0) {
    const band = Math.min(remaining, 7000000);
    tax += band * 0.19;
    remaining -= band;
  }
  if (remaining > 0) {
    const band = Math.min(remaining, 40000000);
    tax += band * 0.21;
    remaining -= band;
  }
  if (remaining > 0) {
    tax += remaining * 0.25;
  }
  
  return tax;
};

const Expenses = () => {
  const { tier, savedBusinesses } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showOCRScanner, setShowOCRScanner] = useState(false);
  const [filterBusinessId, setFilterBusinessId] = useState<string>('all');
  const [showCharts, setShowCharts] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [showMonthlySummary, setShowMonthlySummary] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => {
    const saved = localStorage.getItem('expenseBudget');
    return saved ? Number(saved) : 0;
  });
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [showCategoryBudgetsDialog, setShowCategoryBudgetsDialog] = useState(false);
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('categoryBudgets');
    return saved ? JSON.parse(saved) : {};
  });
  const [showRecurringDialog, setShowRecurringDialog] = useState(false);
  const [recurringTemplates, setRecurringTemplates] = useState<Array<{
    id: string;
    description: string;
    amount: number;
    category: Expense['category'];
    businessId?: string;
    dueDay?: number; // Day of month (1-31)
    lastPaidDate?: string;
  }>>(() => {
    const saved = localStorage.getItem('recurringTemplates');
    return saved ? JSON.parse(saved) : [
      { id: '1', description: 'Office Rent', amount: 150000, category: 'rent', dueDay: 1 },
      { id: '2', description: 'Internet & Phone', amount: 25000, category: 'utilities', dueDay: 15 },
      { id: '3', description: 'Staff Salaries', amount: 350000, category: 'salary', dueDay: 25 },
    ];
  });
  const [newTemplate, setNewTemplate] = useState({ description: '', amount: '', category: 'rent' as Expense['category'], dueDay: '' });
  const [showComparison, setShowComparison] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('expenseNotificationsEnabled');
    return saved === 'true';
  });
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const [budgetInput, setBudgetInput] = useState('');
  
  // Savings Goals per business
  const [showGoalsDialog, setShowGoalsDialog] = useState(false);
  const [savingsGoals, setSavingsGoals] = useState<Record<string, {
    targetAmount: number;
    targetDate: string;
    description: string;
  }>>(() => {
    const saved = localStorage.getItem('savingsGoals');
    return saved ? JSON.parse(saved) : {};
  });
  const [editingGoalBusiness, setEditingGoalBusiness] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({ targetAmount: '', targetDate: '', description: '' });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [notifiedAchievements, setNotifiedAchievements] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('notifiedGoalAchievements');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: 'other' as Expense['category'],
    businessId: '',
  });

  useEffect(() => {
    setNewExpense(prev => ({
      ...prev,
      businessId: filterBusinessId !== 'all' ? filterBusinessId : ''
    }));
  }, [filterBusinessId]);

  const isBasicPlus = tier !== 'free';

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') {
      toast.error('Notifications are not supported in this browser');
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission === 'denied') {
      toast.error('Notification permission was denied. Please enable it in your browser settings.');
      return false;
    }
    
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    
    if (permission === 'granted') {
      toast.success('Notifications enabled!');
      return true;
    } else {
      toast.error('Notification permission denied');
      return false;
    }
  };

  // Toggle notifications
  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
        localStorage.setItem('expenseNotificationsEnabled', 'true');
        // Send a test notification
        sendExpenseNotification('Expense Reminders Enabled', 'You will now receive reminders for upcoming expenses.');
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('expenseNotificationsEnabled', 'false');
      toast.success('Notifications disabled');
    }
  };

  // Send notification
  const sendExpenseNotification = (title: string, body: string) => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'expense-reminder',
    });
  };

  // Check for due expenses and notify
  useEffect(() => {
    if (!notificationsEnabled || notificationPermission !== 'granted') return;
    
    const checkAndNotify = () => {
      const today = new Date();
      const currentDay = today.getDate();
      
      recurringTemplates.forEach(template => {
        if (!template.dueDay) return;
        
        // Notify 3 days before, 1 day before, and on due date
        const daysUntilDue = template.dueDay - currentDay;
        const notifiedKey = `notified_${template.id}_${today.getFullYear()}_${today.getMonth()}_${daysUntilDue}`;
        
        if ((daysUntilDue === 3 || daysUntilDue === 1 || daysUntilDue === 0) && !localStorage.getItem(notifiedKey)) {
          const message = daysUntilDue === 0 
            ? `${template.description} (${formatCurrency(template.amount)}) is due today!`
            : `${template.description} (${formatCurrency(template.amount)}) is due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}.`;
          
          sendExpenseNotification('Expense Reminder', message);
          localStorage.setItem(notifiedKey, 'true');
        }
      });
    };
    
    // Check immediately on load
    checkAndNotify();
    
    // Check every hour
    const interval = setInterval(checkAndNotify, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [notificationsEnabled, notificationPermission, recurringTemplates]);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user) {
        setExpenses([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        toast.error('Failed to load expenses');
      } else {
        const mapped: Expense[] = (data || []).map(e => ({
          id: e.id,
          date: e.date,
          description: e.description || '',
          amount: Number(e.amount),
          category: e.category as Expense['category'],
          type: e.type as 'income' | 'expense',
          isDeductible: e.is_deductible,
          businessId: e.business_id || undefined,
        }));
        setExpenses(mapped);
      }
      setLoading(false);
    };

    fetchExpenses();
  }, [user]);

  // Goal achievement notification effect
  useEffect(() => {
    if (!notificationsEnabled || expenses.length === 0) return;
    
    savedBusinesses.forEach(business => {
      const goalProgress = getGoalProgress(business.id);
      if (goalProgress?.isAchieved && !notifiedAchievements.has(business.id)) {
        // Send notification
        sendExpenseNotification(
          '🎉 Goal Achieved!',
          `Congratulations! ${business.name} has reached the savings goal of ${formatCurrency(goalProgress.targetAmount)}!`
        );
        toast.success(`🎉 ${business.name} reached its savings goal!`, {
          description: `Target of ${formatCurrency(goalProgress.targetAmount)} achieved!`,
          duration: 8000,
        });
        
        // Mark as notified
        const newNotified = new Set(notifiedAchievements);
        newNotified.add(business.id);
        setNotifiedAchievements(newNotified);
        localStorage.setItem('notifiedGoalAchievements', JSON.stringify([...newNotified]));
      }
    });
  }, [expenses, savingsGoals, notificationsEnabled, savedBusinesses, notifiedAchievements]);

  // Upgrade prompt for free tier
  if (!isBasicPlus) {
    return (
      <PageLayout title="Expense Tracker" icon={Receipt} maxWidth="6xl">
        <div className="text-center py-12">
          <div className="mx-auto max-w-md glass-frosted rounded-3xl p-10 shadow-futuristic">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-accent animate-float glow-sm">
              <Crown className="h-12 w-12 text-accent-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">Expense Tracker</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Upgrade to access expense tracking features
            </p>
            <Button variant="glow" size="lg" onClick={() => navigate('/pricing')} className="glow-sm">
              <Crown className="h-5 w-5" />
              Upgrade Now
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  const EXPENSE_CATEGORIES = getExpenseCategories();

  const handleAddExpense = async () => {
    if (!user) {
      toast.error("Please sign in to add expenses");
      return;
    }

    if (!newExpense.description.trim() || !newExpense.amount) {
      toast.error("Please fill all required fields");
      return;
    }

    const categoryInfo = EXPENSE_CATEGORIES.find(c => c.value === newExpense.category);
    const expenseType = categoryInfo?.type || 'expense';
    const isDeductible = expenseType === 'expense' ? (categoryInfo?.deductible ?? false) : false;

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        business_id: newExpense.businessId || null,
        date: newExpense.date,
        description: newExpense.description.trim(),
        amount: Number(newExpense.amount),
        category: newExpense.category,
        type: expenseType,
        is_deductible: isDeductible,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding expense:', error);
      toast.error("Failed to add expense");
      return;
    }

    const expense: Expense = {
      id: data.id,
      date: data.date,
      description: data.description || '',
      amount: Number(data.amount),
      category: data.category as Expense['category'],
      type: data.type as 'income' | 'expense',
      isDeductible: data.is_deductible,
      businessId: data.business_id || undefined,
    };

    setExpenses(prev => [expense, ...prev]);
    setShowAddDialog(false);
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      category: 'other',
      businessId: '',
    });
    toast.success("Expense added successfully");
    notifyExpenseAdded(expense.description, expense.amount, expense.type === 'income');
  };

  const handleCSVImport = async () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }

    const mockData = [
      { date: '2025-12-01', description: 'Client Payment - Project A', amount: 500000, category: 'income', type: 'income', is_deductible: false },
      { date: '2025-12-05', description: 'Office Rent December', amount: 150000, category: 'rent', type: 'expense', is_deductible: true },
      { date: '2025-12-10', description: 'Google Ads Campaign', amount: 45000, category: 'marketing', type: 'expense', is_deductible: true },
      { date: '2025-12-12', description: 'Staff Salaries', amount: 350000, category: 'salary', type: 'expense', is_deductible: true },
      { date: '2025-12-15', description: 'Freelance Work', amount: 200000, category: 'income', type: 'income', is_deductible: false },
    ];

    const { data, error } = await supabase
      .from('expenses')
      .insert(mockData.map(e => ({ ...e, user_id: user.id })))
      .select();

    if (error) {
      console.error('Error importing expenses:', error);
      toast.error("Failed to import expenses");
      return;
    }

    const mapped: Expense[] = (data || []).map(e => ({
      id: e.id,
      date: e.date,
      description: e.description || '',
      amount: Number(e.amount),
      category: e.category as Expense['category'],
      type: e.type as 'income' | 'expense',
      isDeductible: e.is_deductible,
    }));

    setExpenses(prev => [...mapped, ...prev]);
    toast.success("Expenses imported successfully");
  };

  const handleDeleteExpense = async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      toast.error("Failed to delete expense");
      return;
    }

    setExpenses(prev => prev.filter(e => e.id !== id));
    toast.success("Expense deleted successfully");
  };

  const filteredExpenses = expenses.filter(e => {
    if (filterBusinessId !== 'all' && e.businessId !== filterBusinessId) return false;
    if (filterType !== 'all' && e.type !== filterType) return false;
    if (filterCategory !== 'all' && e.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (!e.description.toLowerCase().includes(query)) return false;
    }
    if (dateFrom) {
      const expenseDate = new Date(e.date);
      if (expenseDate < dateFrom) return false;
    }
    if (dateTo) {
      const expenseDate = new Date(e.date);
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      if (expenseDate > endOfDay) return false;
    }
    return true;
  });

  // Monthly summary calculation
  const monthlySummary = filteredExpenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = { monthName, income: 0, expenses: 0, net: 0 };
    }
    
    if (expense.type === 'income') {
      acc[monthKey].income += expense.amount;
    } else {
      acc[monthKey].expenses += expense.amount;
    }
    acc[monthKey].net = acc[monthKey].income - acc[monthKey].expenses;
    
    return acc;
  }, {} as Record<string, { monthName: string; income: number; expenses: number; net: number }>);

  const sortedMonths = Object.entries(monthlySummary).sort((a, b) => b[0].localeCompare(a[0]));

  // Monthly comparison data
  const getMonthComparison = () => {
    if (sortedMonths.length < 2) return null;
    const current = sortedMonths[0];
    const previous = sortedMonths[1];
    const expenseChange = current[1].expenses - previous[1].expenses;
    const incomeChange = current[1].income - previous[1].income;
    const expenseChangePercent = previous[1].expenses > 0 ? ((expenseChange / previous[1].expenses) * 100) : 0;
    const incomeChangePercent = previous[1].income > 0 ? ((incomeChange / previous[1].income) * 100) : 0;
    return {
      current: current[1],
      previous: previous[1],
      expenseChange,
      incomeChange,
      expenseChangePercent,
      incomeChangePercent,
    };
  };
  const monthComparison = getMonthComparison();

  // Recurring expense reminders - find upcoming due dates
  const getUpcomingDueExpenses = () => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    return recurringTemplates
      .filter(t => t.dueDay)
      .map(t => {
        const dueDay = t.dueDay!;
        let dueDate: Date;
        
        // If due day has passed this month, show next month
        if (dueDay < currentDay) {
          dueDate = new Date(currentYear, currentMonth + 1, dueDay);
        } else {
          dueDate = new Date(currentYear, currentMonth, dueDay);
        }
        
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const isPastDue = daysUntilDue < 0;
        const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0;
        
        // Check if already paid this month
        const isPaidThisMonth = t.lastPaidDate && new Date(t.lastPaidDate).getMonth() === currentMonth;
        
        return {
          ...t,
          dueDate,
          daysUntilDue,
          isPastDue,
          isDueSoon,
          isPaidThisMonth,
        };
      })
      .filter(t => !t.isPaidThisMonth)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  };
  const upcomingDueExpenses = getUpcomingDueExpenses();

  // Current month expense check for budget
  const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const currentMonthExpenses = monthlySummary[currentMonthKey]?.expenses || 0;
  const isBudgetExceeded = monthlyBudget > 0 && currentMonthExpenses > monthlyBudget;
  const budgetPercentage = monthlyBudget > 0 ? Math.min((currentMonthExpenses / monthlyBudget) * 100, 100) : 0;

  const hasActiveFilters = filterType !== 'all' || filterCategory !== 'all' || dateFrom !== undefined || dateTo !== undefined || filterBusinessId !== 'all' || searchQuery.trim() !== '';

  const clearFilters = () => {
    setFilterType('all');
    setFilterCategory('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setFilterBusinessId('all');
    setSearchQuery('');
  };

  const handleSetBudget = () => {
    const budget = Number(budgetInput) || 0;
    setMonthlyBudget(budget);
    localStorage.setItem('expenseBudget', budget.toString());
    setShowBudgetDialog(false);
    setBudgetInput('');
    toast.success(budget > 0 ? `Monthly budget set to ${formatCurrency(budget)}` : 'Budget limit removed');
  };

  const handleSetCategoryBudget = (category: string, amount: number) => {
    const updated = { ...categoryBudgets, [category]: amount };
    if (amount === 0) delete updated[category];
    setCategoryBudgets(updated);
    localStorage.setItem('categoryBudgets', JSON.stringify(updated));
  };

  const getCategorySpending = (category: string) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return expenses
      .filter(e => e.category === category && e.type === 'expense')
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const handleAddRecurringTemplate = () => {
    if (!newTemplate.description || !newTemplate.amount) {
      toast.error('Please fill in all fields');
      return;
    }
    const template = {
      id: Date.now().toString(),
      description: newTemplate.description,
      amount: Number(newTemplate.amount),
      category: newTemplate.category,
      dueDay: newTemplate.dueDay ? Number(newTemplate.dueDay) : undefined,
    };
    const updated = [...recurringTemplates, template];
    setRecurringTemplates(updated);
    localStorage.setItem('recurringTemplates', JSON.stringify(updated));
    setNewTemplate({ description: '', amount: '', category: 'rent', dueDay: '' });
    toast.success('Template added');
  };

  const handleDeleteTemplate = (id: string) => {
    const updated = recurringTemplates.filter(t => t.id !== id);
    setRecurringTemplates(updated);
    localStorage.setItem('recurringTemplates', JSON.stringify(updated));
    toast.success('Template removed');
  };

  const handleApplyTemplate = async (template: typeof recurringTemplates[0]) => {
    if (!user) {
      toast.error('Please sign in to add expenses');
      return;
    }
    const categoryConfig = EXPENSE_CATEGORIES.find(c => c.value === template.category);
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        description: template.description,
        amount: template.amount,
        category: template.category,
        type: 'expense',
        is_deductible: categoryConfig?.deductible || false,
        business_id: template.businessId || null,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add expense');
      return;
    }

    const expense: Expense = {
      id: data.id,
      date: data.date,
      description: data.description || '',
      amount: Number(data.amount),
      category: data.category as Expense['category'],
      type: 'expense',
      isDeductible: data.is_deductible,
      businessId: data.business_id || undefined,
    };
    setExpenses(prev => [expense, ...prev]);
    
    // Mark template as paid this month
    const updatedTemplates = recurringTemplates.map(t => 
      t.id === template.id ? { ...t, lastPaidDate: new Date().toISOString().split('T')[0] } : t
    );
    setRecurringTemplates(updatedTemplates);
    localStorage.setItem('recurringTemplates', JSON.stringify(updatedTemplates));
    
    toast.success(`Added ${template.description}`);
  };

  const markTemplateAsPaid = (templateId: string) => {
    const updatedTemplates = recurringTemplates.map(t => 
      t.id === templateId ? { ...t, lastPaidDate: new Date().toISOString().split('T')[0] } : t
    );
    setRecurringTemplates(updatedTemplates);
    localStorage.setItem('recurringTemplates', JSON.stringify(updatedTemplates));
    toast.success('Marked as paid');
  };

  // Savings Goals Functions
  const handleSaveGoal = (businessId: string) => {
    if (!newGoal.targetAmount || !newGoal.targetDate) {
      toast.error('Please set a target amount and date');
      return;
    }
    const updated = {
      ...savingsGoals,
      [businessId]: {
        targetAmount: Number(newGoal.targetAmount),
        targetDate: newGoal.targetDate,
        description: newGoal.description || 'Savings Goal',
      }
    };
    setSavingsGoals(updated);
    localStorage.setItem('savingsGoals', JSON.stringify(updated));
    setEditingGoalBusiness(null);
    setNewGoal({ targetAmount: '', targetDate: '', description: '' });
    toast.success('Savings goal saved!');
  };

  const handleDeleteGoal = (businessId: string) => {
    const updated = { ...savingsGoals };
    delete updated[businessId];
    setSavingsGoals(updated);
    localStorage.setItem('savingsGoals', JSON.stringify(updated));
    toast.success('Goal removed');
  };

  const getBusinessSavings = (businessId: string) => {
    const businessExpenses = expenses.filter(e => e.businessId === businessId);
    const income = businessExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const expenseTotal = businessExpenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    return income - expenseTotal;
  };

  const getGoalProgress = (businessId: string) => {
    const goal = savingsGoals[businessId];
    if (!goal) return null;
    
    const currentSavings = getBusinessSavings(businessId);
    const progress = Math.min((currentSavings / goal.targetAmount) * 100, 100);
    const remaining = Math.max(goal.targetAmount - currentSavings, 0);
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    const daysRemaining = Math.max(0, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    const isOverdue = today > targetDate;
    const isAchieved = currentSavings >= goal.targetAmount;
    
    return {
      ...goal,
      currentSavings,
      progress,
      remaining,
      daysRemaining,
      isOverdue,
      isAchieved,
    };
  };

  const exportMonthlySummaryPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = margin;

    // Header
    doc.setFillColor(26, 79, 62);
    doc.rect(0, 0, pageWidth, 8, 'F');
    doc.setFillColor(212, 175, 55);
    doc.rect(0, 8, pageWidth, 2, 'F');

    y = 25;
    doc.setTextColor(26, 79, 62);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Monthly Expense Summary', margin, y);
    y += 12;

    doc.setTextColor(128, 128, 128);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, y);
    y += 15;

    // Table header
    doc.setFillColor(26, 79, 62);
    doc.rect(margin, y, pageWidth - margin * 2, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Month', margin + 5, y + 7);
    doc.text('Income', margin + 60, y + 7);
    doc.text('Expenses', margin + 100, y + 7);
    doc.text('Net', margin + 140, y + 7);
    y += 14;

    // Table rows
    doc.setFont('helvetica', 'normal');
    sortedMonths.forEach(([, data], index) => {
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 248);
        doc.rect(margin, y - 4, pageWidth - margin * 2, 10, 'F');
      }
      doc.setTextColor(51, 51, 51);
      doc.text(data.monthName, margin + 5, y + 2);
      doc.setTextColor(34, 197, 94);
      doc.text(formatCurrency(data.income), margin + 60, y + 2);
      doc.setTextColor(239, 68, 68);
      doc.text(formatCurrency(data.expenses), margin + 100, y + 2);
      doc.setTextColor(data.net >= 0 ? 34 : 239, data.net >= 0 ? 197 : 68, data.net >= 0 ? 94 : 68);
      doc.text(formatCurrency(data.net), margin + 140, y + 2);
      y += 10;
    });

    // Totals
    y += 5;
    const totals = sortedMonths.reduce((acc, [, data]) => ({
      income: acc.income + data.income,
      expenses: acc.expenses + data.expenses,
      net: acc.net + data.net
    }), { income: 0, expenses: 0, net: 0 });

    doc.setFillColor(26, 79, 62);
    doc.rect(margin, y, pageWidth - margin * 2, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', margin + 5, y + 8);
    doc.text(formatCurrency(totals.income), margin + 60, y + 8);
    doc.text(formatCurrency(totals.expenses), margin + 100, y + 8);
    doc.text(formatCurrency(totals.net), margin + 140, y + 8);

    doc.save('monthly-expense-summary.pdf');
    toast.success('Monthly summary exported to PDF');
  };

  const totalIncome = filteredExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpensesAmount = filteredExpenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const deductibleExpenses = filteredExpenses.filter(e => e.isDeductible).reduce((sum, e) => sum + e.amount, 0);
  const taxableIncome = Math.max(0, totalIncome - deductibleExpenses);
  const estimatedTax = estimateTax(taxableIncome);

  const getBusinessName = (businessId?: string) => {
    if (!businessId) return null;
    const business = savedBusinesses.find(b => b.id === businessId);
    return business?.name || null;
  };

  if (loading) {
    return (
      <PageLayout title="Expense Tracker" icon={Receipt} maxWidth="6xl">
        <div className="text-center py-20">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-4">Loading expenses...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Expense Tracker" description="Track and manage your business income and expenses" icon={Receipt} maxWidth="6xl">
      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="neumorphic-sm p-4 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-success/10 shrink-0">
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <span className="text-sm text-muted-foreground truncate">Income</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-success truncate">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="neumorphic-sm p-4 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-destructive/10 shrink-0">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                </div>
                <span className="text-sm text-muted-foreground truncate">Expenses</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-destructive truncate">{formatCurrency(totalExpensesAmount)}</p>
            </div>
            <div className="neumorphic-sm p-4 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                  <Receipt className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground truncate">Deductible</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-primary truncate">{formatCurrency(deductibleExpenses)}</p>
            </div>
            <div className="neumorphic-sm p-4 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-warning/10 shrink-0">
                  <Calculator className="h-4 w-4 text-warning" />
                </div>
                <span className="text-sm text-muted-foreground truncate">Est. Tax</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-warning truncate">{formatCurrency(estimatedTax)}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="glass rounded-xl p-4 mb-6 shadow-card">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="glow" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4" />
                Add Entry
              </Button>
              <Button variant="outline" className="glass" onClick={() => setShowOCRScanner(true)}>
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Scan Receipt</span>
              </Button>
              <Button variant="outline" className="glass" onClick={handleCSVImport}>
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Import CSV</span>
              </Button>
              <Button 
                variant="outline"
                className="glass"
                onClick={() => navigate('/calculator', { 
                  state: { prefill: { turnover: totalIncome, expenses: deductibleExpenses } } 
                })}
                disabled={totalIncome === 0}
              >
                <Calculator className="h-4 w-4" />
                <span className="hidden sm:inline">Use in Calculator</span>
              </Button>
              <Button variant="outline" className="glass" onClick={() => setShowCharts(!showCharts)}>
                <PieChart className="h-4 w-4" />
                <span className="hidden sm:inline">{showCharts ? 'Hide' : 'Show'} Charts</span>
              </Button>
              <Button 
                variant={showMonthlySummary ? "secondary" : "outline"}
                className={showMonthlySummary ? "" : "glass"}
                onClick={() => setShowMonthlySummary(!showMonthlySummary)}
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Monthly</span>
              </Button>
              <Button 
                variant={showComparison ? "secondary" : "outline"}
                className={showComparison ? "" : "glass"}
                onClick={() => setShowComparison(!showComparison)}
              >
                <TrendUp className="h-4 w-4" />
                <span className="hidden sm:inline">Compare</span>
              </Button>
              <Button 
                variant="outline"
                className="glass"
                onClick={() => setShowBudgetDialog(true)}
              >
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Budget</span>
              </Button>
              <Button 
                variant="outline"
                className="glass"
                onClick={() => setShowCategoryBudgetsDialog(true)}
              >
                <Settings2 className="h-4 w-4" />
                <span className="hidden sm:inline">Category Budgets</span>
              </Button>
              <Button 
                variant="outline"
                className="glass"
                onClick={() => setShowRecurringDialog(true)}
              >
                <Repeat className="h-4 w-4" />
                <span className="hidden sm:inline">Templates</span>
              </Button>
              <Button 
                variant={showAnalytics ? "secondary" : "outline"}
                className={showAnalytics ? "" : "glass"}
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">AI Insights</span>
              </Button>
              <Button 
                variant={showGoalsDialog ? "secondary" : "outline"}
                className={showGoalsDialog ? "" : "glass"}
                onClick={() => setShowGoalsDialog(!showGoalsDialog)}
              >
                <Flag className="h-4 w-4" />
                <span className="hidden sm:inline">Goals</span>
              </Button>
              <Button 
                variant={notificationsEnabled ? "secondary" : "outline"}
                className={notificationsEnabled ? "" : "glass"}
                onClick={toggleNotifications}
                title={notificationsEnabled ? 'Notifications enabled' : 'Enable notifications'}
              >
                <Bell className={`h-4 w-4 ${notificationsEnabled ? 'text-warning' : ''}`} />
                <span className="hidden sm:inline">{notificationsEnabled ? 'Alerts On' : 'Alerts'}</span>
              </Button>
              <Button 
                variant={showFilters ? "secondary" : "outline"}
                className={showFilters ? "" : "glass"}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5">!</span>}
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
            {/* Search Bar */}
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50"
              />
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="glass rounded-xl p-4 mb-6 shadow-card">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, "PPP") : "Start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, "PPP") : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Type</Label>
                  <Select value={filterType} onValueChange={(v) => setFilterType(v as 'all' | 'income' | 'expense')}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="income">Income Only</SelectItem>
                      <SelectItem value="expense">Expenses Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Category</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {EXPENSE_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {savedBusinesses.length > 0 && (
                  <div className="space-y-2 sm:col-span-2 lg:col-span-4">
                    <Label className="text-sm">Business</Label>
                    <Select value={filterBusinessId} onValueChange={setFilterBusinessId}>
                      <SelectTrigger className="w-full sm:w-[280px]">
                        <SelectValue placeholder="All businesses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Businesses</SelectItem>
                        {savedBusinesses.map((business) => (
                          <SelectItem key={business.id} value={business.id}>{business.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upcoming Expense Reminders */}
          {upcomingDueExpenses.length > 0 && (
            <div className="glass-frosted rounded-xl p-4 mb-4 shadow-futuristic">
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <div className="p-1 rounded-lg bg-warning/10">
                  <Bell className="h-4 w-4 text-warning" />
                </div>
                Upcoming Expenses
                <span className="ml-auto text-xs text-muted-foreground">{upcomingDueExpenses.length} due</span>
              </h3>
              <div className="space-y-2">
                {upcomingDueExpenses.slice(0, 5).map(item => (
                  <div 
                    key={item.id} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      item.isDueSoon ? 'bg-warning/10 border-warning/30' : 'bg-card/50 border-border/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg">{getCategoryIcon(item.category)}</span>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{item.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Due: {item.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {item.isDueSoon && <span className="ml-2 text-warning font-medium">({item.daysUntilDue === 0 ? 'Today' : `${item.daysUntilDue}d`})</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatCurrency(item.amount)}</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 px-2"
                        onClick={() => handleApplyTemplate(item)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Month Comparison */}
          {showComparison && monthComparison && (
            <div className="glass-frosted rounded-xl p-4 mb-4 shadow-futuristic">
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <div className="p-1 rounded-lg bg-primary/10">
                  <TrendUp className="h-4 w-4 text-primary" />
                </div>
                Month-over-Month Comparison
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Expenses</p>
                  <div className="flex items-center gap-2">
                    {monthComparison.expenseChange > 0 ? (
                      <TrendUp className="h-5 w-5 text-destructive" />
                    ) : monthComparison.expenseChange < 0 ? (
                      <TrendDown className="h-5 w-5 text-success" />
                    ) : null}
                    <span className={`text-lg font-bold ${monthComparison.expenseChange > 0 ? 'text-destructive' : monthComparison.expenseChange < 0 ? 'text-success' : 'text-muted-foreground'}`}>
                      {monthComparison.expenseChange > 0 ? '+' : ''}{monthComparison.expenseChangePercent.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(monthComparison.current.expenses)} vs {formatCurrency(monthComparison.previous.expenses)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Income</p>
                  <div className="flex items-center gap-2">
                    {monthComparison.incomeChange > 0 ? (
                      <TrendUp className="h-5 w-5 text-success" />
                    ) : monthComparison.incomeChange < 0 ? (
                      <TrendDown className="h-5 w-5 text-destructive" />
                    ) : null}
                    <span className={`text-lg font-bold ${monthComparison.incomeChange > 0 ? 'text-success' : monthComparison.incomeChange < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {monthComparison.incomeChange > 0 ? '+' : ''}{monthComparison.incomeChangePercent.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(monthComparison.current.income)} vs {formatCurrency(monthComparison.previous.income)}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-muted/30">
                <p className="text-xs text-center text-muted-foreground">
                  Comparing <span className="font-medium text-foreground">{monthComparison.current.monthName}</span> to <span className="font-medium text-foreground">{monthComparison.previous.monthName}</span>
                </p>
              </div>
            </div>
          )}

          {/* Budget Alert */}
          {monthlyBudget > 0 && (
            <div className={`rounded-xl p-4 mb-6 border ${isBudgetExceeded ? 'bg-destructive/10 border-destructive/30' : 'bg-card/50 border-border/50'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isBudgetExceeded ? (
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  ) : (
                    <Target className="h-5 w-5 text-primary" />
                  )}
                  <span className="font-medium text-sm">
                    {isBudgetExceeded ? 'Budget Exceeded!' : 'Monthly Budget'}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(currentMonthExpenses)} / {formatCurrency(monthlyBudget)}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${isBudgetExceeded ? 'bg-destructive' : budgetPercentage > 80 ? 'bg-warning' : 'bg-primary'}`}
                  style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                />
              </div>
              {isBudgetExceeded && (
                <p className="text-xs text-destructive mt-2">
                  You've exceeded your budget by {formatCurrency(currentMonthExpenses - monthlyBudget)}
                </p>
              )}
            </div>
          )}

          {/* Savings Goals Section */}
          {showGoalsDialog && savedBusinesses.length > 0 && (
            <div className="glass-frosted rounded-xl p-4 mb-6 shadow-futuristic">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-success/10">
                    <Flag className="h-5 w-5 text-success" />
                  </div>
                  Savings Goals by Business
                </h3>
              </div>
              
              <div className="space-y-4">
                {savedBusinesses.map(business => {
                  const goalProgress = getGoalProgress(business.id);
                  const isEditing = editingGoalBusiness === business.id;
                  
                  return (
                    <div key={business.id} className="p-4 rounded-xl bg-card/50 border border-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🏢</span>
                          <span className="font-medium">{business.name}</span>
                        </div>
                        {!isEditing && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEditingGoalBusiness(business.id);
                              if (goalProgress) {
                                setNewGoal({
                                  targetAmount: goalProgress.targetAmount.toString(),
                                  targetDate: goalProgress.targetDate,
                                  description: goalProgress.description,
                                });
                              }
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            {goalProgress ? 'Edit' : 'Set Goal'}
                          </Button>
                        )}
                      </div>
                      
                      {isEditing ? (
                        <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                          <div className="space-y-1">
                            <Label className="text-xs">Goal Description</Label>
                            <Input
                              placeholder="e.g., Q1 Savings Target"
                              value={newGoal.description}
                              onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                              className="h-9"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Target Amount (₦)</Label>
                              <Input
                                type="number"
                                placeholder="500000"
                                value={newGoal.targetAmount}
                                onChange={(e) => setNewGoal(prev => ({ ...prev, targetAmount: e.target.value }))}
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Target Date</Label>
                              <Input
                                type="date"
                                value={newGoal.targetDate}
                                onChange={(e) => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                                className="h-9"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" onClick={() => handleSaveGoal(business.id)}>
                              Save Goal
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                setEditingGoalBusiness(null);
                                setNewGoal({ targetAmount: '', targetDate: '', description: '' });
                              }}
                            >
                              Cancel
                            </Button>
                            {goalProgress && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="text-destructive hover:text-destructive ml-auto"
                                onClick={() => handleDeleteGoal(business.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : goalProgress ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{goalProgress.description}</span>
                            <span className="flex items-center gap-1">
                              {goalProgress.isAchieved ? (
                                <Trophy className="h-4 w-4 text-warning" />
                              ) : goalProgress.isOverdue ? (
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              ) : null}
                              <span className={goalProgress.isAchieved ? 'text-success font-medium' : goalProgress.isOverdue ? 'text-destructive' : 'text-muted-foreground'}>
                                {goalProgress.isAchieved ? 'Achieved!' : goalProgress.isOverdue ? 'Overdue' : `${goalProgress.daysRemaining}d left`}
                              </span>
                            </span>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">
                                Current: <span className={`font-medium ${goalProgress.currentSavings >= 0 ? 'text-success' : 'text-destructive'}`}>
                                  {formatCurrency(goalProgress.currentSavings)}
                                </span>
                              </span>
                              <span className="text-muted-foreground">
                                Target: <span className="font-medium text-foreground">{formatCurrency(goalProgress.targetAmount)}</span>
                              </span>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all ${goalProgress.isAchieved ? 'bg-success' : goalProgress.progress > 50 ? 'bg-primary' : 'bg-warning'}`}
                                style={{ width: `${goalProgress.progress}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{goalProgress.progress.toFixed(0)}% complete</span>
                              {!goalProgress.isAchieved && (
                                <span>{formatCurrency(goalProgress.remaining)} to go</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-xs text-muted-foreground pt-1">
                            Target date: {new Date(goalProgress.targetDate).toLocaleDateString('en-NG', { 
                              year: 'numeric', month: 'long', day: 'numeric' 
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-2">
                          No savings goal set for this business
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {savedBusinesses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Flag className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Save a business first to set savings goals</p>
                  <Button variant="link" size="sm" onClick={() => navigate('/businesses')}>
                    Go to Saved Businesses
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Monthly Summary Section */}
          {showMonthlySummary && sortedMonths.length > 0 && (
            <div className="neumorphic p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  Monthly Summary
                </h2>
                <Button variant="outline" size="sm" onClick={exportMonthlySummaryPDF}>
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export PDF</span>
                </Button>
              </div>
              <div className="space-y-3">
                {sortedMonths.map(([key, data]) => (
                  <div key={key} className="bg-card/50 border border-border/50 rounded-lg p-4 overflow-hidden">
                    <p className="font-medium text-foreground mb-2">{data.monthName}</p>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="min-w-0">
                        <p className="text-muted-foreground text-xs">Income</p>
                        <p className="text-success font-semibold text-sm truncate">{formatCurrency(data.income)}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-muted-foreground text-xs">Expenses</p>
                        <p className="text-destructive font-semibold text-sm truncate">{formatCurrency(data.expenses)}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-muted-foreground text-xs">Net</p>
                        <p className={`font-semibold text-sm truncate ${data.net >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {formatCurrency(Math.abs(data.net))}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts Section */}
          {showCharts && filteredExpenses.length > 0 && (
            <div className="neumorphic p-6 mb-6">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <PieChart className="h-5 w-5 text-primary" />
                </div>
                Expense Analytics
              </h2>
              <ExpenseCharts expenses={filteredExpenses} />
            </div>
          )}

          {/* AI-Powered Analytics Section */}
          {showAnalytics && filteredExpenses.length > 0 && (
            <div className="neumorphic p-6 mb-6">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                AI-Powered Analytics
                <span className="ml-auto text-xs text-muted-foreground font-normal">
                  Spending patterns & insights
                </span>
              </h2>
              <ExpenseAnalytics 
                expenses={filteredExpenses} 
                businessName={filterBusinessId !== 'all' ? savedBusinesses.find(b => b.id === filterBusinessId)?.name : undefined}
              />
            </div>
          )}


          <div className="glass-frosted rounded-xl p-4 mb-4 shadow-futuristic">
            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <div className="p-1 rounded-lg bg-primary/10">
                <PieChart className="h-4 w-4 text-primary" />
              </div>
              Category Legend
            </h3>
            <div className="flex flex-wrap gap-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <div 
                  key={cat.value}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getCategoryColor(cat.value as Expense['category'])}`}
                >
                  <span>{getCategoryIcon(cat.value as Expense['category'])}</span>
                  <span>{cat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Budget Progress */}
          {Object.keys(categoryBudgets).length > 0 && (
            <div className="glass-frosted rounded-xl p-4 mb-4 shadow-futuristic">
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <div className="p-1 rounded-lg bg-warning/10">
                  <Target className="h-4 w-4 text-warning" />
                </div>
                Category Budgets This Month
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {EXPENSE_CATEGORIES.filter(c => c.type === 'expense' && categoryBudgets[c.value]).map(cat => {
                  const spent = getCategorySpending(cat.value);
                  const budget = categoryBudgets[cat.value] || 0;
                  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
                  const isOver = spent > budget;
                  return (
                    <div key={cat.value} className={`p-3 rounded-lg border ${getCategoryColor(cat.value as Expense['category'])}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{getCategoryIcon(cat.value as Expense['category'])}</span>
                          <span className="text-sm font-medium">{cat.label}</span>
                        </div>
                        {isOver && <AlertTriangle className="h-4 w-4 text-destructive" />}
                      </div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{formatCurrency(spent)}</span>
                        <span>{formatCurrency(budget)}</span>
                      </div>
                      <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${isOver ? 'bg-destructive' : percentage > 80 ? 'bg-warning' : 'bg-success'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="glass-frosted rounded-xl p-6 shadow-futuristic">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
              </div>
              Transactions ({filteredExpenses.length})
            </h2>

            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
                  <Receipt className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">
                  {filterBusinessId !== 'all' ? 'No entries for this business' : 'No entries yet'}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4" />
                    Add Entry
                  </Button>
                  <Button variant="outline" onClick={handleCSVImport}>
                    <Upload className="h-4 w-4" />
                    Import Mock CSV
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.map((expense) => {
                  const businessName = getBusinessName(expense.businessId);
                  const isExpanded = expandedCardId === expense.id;
                  return (
                    <div 
                      key={expense.id} 
                      className={`rounded-xl p-4 cursor-pointer active:opacity-80 transition-all border ${getCategoryColor(expense.category)}`}
                      onClick={() => setExpandedCardId(isExpanded ? null : expense.id)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-xl">{getCategoryIcon(expense.category)}</span>
                          <div className="min-w-0 flex-1">
                            <p className={`font-medium ${isExpanded ? '' : 'truncate'}`}>
                              {expense.description}
                            </p>
                            {isExpanded && (
                              <p className="text-xs opacity-75 mt-1">
                                Category: {EXPENSE_CATEGORIES.find(c => c.value === expense.category)?.label || expense.category}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 opacity-60" />
                          ) : (
                            <ChevronDown className="h-4 w-4 opacity-60" />
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:bg-destructive/10 h-7 w-7" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteExpense(expense.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs opacity-75">
                        <span>{new Date(expense.date).toLocaleDateString()}</span>
                        {businessName && <span>• {businessName}</span>}
                        {expense.isDeductible && (
                          <span className="px-1.5 py-0.5 rounded-full bg-success/10 text-success font-medium">Deductible</span>
                        )}
                      </div>
                      <div className={`font-bold text-base mt-1 ${expense.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        ₦{expense.amount >= 1_000_000_000 
                          ? `${(expense.amount / 1_000_000_000).toFixed(1)}B`
                          : expense.amount >= 1_000_000 
                            ? `${(expense.amount / 1_000_000).toFixed(1)}M`
                            : expense.amount >= 1_000 
                              ? `${(expense.amount / 1_000).toFixed(1)}K`
                              : expense.amount.toLocaleString()
                        }
                        {isExpanded && expense.amount >= 1_000 && (
                          <span className="text-sm font-normal opacity-75 ml-2">
                            (₦{expense.amount.toLocaleString()})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

      {/* Add Expense Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Add Entry
            </DialogTitle>
            <DialogDescription>Add a new income or expense entry</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={newExpense.category} onValueChange={(v) => setNewExpense({ ...newExpense, category: v as Expense['category'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="e.g., Client payment, Office rent"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Amount (₦)</Label>
              <Input
                type="number"
                placeholder="0"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              />
            </div>
            {savedBusinesses.length > 0 && (
              <div className="space-y-2">
                <Label>Business (optional)</Label>
                <Select value={newExpense.businessId || "none"} onValueChange={(v) => setNewExpense({ ...newExpense, businessId: v === "none" ? "" : v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No business</SelectItem>
                    {savedBusinesses.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddExpense}>Add Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OCR Receipt Scanner */}
      <OCRReceiptScanner
        open={showOCRScanner}
        onOpenChange={setShowOCRScanner}
        onReceiptParsed={async (data) => {
          if (!user) {
            toast.error("Please sign in to add expenses");
            return;
          }

          const categoryInfo = EXPENSE_CATEGORIES.find(c => c.value === data.category);
          const expenseType = categoryInfo?.type || 'expense';
          const isDeductible = expenseType === 'expense' ? (categoryInfo?.deductible ?? false) : false;

          const { data: dbData, error } = await supabase
            .from('expenses')
            .insert({
              user_id: user.id,
              date: data.date,
              description: data.description,
              amount: data.amount,
              category: data.category,
              type: expenseType,
              is_deductible: isDeductible,
            })
            .select()
            .single();

          if (error) {
            console.error('Error adding expense:', error);
            toast.error('Failed to add expense from receipt');
            return;
          }

          const expense: Expense = {
            id: dbData.id,
            date: dbData.date,
            description: dbData.description || '',
            amount: Number(dbData.amount),
            category: dbData.category as Expense['category'],
            type: dbData.type as 'income' | 'expense',
            isDeductible: dbData.is_deductible,
          };

          setExpenses(prev => [expense, ...prev]);
          notifyExpenseAdded(expense.description, expense.amount, expense.type === 'income');
        }}
      />

      {/* Budget Dialog */}
      <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Set Monthly Budget
            </DialogTitle>
            <DialogDescription>Set a spending limit to track your expenses</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Monthly Budget (₦)</Label>
              <Input
                type="number"
                placeholder={monthlyBudget > 0 ? monthlyBudget.toString() : "Enter amount"}
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
              />
              {monthlyBudget > 0 && (
                <p className="text-xs text-muted-foreground">
                  Current budget: {formatCurrency(monthlyBudget)}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            {monthlyBudget > 0 && (
              <Button variant="outline" onClick={() => { setMonthlyBudget(0); localStorage.removeItem('expenseBudget'); setShowBudgetDialog(false); toast.success('Budget removed'); }}>
                Remove
              </Button>
            )}
            <Button onClick={handleSetBudget}>Set Budget</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Budgets Dialog */}
      <Dialog open={showCategoryBudgetsDialog} onOpenChange={setShowCategoryBudgetsDialog}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              Category Budgets
            </DialogTitle>
            <DialogDescription>Set spending limits for each category</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {EXPENSE_CATEGORIES.filter(c => c.type === 'expense').map(cat => {
              const spent = getCategorySpending(cat.value);
              const budget = categoryBudgets[cat.value] || 0;
              const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
              const isOver = budget > 0 && spent > budget;
              return (
                <div key={cat.value} className={`p-3 rounded-lg border ${getCategoryColor(cat.value as Expense['category'])}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{getCategoryIcon(cat.value as Expense['category'])}</span>
                      <span className="font-medium">{cat.label}</span>
                    </div>
                    <Input
                      type="number"
                      placeholder="No limit"
                      value={categoryBudgets[cat.value] || ''}
                      onChange={(e) => handleSetCategoryBudget(cat.value, Number(e.target.value) || 0)}
                      className="w-32 h-8 text-sm"
                    />
                  </div>
                  {budget > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Spent: {formatCurrency(spent)}</span>
                        <span className={isOver ? 'text-destructive font-medium' : ''}>
                          {isOver ? 'Over by ' + formatCurrency(spent - budget) : formatCurrency(budget - spent) + ' left'}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${isOver ? 'bg-destructive' : percentage > 80 ? 'bg-warning' : 'bg-success'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryBudgetsDialog(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recurring Templates Dialog */}
      <Dialog open={showRecurringDialog} onOpenChange={setShowRecurringDialog}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-primary" />
              Recurring Expense Templates
            </DialogTitle>
            <DialogDescription>Quickly add common monthly expenses</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Existing Templates */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Your Templates</Label>
              {recurringTemplates.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No templates yet</p>
              ) : (
                <div className="space-y-2">
                  {recurringTemplates.map(template => (
                    <div 
                      key={template.id} 
                      className={`flex items-center justify-between p-3 rounded-lg border ${getCategoryColor(template.category)}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span>{getCategoryIcon(template.category)}</span>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{template.description}</p>
                          <div className="flex items-center gap-2 text-xs opacity-75">
                            <span>{formatCurrency(template.amount)}</span>
                            {template.dueDay && (
                              <span className="flex items-center gap-1">
                                <CalendarClock className="h-3 w-3" />
                                Due: {template.dueDay}{['st', 'nd', 'rd'][((template.dueDay + 90) % 100 - 10) % 10 - 1] || 'th'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8"
                          onClick={() => handleApplyTemplate(template)}
                        >
                          <Plus className="h-4 w-4" />
                          Add
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Template */}
            <div className="border-t pt-4 space-y-3">
              <Label className="text-sm font-medium">Add New Template</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newTemplate.amount}
                  onChange={(e) => setNewTemplate({ ...newTemplate, amount: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Select 
                  value={newTemplate.category} 
                  onValueChange={(v) => setNewTemplate({ ...newTemplate, category: v as Expense['category'] })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.filter(c => c.type === 'expense').map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Due day (1-31)"
                  value={newTemplate.dueDay}
                  onChange={(e) => setNewTemplate({ ...newTemplate, dueDay: e.target.value })}
                  className="w-28"
                  min={1}
                  max={31}
                />
              </div>
              <Button onClick={handleAddRecurringTemplate} className="w-full">
                <Plus className="h-4 w-4" />
                Add Template
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecurringDialog(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default Expenses;
