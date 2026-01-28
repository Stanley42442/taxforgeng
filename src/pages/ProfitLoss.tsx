import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, FileText, Calendar } from "lucide-react";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { formatCurrency } from "@/lib/taxCalculations";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from "date-fns";
import logger from "@/lib/logger";

interface ExpenseData { category: string; type: string; amount: number; date: string; }
interface InvoiceData { total: number; status: string; issued_date: string; paid_date: string | null; }

interface PeriodData { income: number; expenses: number; grossProfit: number; netProfit: number; byCategory: Record<string, number>; }

const tierOrder = ['free', 'basic', 'professional', 'business', 'enterprise'] as const;

const ProfitLoss = () => {
  const { user } = useAuth();
  const { savedBusinesses, tier } = useSubscription();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<string>("all");
  const [period, setPeriod] = useState<string>("month");
  const canAccess = tierOrder.indexOf(tier as typeof tierOrder[number]) >= tierOrder.indexOf('basic');

  useEffect(() => {
    if (user && canAccess) fetchData();
  }, [user, canAccess, selectedBusiness]);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      let expenseQuery = supabase.from('expenses').select('category, type, amount, date').eq('user_id', user.id);
      if (selectedBusiness !== 'all') expenseQuery = expenseQuery.eq('business_id', selectedBusiness);
      const { data: expenseData } = await expenseQuery;
      setExpenses(expenseData || []);

      let invoiceQuery = supabase.from('invoices').select('total, status, issued_date, paid_date').eq('user_id', user.id).eq('status', 'paid');
      if (selectedBusiness !== 'all') invoiceQuery = invoiceQuery.eq('business_id', selectedBusiness);
      const { data: invoiceData } = await invoiceQuery;
      setInvoices(invoiceData || []);
    } catch (error) {
      logger.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodDates = () => {
    const now = new Date();
    switch (period) {
      case 'month': return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'quarter': return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) };
      case 'year': return { start: startOfYear(now), end: endOfYear(now) };
      default: return { start: new Date(2000, 0, 1), end: now };
    }
  };

  const periodData = useMemo<PeriodData>(() => {
    const { start, end } = getPeriodDates();
    const periodInvoices = invoices.filter(inv => { const date = new Date(inv.paid_date || inv.issued_date); return date >= start && date <= end; });
    const income = periodInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    const periodExpenses = expenses.filter(exp => { const date = new Date(exp.date); return date >= start && date <= end; });
    const totalExpenses = periodExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const byCategory: Record<string, number> = {};
    periodExpenses.forEach(exp => { byCategory[exp.category] = (byCategory[exp.category] || 0) + Number(exp.amount); });
    return { income, expenses: totalExpenses, grossProfit: income, netProfit: income - totalExpenses, byCategory };
  }, [expenses, invoices, period]);

  const profitMargin = periodData.income > 0 ? ((periodData.netProfit / periodData.income) * 100).toFixed(1) : '0.0';

  if (!canAccess) {
    return (
      <PageLayout title="Profit & Loss Statement" description="Financial performance overview" icon={FileText}>
        <div className="max-w-lg mx-auto py-12">
          <UpgradePrompt 
            feature="Profit & Loss Reports" 
            requiredTier="basic"
            showFeatures={true}
          />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Profit & Loss Statement" 
      description="Financial performance overview" 
      icon={FileText}
      headerActions={
        <div className="flex gap-2 flex-wrap">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]"><Calendar className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          {savedBusinesses.length > 0 && (
            <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Businesses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Businesses</SelectItem>
                {savedBusinesses.map((business: any) => (<SelectItem key={business.id} value={business.id}>{business.name}</SelectItem>))}
              </SelectContent>
            </Select>
          )}
        </div>
      }
    >
      {loading ? (
        <div className="text-center py-12">Loading financial data...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card><CardContent className="p-4 overflow-hidden"><div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><TrendingUp className="h-4 w-4 text-green-500 shrink-0" />Total Revenue</div><div className="text-lg sm:text-2xl font-bold text-green-600 break-all">{formatCurrency(periodData.income)}</div></CardContent></Card>
            <Card><CardContent className="p-4 overflow-hidden"><div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><TrendingDown className="h-4 w-4 text-red-500 shrink-0" />Total Expenses</div><div className="text-lg sm:text-2xl font-bold text-red-600 break-all">{formatCurrency(periodData.expenses)}</div></CardContent></Card>
            <Card><CardContent className="p-4 overflow-hidden"><div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><DollarSign className="h-4 w-4 shrink-0" />Net Profit</div><div className={`text-lg sm:text-2xl font-bold break-all ${periodData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(periodData.netProfit)}</div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground mb-1">Profit Margin</div><div className="text-lg sm:text-2xl font-bold">{profitMargin}%</div><Badge variant={Number(profitMargin) >= 20 ? "default" : "secondary"} className="mt-1">{Number(profitMargin) >= 20 ? 'Healthy' : 'Needs Attention'}</Badge></CardContent></Card>
          </div>

          {/* P&L Statement */}
          <Card>
            <CardHeader>
              <CardTitle>Statement Details</CardTitle>
              <CardDescription>
                {period === 'month' && `For ${format(new Date(), 'MMMM yyyy')}`}
                {period === 'quarter' && `Last 3 months ending ${format(new Date(), 'MMMM yyyy')}`}
                {period === 'year' && `For ${format(new Date(), 'yyyy')}`}
                {period === 'all' && 'All time'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-500" />Revenue</h3>
                  <div className="ml-6 space-y-2">
                    <div className="flex justify-between py-2 border-b"><span>Invoice Revenue (Paid)</span><span className="font-medium">{formatCurrency(periodData.income)}</span></div>
                    <div className="flex justify-between py-2 font-bold"><span>Total Revenue</span><span className="text-green-600">{formatCurrency(periodData.income)}</span></div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><TrendingDown className="h-5 w-5 text-red-500" />Operating Expenses</h3>
                  <div className="ml-6 space-y-2">
                    {Object.entries(periodData.byCategory).map(([category, amount]) => (
                      <div key={category} className="flex justify-between py-2 border-b"><span className="capitalize">{category.replace('_', ' ')}</span><span className="font-medium">{formatCurrency(amount)}</span></div>
                    ))}
                    {Object.keys(periodData.byCategory).length === 0 && <div className="text-muted-foreground py-2">No expenses recorded</div>}
                    <div className="flex justify-between py-2 font-bold"><span>Total Expenses</span><span className="text-red-600">{formatCurrency(periodData.expenses)}</span></div>
                  </div>
                </div>
                <div className="border-t-2 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">Net Profit / (Loss)</span>
                    <span className={`text-2xl font-bold ${periodData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(periodData.netProfit)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </PageLayout>
  );
};

export default ProfitLoss;
