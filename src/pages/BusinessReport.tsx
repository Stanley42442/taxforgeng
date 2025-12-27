import { useState, useEffect } from "react";
import { NavMenu } from "@/components/NavMenu";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Calculator,
  FileText,
  Loader2,
  ArrowLeft,
  Receipt,
  PieChart,
  Download,
} from "lucide-react";
import { formatCurrency } from "@/lib/taxCalculations";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { downloadBusinessReportPDF } from "@/lib/businessReportPdf";
import { toast } from "sonner";

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

const CATEGORY_COLORS: Record<string, string> = {
  income: '#22c55e',
  rent: '#3b82f6',
  transport: '#8b5cf6',
  marketing: '#f59e0b',
  salary: '#ef4444',
  utilities: '#06b6d4',
  supplies: '#ec4899',
  other: '#6b7280',
};

const CATEGORY_LABELS: Record<string, string> = {
  income: 'Income',
  rent: 'Rent & Office',
  transport: 'Transport',
  marketing: 'Marketing',
  salary: 'Salaries',
  utilities: 'Utilities',
  supplies: 'Supplies',
  other: 'Other',
};

const BusinessReport = () => {
  const { tier, savedBusinesses, loading: businessLoading } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      const mapped: Expense[] = (data || []).map(e => ({
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
      setLoading(false);
    };

    if (!businessLoading) {
      fetchExpenses();
    }
  }, [user, businessLoading]);

  // Set first business as default
  useEffect(() => {
    if (savedBusinesses.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(savedBusinesses[0].id);
    }
  }, [savedBusinesses, selectedBusinessId]);

  const selectedBusiness = savedBusinesses.find(b => b.id === selectedBusinessId);
  const businessExpenses = expenses.filter(e => e.businessId === selectedBusinessId);

  // Calculate metrics
  const totalIncome = businessExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = businessExpenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const deductibleExpenses = businessExpenses.filter(e => e.isDeductible).reduce((sum, e) => sum + e.amount, 0);
  const netIncome = totalIncome - totalExpenses;
  const taxableIncome = Math.max(0, totalIncome - deductibleExpenses);

  // Calculate estimated tax
  const estimateTax = (income: number, isCompany: boolean, turnover: number): number => {
    if (isCompany) {
      // CIT calculation
      if (turnover <= 50000000) return 0; // Small company exemption
      return income * 0.25 + income * 0.04; // 25% CIT + 4% dev levy
    } else {
      // PIT calculation
      if (income <= 800000) return 0;
      let tax = 0;
      let remaining = income - 800000;
      
      if (remaining > 0) {
        const band = Math.min(remaining, 2200000);
        tax += band * 0.15;
        remaining -= band;
      }
      if (remaining > 0) {
        const band = Math.min(remaining, 7000000);
        tax += band * 0.19;
        remaining -= band;
      }
      if (remaining > 0) {
        tax += remaining * 0.21;
      }
      
      return tax;
    }
  };

  const isCompany = selectedBusiness?.entityType === 'company';
  const businessTurnover = selectedBusiness?.turnover || 0;
  const estimatedTax = estimateTax(taxableIncome, isCompany, businessTurnover);

  // Category breakdown
  const categoryData = businessExpenses
    .filter(e => e.type === 'expense')
    .reduce((acc: Record<string, number>, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

  const pieData = Object.entries(categoryData).map(([category, amount]) => ({
    name: CATEGORY_LABELS[category] || category,
    value: amount,
    color: CATEGORY_COLORS[category] || '#6b7280',
  }));

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <NavMenu />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Please sign in to view reports.</p>
          <Button variant="hero" className="mt-4" onClick={() => navigate('/auth')}>
            Sign In
          </Button>
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
          <p className="text-muted-foreground mt-4">Loading report...</p>
        </div>
      </div>
    );
  }

  if (savedBusinesses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <NavMenu />
        <div className="container mx-auto px-4 py-20 text-center">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">No Businesses</h1>
          <p className="text-muted-foreground mb-6">
            Add a business first to generate expense reports.
          </p>
          <Button variant="hero" onClick={() => navigate('/businesses')}>
            Add Business
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col overflow-x-hidden">
      <NavMenu />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-8 flex-1">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-4 sm:mb-6 animate-slide-up">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 sm:h-10 sm:w-10" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-primary shrink-0">
                  <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">Business Report</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    Income, expenses & tax estimates
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Select value={selectedBusinessId} onValueChange={setSelectedBusinessId}>
                <SelectTrigger className="w-full sm:w-[200px] h-9 text-sm">
                  <SelectValue placeholder="Select business" />
                </SelectTrigger>
                <SelectContent>
                  {savedBusinesses.map((business) => (
                    <SelectItem key={business.id} value={business.id}>
                      {business.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-sm"
                onClick={() => {
                  if (selectedBusiness && tier !== 'free') {
                    downloadBusinessReportPDF({
                      businessName: selectedBusiness.name,
                      entityType: selectedBusiness.entityType,
                      turnover: businessTurnover,
                      totalIncome,
                      totalExpenses,
                      deductibleExpenses,
                      netIncome,
                      taxableIncome,
                      estimatedTax,
                      expenses: businessExpenses,
                      categoryBreakdown: categoryData,
                    });
                    toast.success('Report downloaded!');
                  } else if (tier === 'free') {
                    toast.error('Upgrade to Basic+ to export PDF');
                  }
                }}
                disabled={!selectedBusiness || tier === 'free'}
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Business Info Card */}
          {selectedBusiness && (
            <Card className="mb-6 shadow-card animate-slide-up">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                  {selectedBusiness.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>{' '}
                    <span className="font-medium">{isCompany ? 'LLC (CIT)' : 'Business Name (PIT)'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Registered Turnover:</span>{' '}
                    <span className="font-medium">{formatCurrency(businessTurnover)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Transactions:</span>{' '}
                    <span className="font-medium">{businessExpenses.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6 animate-slide-up">
            <Card className="shadow-card">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-xs text-muted-foreground">Income</span>
                </div>
                <p className="text-xl font-bold text-success">{formatCurrency(totalIncome)}</p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <span className="text-xs text-muted-foreground">Expenses</span>
                </div>
                <p className="text-xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Receipt className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Deductible</span>
                </div>
                <p className="text-xl font-bold text-foreground">{formatCurrency(deductibleExpenses)}</p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <PieChart className="h-4 w-4 text-success" />
                  <span className="text-xs text-muted-foreground">Net Income</span>
                </div>
                <p className={`text-xl font-bold ${netIncome >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(netIncome)}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calculator className="h-4 w-4 text-warning" />
                  <span className="text-xs text-muted-foreground">Est. Tax</span>
                </div>
                <p className="text-xl font-bold text-warning">{formatCurrency(estimatedTax)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Details */}
          <div className="grid gap-6 lg:grid-cols-2 animate-slide-up">
            {/* Expense Breakdown Chart */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PieChart className="h-5 w-5 text-primary" />
                  Expense Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No expenses recorded for this business
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tax Summary */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="h-5 w-5 text-primary" />
                  Tax Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Total Income</span>
                    <span className="font-medium text-success">{formatCurrency(totalIncome)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Deductible Expenses</span>
                    <span className="font-medium text-foreground">- {formatCurrency(deductibleExpenses)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Taxable Income</span>
                    <span className="font-bold text-foreground">{formatCurrency(taxableIncome)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Tax Type</span>
                    <span className="font-medium">{isCompany ? 'CIT (25% + 4% Levy)' : 'PIT (Progressive)'}</span>
                  </div>
                  {isCompany && businessTurnover <= 50000000 && (
                    <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-sm">
                      <span className="text-success font-medium">Small Company Exemption Applied</span>
                      <p className="text-muted-foreground mt-1">
                        Companies with ≤₦50M turnover pay 0% CIT under 2026 rules.
                      </p>
                    </div>
                  )}
                  <div className="flex justify-between py-3 rounded-lg bg-warning/10 px-3">
                    <span className="font-semibold text-foreground">Estimated Tax Due</span>
                    <span className="font-bold text-warning text-lg">{formatCurrency(estimatedTax)}</span>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/calculator', {
                      state: {
                        prefill: {
                          entityType: isCompany ? 'company' : 'business_name',
                          turnover: totalIncome || businessTurnover,
                          expenses: deductibleExpenses,
                        }
                      }
                    })}
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Open Full Calculator
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="mt-6 shadow-card animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Receipt className="h-5 w-5 text-primary" />
                Recent Transactions ({businessExpenses.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {businessExpenses.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No transactions linked to this business</p>
                  <Button variant="outline" onClick={() => navigate('/expenses')}>
                    Add Expenses
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {businessExpenses.slice(0, 20).map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div>
                        <p className="font-medium text-foreground text-sm">{expense.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(expense.date).toLocaleDateString('en-NG', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                          {expense.isDeductible && (
                            <span className="ml-2 text-success">• Deductible</span>
                          )}
                        </p>
                      </div>
                      <span className={`font-semibold ${expense.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                        {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border text-center text-sm text-muted-foreground animate-slide-up">
            <strong>Disclaimer:</strong> This report provides educational estimates based on the Nigeria Tax Act 2025. 
            Always consult FIRS/state IRS or tax professionals for official advice.
          </div>
        </div>
      </main>
    </div>
  );
};

export default BusinessReport;
