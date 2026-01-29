import { useState, useEffect, useRef } from "react";
import { PageLayout } from "@/components/PageLayout";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
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
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
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
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const pieContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pieContainerRef.current && !pieContainerRef.current.contains(event.target as Node)) {
        setActiveIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePieClick = (data: any, index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

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
        .is('deleted_at', null)
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

  useEffect(() => {
    if (savedBusinesses.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(savedBusinesses[0].id);
    }
  }, [savedBusinesses, selectedBusinessId]);

  const selectedBusiness = savedBusinesses.find(b => b.id === selectedBusinessId);
  const businessExpenses = expenses.filter(e => e.businessId === selectedBusinessId);

  const totalIncome = businessExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = businessExpenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const deductibleExpenses = businessExpenses.filter(e => e.isDeductible).reduce((sum, e) => sum + e.amount, 0);
  const netIncome = totalIncome - totalExpenses;
  const taxableIncome = Math.max(0, totalIncome - deductibleExpenses);

  const estimateTax = (income: number, isCompany: boolean, turnover: number): number => {
    if (isCompany) {
      if (turnover <= 50000000) return 0;
      return income * 0.25 + income * 0.04;
    } else {
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
      <PageLayout title="Business Report" icon={FileText}>
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">Please sign in to view business reports</p>
          <Button variant="hero" onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </PageLayout>
    );
  }

  if (loading || businessLoading) {
    return (
      <PageLayout title="Business Report" icon={FileText}>
        <div className="text-center py-10">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-4">Loading business report...</p>
        </div>
      </PageLayout>
    );
  }

  if (savedBusinesses.length === 0) {
    return (
      <PageLayout title="Business Report" icon={FileText}>
        <div className="text-center py-10">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">No Businesses Found</h2>
          <p className="text-muted-foreground mb-6">
            Add a business first to generate reports
          </p>
          <Button variant="hero" onClick={() => navigate('/businesses')}>
            Add Business
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Business Report" 
      icon={FileText}
      description="Financial overview and tax estimates"
      maxWidth="6xl"
      headerActions={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Select value={selectedBusinessId} onValueChange={setSelectedBusinessId}>
            <SelectTrigger className="w-full sm:w-[200px] h-9 text-sm">
              <SelectValue placeholder="Select Business" />
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
      }
    >
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
              <span className="text-xs text-muted-foreground">Total Income</span>
            </div>
            <p className="text-xl font-bold text-success">{formatCurrency(totalIncome)}</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Total Expenses</span>
            </div>
            <p className="text-xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Tax Deductible</span>
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
              <span className="text-xs text-muted-foreground">Est. Tax Due</span>
            </div>
            <p className="text-xl font-bold text-warning">{formatCurrency(estimatedTax)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <div className="grid gap-6 lg:grid-cols-2 animate-slide-up">
        {/* Expense Breakdown Chart */}
        <Card className="glass-frosted shadow-futuristic border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <PieChart className="h-4 w-4 text-primary" />
              </div>
              Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className={`transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {pieData.length > 0 ? (
                <div className="h-[16rem] relative" ref={pieContainerRef}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="value"
                        animationBegin={200}
                        animationDuration={1000}
                        animationEasing="ease-out"
                        onClick={handlePieClick}
                        style={{ cursor: 'pointer' }}
                      >
                        {pieData.map((entry, index) => {
                          const isActive = activeIndex === index;
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color}
                              stroke={isActive ? 'hsl(var(--foreground))' : 'transparent'}
                              strokeWidth={isActive ? 3 : 0}
                              style={{
                                filter: activeIndex !== null && !isActive ? 'opacity(0.4)' : 'none',
                                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                transformOrigin: 'center',
                                transition: 'all 0.2s ease-out',
                                cursor: 'pointer'
                              }}
                            />
                          );
                        })}
                      </Pie>
                    </RechartsPie>
                  </ResponsiveContainer>
                  {activeIndex !== null && pieData[activeIndex] && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{pieData[activeIndex].name}</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(pieData[activeIndex].value)}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-[16rem] flex items-center justify-center text-muted-foreground">
                  No expense data available
                </div>
              )}
              
              {/* Legend */}
              {pieData.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {pieData.map((entry, index) => (
                    <div 
                      key={entry.name}
                      className={`flex items-center gap-2 text-sm cursor-pointer rounded-md p-1 transition-all ${
                        activeIndex === index ? 'bg-muted ring-1 ring-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                    >
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-muted-foreground truncate">{entry.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tax Estimate Details */}
        <Card className="glass-frosted shadow-futuristic border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <Calculator className="h-4 w-4 text-warning" />
              </div>
              Tax Estimate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Total Income</span>
                <span className="font-medium">{formatCurrency(totalIncome)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Deductible Expenses</span>
                <span className="font-medium text-success">-{formatCurrency(deductibleExpenses)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Taxable Income</span>
                <span className="font-medium">{formatCurrency(taxableIncome)}</span>
              </div>
              <div className="flex justify-between py-3 bg-warning/10 rounded-lg px-3">
                <span className="font-medium text-foreground">Estimated Tax</span>
                <span className="font-bold text-warning">{formatCurrency(estimatedTax)}</span>
              </div>
              
              <p className="text-xs text-muted-foreground mt-4">
                {isCompany 
                  ? 'Based on Company Income Tax (CIT) rates for 2026'
                  : 'Based on Personal Income Tax (PIT) rates for 2026'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default BusinessReport;