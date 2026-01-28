import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addMonths, addDays, isBefore, startOfDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Calculator,
  TrendingUp,
  Calendar,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  Filter,
  Sparkles,
  Bell,
  BellRing,
  Clock
} from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { usePersonalExpenses, PersonalExpenseInput } from '@/hooks/usePersonalExpenses';
import { PERSONAL_EXPENSE_CATEGORIES, PAYMENT_INTERVALS, getCategoryById, calculateAnnualAmount } from '@/lib/personalExpenseCategories';
import { EXPENSE_TEMPLATES } from '@/lib/expenseTemplates';
import { useAuth } from '@/hooks/useAuth';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { useDeviceCSS, getResponsiveClasses } from '@/hooks/useDeviceCSS';
import { PersonalExpenseCard } from '@/components/expenses/PersonalExpenseCard';

const currentYear = new Date().getFullYear();
const TAX_YEARS = [currentYear, currentYear - 1, currentYear - 2];

export default function PersonalExpenses() {
  const { device, isMobile, isTablet, containerClass} = useDeviceCSS();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [summaryExpanded, setSummaryExpanded] = useState(true);
  const [templatesExpanded, setTemplatesExpanded] = useState(false);
  const [showReminders, setShowReminders] = useState(true);

  const {
    expenses,
    loading,
    annualTotals,
    totalDeductible,
    numberOfChildren,
    numberOfDependents,
    hasDisability,
    addExpense,
    updateExpense,
    deleteExpense
  } = usePersonalExpenses(selectedYear);

  // Calculate upcoming payment reminders
  const getUpcomingReminders = () => {
    const today = startOfDay(new Date());
    const reminderDays = 7; // Remind 7 days before
    
    return expenses.filter(expense => {
      if (expense.payment_interval === 'one_time') return false;
      
      const startDate = new Date(expense.start_date);
      let nextPaymentDate: Date;
      
      switch (expense.payment_interval) {
        case 'weekly':
          nextPaymentDate = addDays(startDate, 7 * Math.ceil((today.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)));
          break;
        case 'monthly':
          const monthsDiff = (today.getFullYear() - startDate.getFullYear()) * 12 + today.getMonth() - startDate.getMonth();
          nextPaymentDate = addMonths(startDate, monthsDiff + (today.getDate() >= startDate.getDate() ? 1 : 0));
          break;
        case 'quarterly':
          const quartersDiff = Math.floor(((today.getFullYear() - startDate.getFullYear()) * 12 + today.getMonth() - startDate.getMonth()) / 3);
          nextPaymentDate = addMonths(startDate, (quartersDiff + 1) * 3);
          break;
        case 'annually':
          const yearsDiff = today.getFullYear() - startDate.getFullYear();
          nextPaymentDate = new Date(startDate);
          nextPaymentDate.setFullYear(startDate.getFullYear() + yearsDiff + (today >= new Date(startDate.getFullYear() + yearsDiff, startDate.getMonth(), startDate.getDate()) ? 1 : 0));
          break;
        default:
          return false;
      }
      
      // Check if next payment is within reminder period
      const reminderDate = addDays(today, reminderDays);
      return isBefore(nextPaymentDate, reminderDate) && !isBefore(nextPaymentDate, today);
    }).map(expense => {
      const category = getCategoryById(expense.category);
      return {
        ...expense,
        categoryName: category?.name || expense.category,
        categoryIcon: category?.icon || Info
      };
    });
  };

  const upcomingReminders = getUpcomingReminders();

  // Form state
  const [formData, setFormData] = useState<PersonalExpenseInput>({
    category: '',
    description: '',
    amount: 0,
    payment_interval: 'monthly',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: null,
    tax_year: selectedYear,
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      category: '',
      description: '',
      amount: 0,
      payment_interval: 'monthly',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: null,
      tax_year: selectedYear,
      notes: ''
    });
  };

  const handleAddExpense = async () => {
    if (!formData.category || formData.amount <= 0) return;
    
    const success = await addExpense({
      ...formData,
      tax_year: selectedYear
    });
    
    if (success) {
      setIsAddDialogOpen(false);
      resetForm();
    }
  };

  const handleUpdateExpense = async () => {
    if (!editingExpense || !formData.category || formData.amount <= 0) return;
    
    const success = await updateExpense(editingExpense, formData);
    
    if (success) {
      setEditingExpense(null);
      resetForm();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteExpenseId) return;
    await deleteExpense(deleteExpenseId);
    setDeleteExpenseId(null);
  };

  const openEditDialog = (expense: any) => {
    setFormData({
      category: expense.category,
      description: expense.description || '',
      amount: Number(expense.amount),
      payment_interval: expense.payment_interval,
      start_date: expense.start_date,
      end_date: expense.end_date,
      tax_year: expense.tax_year,
      notes: expense.notes || ''
    });
    setEditingExpense(expense.id);
  };

  const filteredExpenses = filterCategory === 'all' 
    ? expenses 
    : expenses.filter(e => e.category === filterCategory);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

  if (!user) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="glass-premium p-8 text-center">
            <CardContent>
              <h2 className="text-xl font-semibold mb-4">Login Required</h2>
              <p className="text-muted-foreground mb-4">Please log in to track your personal expenses.</p>
              <Button onClick={() => navigate('/auth')}>Go to Login</Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className={getResponsiveClasses(device, {
        mobile: 'mobile-container px-3 py-4',
        tablet: 'container mx-auto px-4 py-6 max-w-6xl',
        desktop: 'container mx-auto px-6 py-8 max-w-6xl'
      })}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className={getResponsiveClasses(device, {
            mobile: 'flex flex-col gap-4',
            tablet: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4',
            desktop: 'flex items-center justify-between gap-4'
          })}>
            <div>
              <h1 className={getResponsiveClasses(device, {
                mobile: 'display-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent',
                all: 'text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'
              })}>
                Personal Expenses
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Track tax-deductible personal expenses for accurate relief calculations
              </p>
            </div>
            <div className={getResponsiveClasses(device, {
              mobile: 'flex items-center gap-2 w-full',
              all: 'flex items-center gap-3'
            })}>
              <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                <SelectTrigger className={isMobile ? 'flex-1 input-neumorphic' : 'w-32'}>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TAX_YEARS.map(year => (
                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={() => setIsAddDialogOpen(true)} 
                className={getResponsiveClasses(device, {
                  mobile: 'flex-1 gap-2 btn-premium touch-feedback',
                  all: 'gap-2'
                })}
              >
                <Plus className="h-4 w-4" />
                {isMobile ? 'Add' : 'Add Expense'}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Annual Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={getResponsiveClasses(device, {
            mobile: 'glass-premium mb-4 mobile-card',
            all: 'glass-premium mb-6'
          })}>
            <Collapsible open={summaryExpanded} onOpenChange={setSummaryExpanded}>
              <CardHeader className={isMobile ? 'pb-2 px-4' : 'pb-2'}>
                <CollapsibleTrigger className="flex items-center justify-between w-full touch-feedback">
                  <div className="flex items-center gap-3">
                    <TrendingUp className={isMobile ? 'h-4 w-4 text-primary' : 'h-5 w-5 text-primary'} />
                    <div className="text-left">
                      <CardTitle className={isMobile ? 'text-base' : 'text-lg'}>Annual Summary - {selectedYear}</CardTitle>
                      <CardDescription className={isMobile ? 'text-xs' : ''}>Total deductible: {formatCurrency(totalDeductible)}</CardDescription>
                    </div>
                  </div>
                  {summaryExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className={isMobile ? 'px-4' : ''}>
                  <div className={getResponsiveClasses(device, {
                    mobile: 'grid grid-cols-2 gap-2',
                    tablet: 'grid grid-cols-3 gap-3',
                    desktop: 'grid grid-cols-5 gap-4'
                  })}>
                    {PERSONAL_EXPENSE_CATEGORIES.slice(0, 5).map(cat => {
                      const amount = annualTotals[cat.id as keyof typeof annualTotals] || 0;
                      const Icon = cat.icon;
                      return (
                        <div key={cat.id} className={getResponsiveClasses(device, {
                          mobile: 'p-2.5 rounded-lg bg-background/50 border border-border/50 neumorphic-inset',
                          all: 'p-3 rounded-lg bg-background/50 border border-border/50'
                        })}>
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className={isMobile ? 'h-3 w-3 text-muted-foreground' : 'h-4 w-4 text-muted-foreground'} />
                            <span className={isMobile ? 'text-[10px] text-muted-foreground truncate' : 'text-xs text-muted-foreground truncate'}>{cat.name}</span>
                          </div>
                          <p className={isMobile ? 'font-semibold text-xs' : 'font-semibold text-sm'}>{formatCurrency(amount)}</p>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {numberOfChildren > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {numberOfChildren} Children
                      </Badge>
                    )}
                    {numberOfDependents > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {numberOfDependents} Dependents
                      </Badge>
                    )}
                    {hasDisability && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Disability Relief
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/50">
                    <Button 
                      onClick={() => navigate('/individual-calculator')} 
                      className="w-full sm:w-auto gap-2"
                    >
                      <Calculator className="h-4 w-4" />
                      Use in Tax Calculator
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </motion.div>

        {/* Payment Reminders */}
        {showReminders && upcomingReminders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="glass-premium mb-6 border-warning/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl p-2.5 bg-warning/20">
                      <BellRing className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Upcoming Payments</CardTitle>
                      <CardDescription>{upcomingReminders.length} payment{upcomingReminders.length !== 1 ? 's' : ''} due soon</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowReminders(false)}>
                    Dismiss
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {upcomingReminders.slice(0, 3).map(reminder => {
                    const Icon = reminder.categoryIcon;
                    return (
                      <div 
                        key={reminder.id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-warning/20"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-warning" />
                          <div>
                            <p className="font-medium text-sm">{reminder.categoryName}</p>
                            <p className="text-xs text-muted-foreground">{reminder.description || 'Recurring payment'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{formatCurrency(Number(reminder.amount))}</p>
                          <div className="flex items-center gap-1 text-xs text-warning">
                            <Clock className="h-3 w-3" />
                            <span>Due soon</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Add Templates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass mb-6">
            <Collapsible open={templatesExpanded} onOpenChange={setTemplatesExpanded}>
              <CardHeader className="pb-2">
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-accent" />
                    <div className="text-left">
                      <CardTitle className="text-lg">Quick Add Templates</CardTitle>
                      <CardDescription>Add common expenses with one click</CardDescription>
                    </div>
                  </div>
                  {templatesExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {EXPENSE_TEMPLATES.map(template => {
                      const Icon = template.icon;
                      return (
                        <Button
                          key={template.id}
                          variant="outline"
                          className="h-auto py-3 px-4 flex flex-col items-start gap-1 text-left hover:border-primary/50 hover:bg-primary/5"
                          onClick={() => {
                            setFormData({
                              category: template.category,
                              description: template.description,
                              amount: template.suggestedAmount || 0,
                              payment_interval: template.payment_interval,
                              start_date: format(new Date(), 'yyyy-MM-dd'),
                              end_date: null,
                              tax_year: selectedYear,
                              notes: ''
                            });
                            setIsAddDialogOpen(true);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">{template.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {PAYMENT_INTERVALS.find(p => p.value === template.payment_interval)?.label}
                            {template.suggestedAmount && ` • ₦${template.suggestedAmount.toLocaleString()}`}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </motion.div>

        {/* Filter */}
        <div className="flex items-center gap-3 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {PERSONAL_EXPENSE_CATEGORIES.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Expenses List */}
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="glass animate-pulse h-20" />
              ))}
            </div>
          ) : filteredExpenses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No expenses yet</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your personal expenses to calculate tax reliefs automatically
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Expense
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map((expense, index) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PersonalExpenseCard
                    expense={expense}
                    selectedYear={selectedYear}
                    device={device}
                    isMobile={isMobile}
                    onEdit={openEditDialog}
                    onDelete={(id) => setDeleteExpenseId(id)}
                    formatCurrency={formatCurrency}
                    getResponsiveClasses={getResponsiveClasses}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Add/Edit Dialog */}
        <Dialog 
          open={isAddDialogOpen || !!editingExpense} 
          onOpenChange={(open) => {
            if (!open) {
              setIsAddDialogOpen(false);
              setEditingExpense(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="w-[92vw] max-w-md max-h-[70vh] rounded-xl p-4 flex flex-col mx-auto">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className={isMobile ? 'text-lg' : ''}>{editingExpense ? 'Edit Expense' : 'Add Personal Expense'}</DialogTitle>
              <DialogDescription className={isMobile ? 'text-sm' : ''}>
                Track tax-deductible personal expenses for {selectedYear}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 min-h-0 overflow-y-auto pr-2 mt-4">
              <div className={getResponsiveClasses(device, {
                mobile: 'space-y-3 pb-2',
                all: 'space-y-4 pb-2'
              })}>
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PERSONAL_EXPENSE_CATEGORIES.map(cat => {
                        const Icon = cat.icon;
                        return (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {cat.name}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {formData.category && (
                    <p className="text-xs text-muted-foreground">
                      {getCategoryById(formData.category)?.tooltip}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className={isMobile ? 'text-sm' : ''}>Amount (₦) *</Label>
                  <Input
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    placeholder="Enter amount"
                    className={isMobile ? 'input-neumorphic h-10' : 'h-9'}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Frequency *</Label>
                  <Select 
                    value={formData.payment_interval} 
                    onValueChange={(v) => setFormData({ ...formData, payment_interval: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_INTERVALS.map(interval => (
                        <SelectItem key={interval.value} value={interval.value}>
                          {interval.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm">Start Date</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">End Date</Label>
                    <Input
                      type="date"
                      value={formData.end_date || ''}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value || null })}
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Monthly rent at Victoria Island"
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes..."
                    rows={2}
                    className="min-h-[60px]"
                  />
                </div>

                {formData.amount > 0 && formData.payment_interval && (
                  <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Annual Total: </span>
                      <span className="font-semibold text-primary">
                        {formatCurrency(calculateAnnualAmount(
                          formData.amount,
                          formData.payment_interval,
                          new Date(formData.start_date),
                          formData.end_date ? new Date(formData.end_date) : undefined,
                          selectedYear
                        ))}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex-shrink-0 pt-3 border-t border-border/50">
              <Button variant="outline" size="sm" onClick={() => {
                setIsAddDialogOpen(false);
                setEditingExpense(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={editingExpense ? handleUpdateExpense : handleAddExpense}
                disabled={!formData.category || formData.amount <= 0}
              >
                {editingExpense ? 'Save Changes' : 'Add Expense'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <DeleteConfirmationDialog
          open={!!deleteExpenseId}
          onOpenChange={(open) => !open && setDeleteExpenseId(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Expense"
          description="Are you sure you want to delete this expense? This action cannot be undone."
        />
      </div>
    </PageLayout>
  );
}
