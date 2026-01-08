import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { NavMenu } from "@/components/NavMenu";
import { TrendingUp, TrendingDown, DollarSign, FileText, Download, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/taxCalculations";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from "date-fns";

interface ExpenseData {
  category: string;
  type: string;
  amount: number;
  date: string;
}

interface PeriodData {
  income: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
  byCategory: Record<string, number>;
}

const ProfitLoss = () => {
  const { user } = useAuth();
  const { savedBusinesses, tier } = useSubscription();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<string>("all");
  const [period, setPeriod] = useState<string>("month");

  const canAccess = tier === 'basic' || tier === 'business';

  useEffect(() => {
    if (user && canAccess) {
      fetchData();
    }
  }, [user, canAccess, selectedBusiness]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch expenses
      let expenseQuery = supabase
        .from('expenses')
        .select('category, type, amount, date')
        .eq('user_id', user.id);
      
      if (selectedBusiness !== 'all') {
        expenseQuery = expenseQuery.eq('business_id', selectedBusiness);
      }
      
      const { data: expenseData, error: expenseError } = await expenseQuery;
      if (expenseError) throw expenseError;
      setExpenses(expenseData || []);

      // Fetch invoices for income
      let invoiceQuery = supabase
        .from('invoices')
        .select('total, status, issued_date, paid_date')
        .eq('user_id', user.id)
        .eq('status', 'paid');
      
      if (selectedBusiness !== 'all') {
        invoiceQuery = invoiceQuery.eq('business_id', selectedBusiness);
      }
      
      const { data: invoiceData, error: invoiceError } = await invoiceQuery;
      if (invoiceError) throw invoiceError;
      setInvoices(invoiceData || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodDates = () => {
    const now = new Date();
    switch (period) {
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'quarter':
        const quarterStart = startOfMonth(subMonths(now, 2));
        return { start: quarterStart, end: endOfMonth(now) };
      case 'year':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'all':
      default:
        return { start: new Date(2000, 0, 1), end: now };
    }
  };

  const periodData = useMemo<PeriodData>(() => {
    const { start, end } = getPeriodDates();
    
    // Filter and sum income from paid invoices
    const periodInvoices = invoices.filter(inv => {
      const date = new Date(inv.paid_date || inv.issued_date);
      return date >= start && date <= end;
    });
    const income = periodInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);

    // Filter and categorize expenses
    const periodExpenses = expenses.filter(exp => {
      const date = new Date(exp.date);
      return date >= start && date <= end;
    });
    
    const totalExpenses = periodExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    
    const byCategory: Record<string, number> = {};
    periodExpenses.forEach(exp => {
      byCategory[exp.category] = (byCategory[exp.category] || 0) + Number(exp.amount);
    });

    const grossProfit = income;
    const netProfit = income - totalExpenses;

    return {
      income,
      expenses: totalExpenses,
      grossProfit,
      netProfit,
      byCategory,
    };
  }, [expenses, invoices, period]);

  const profitMargin = periodData.income > 0 
    ? ((periodData.netProfit / periodData.income) * 100).toFixed(1)
    : '0.0';

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-background">
        <NavMenu />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto text-center p-8">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Profit & Loss Statement</h2>
            <p className="text-muted-foreground mb-6">
              Auto-generate P&L statements from your expense and invoice data. Available on Professional and Business plans.
            </p>
            <Button onClick={() => navigate('/pricing')}>Upgrade to Access</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavMenu />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Profit & Loss Statement</h1>
            <p className="text-muted-foreground">Financial performance overview</p>
          </div>
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            {savedBusinesses.length > 0 && (
              <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Businesses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Businesses</SelectItem>
                  {savedBusinesses.map((business: any) => (
                    <SelectItem key={business.id} value={business.id}>
                      {business.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading financial data...</div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Total Revenue
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(periodData.income)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    Total Expenses
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(periodData.expenses)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    Net Profit
                  </div>
                  <div className={`text-2xl font-bold ${periodData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(periodData.netProfit)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">Profit Margin</div>
                  <div className="text-2xl font-bold">
                    {profitMargin}%
                  </div>
                  <Badge variant={Number(profitMargin) >= 20 ? "default" : "secondary"} className="mt-1">
                    {Number(profitMargin) >= 20 ? 'Healthy' : 'Needs Attention'}
                  </Badge>
                </CardContent>
              </Card>
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
                  {/* Revenue Section */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Revenue
                    </h3>
                    <div className="ml-6 space-y-2">
                      <div className="flex justify-between py-2 border-b">
                        <span>Invoice Revenue (Paid)</span>
                        <span className="font-medium">{formatCurrency(periodData.income)}</span>
                      </div>
                      <div className="flex justify-between py-2 font-bold">
                        <span>Total Revenue</span>
                        <span className="text-green-600">{formatCurrency(periodData.income)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expenses Section */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-red-500" />
                      Operating Expenses
                    </h3>
                    <div className="ml-6 space-y-2">
                      {Object.entries(periodData.byCategory).map(([category, amount]) => (
                        <div key={category} className="flex justify-between py-2 border-b">
                          <span className="capitalize">{category.replace('_', ' ')}</span>
                          <span className="font-medium">{formatCurrency(amount)}</span>
                        </div>
                      ))}
                      {Object.keys(periodData.byCategory).length === 0 && (
                        <div className="text-muted-foreground py-2">No expenses recorded</div>
                      )}
                      <div className="flex justify-between py-2 font-bold">
                        <span>Total Expenses</span>
                        <span className="text-red-600">{formatCurrency(periodData.expenses)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Profit */}
                  <div className="border-t-2 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold">Net Profit / (Loss)</span>
                      <span className={`text-2xl font-bold ${periodData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(periodData.netProfit)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="mt-6">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Improve Your P&L</h4>
                    <p className="text-sm text-muted-foreground">
                      For more accurate statements, create invoices for all income and log all business expenses. 
                      Connect your bank for automatic transaction import.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfitLoss;