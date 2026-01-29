import { useState, useRef, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { useSubscription, SavedBusiness } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload, FileSpreadsheet, Crown, Building2, Check, X, HelpCircle, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { safeSessionStorage } from "@/lib/safeStorage";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: 'income' | 'expense' | 'vatable_income' | 'vatable_expense';
  auto: boolean;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2024-12-01', description: 'Client Payment - ABC Corp', amount: 2500000, category: 'income', auto: true },
  { id: '2', date: '2024-12-03', description: 'Office Rent Payment', amount: 350000, category: 'expense', auto: true },
  { id: '3', date: '2024-12-05', description: 'VAT Sales - Product A', amount: 1800000, category: 'vatable_income', auto: true },
  { id: '4', date: '2024-12-07', description: 'Equipment Purchase', amount: 450000, category: 'vatable_expense', auto: true },
  { id: '5', date: '2024-12-10', description: 'Consulting Fee Received', amount: 800000, category: 'income', auto: true },
  { id: '6', date: '2024-12-12', description: 'Utility Bills', amount: 85000, category: 'expense', auto: true },
  { id: '7', date: '2024-12-15', description: 'Software Subscription', amount: 150000, category: 'vatable_expense', auto: true },
];

const Transactions = () => {
  const { tier, savedBusinesses } = useSubscription();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const canAccess = tier === 'business' || tier === 'corporate';

  // Reset selected business if it no longer exists
  useEffect(() => {
    if (selectedBusinessId && !savedBusinesses.find(b => b.id === selectedBusinessId)) {
      setSelectedBusinessId('');
      setTransactions([]);
    }
  }, [savedBusinesses, selectedBusinessId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    setTimeout(() => {
      setTransactions(MOCK_TRANSACTIONS);
      setIsProcessing(false);
      toast.success('Bank statement imported', {
        description: `${MOCK_TRANSACTIONS.length} transactions categorized`
      });
    }, 1500);
  };

  const updateCategory = (id: string, category: Transaction['category']) => {
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, category, auto: false } : t)
    );
  };

  const getTotals = () => {
    const income = transactions
      .filter(t => t.category === 'income' || t.category === 'vatable_income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.category === 'expense' || t.category === 'vatable_expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const vatableIncome = transactions
      .filter(t => t.category === 'vatable_income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const vatableExpenses = transactions
      .filter(t => t.category === 'vatable_expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expenses, vatableIncome, vatableExpenses };
  };

  const applyToCalculator = () => {
    const totals = getTotals();
    safeSessionStorage.setJSON('imported_transactions', {
      businessId: selectedBusinessId,
      turnover: totals.income,
      expenses: totals.expenses,
      vatableSales: totals.vatableIncome,
      vatablePurchases: totals.vatableExpenses,
    });
    toast.success('Transactions applied to calculator');
    navigate('/calculator');
  };

  if (!canAccess) {
    return (
      <PageLayout title="Bank Statement Import" icon={FileSpreadsheet} maxWidth="2xl">
        <Card className="text-center glass-frosted shadow-futuristic">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4 animate-float glow-sm">
              <FileSpreadsheet className="w-8 h-8 text-accent" />
            </div>
            <CardTitle className="text-2xl">Bank Statement Import</CardTitle>
            <CardDescription>
              Import bank statements to auto-categorize transactions and populate your tax calculator
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 text-left">
              <div className="flex items-center gap-3 p-3 glass rounded-lg hover-lift stagger-1">
                <Upload className="w-5 h-5 text-primary" />
                <span>Upload CSV from your bank</span>
              </div>
              <div className="flex items-center gap-3 p-3 glass rounded-lg hover-lift stagger-2">
                <Check className="w-5 h-5 text-primary" />
                <span>AI auto-categorizes income & expenses</span>
              </div>
              <div className="flex items-center gap-3 p-3 glass rounded-lg hover-lift stagger-3">
                <ArrowRight className="w-5 h-5 text-primary" />
                <span>One-click populate tax calculator</span>
              </div>
            </div>
            <div className="p-4 glass rounded-lg text-left">
              <div className="flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  This feature requires a Business or Corporate plan.
                </p>
              </div>
            </div>
            <Link to="/pricing">
              <Button className="w-full bg-gradient-primary hover:opacity-90 glow-sm">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Import Statements
              </Button>
            </Link>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const totals = getTotals();

  return (
    <PageLayout 
      title="Bank Import" 
      icon={FileSpreadsheet}
      description="Import bank statements and auto-categorize transactions"
      maxWidth="6xl"
    >
      {/* Upload Section */}
      <Card className="mb-6 glass-frosted">
        <CardHeader>
          <CardTitle>Upload Bank Statement</CardTitle>
          <CardDescription>
            Upload a CSV export from your bank to auto-categorize transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="space-y-2">
                <Label htmlFor="business">Select Business</Label>
                <Select value={selectedBusinessId} onValueChange={setSelectedBusinessId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a business" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedBusinesses.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-end">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing || !selectedBusinessId}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isProcessing ? "Processing..." : "Upload CSV"}
              </Button>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
            <p className="text-sm text-muted-foreground">
              This is a prototype feature. Real bank integration coming soon.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      {transactions.length > 0 && (
        <>
          <Card className="mb-6 glass-frosted">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Imported Transactions</CardTitle>
                  <CardDescription>{transactions.length} transactions found</CardDescription>
                </div>
                <Badge variant="outline">{transactions.filter(t => t.auto).length} auto-categorized</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-6 px-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-center">Auto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map(txn => (
                      <TableRow key={txn.id}>
                        <TableCell className="whitespace-nowrap">{txn.date}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{txn.description}</TableCell>
                        <TableCell className={`text-right font-mono ${
                          txn.category.includes('income') ? 'text-success' : 'text-destructive'
                        }`}>
                          {txn.category.includes('income') ? '+' : '-'}₦{txn.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={txn.category} 
                            onValueChange={(v) => updateCategory(txn.id, v as Transaction['category'])}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="income">Income</SelectItem>
                              <SelectItem value="expense">Expense</SelectItem>
                              <SelectItem value="vatable_income">VATable Income</SelectItem>
                              <SelectItem value="vatable_expense">VATable Expense</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-center">
                          {txn.auto ? (
                            <Tooltip>
                              <TooltipTrigger>
                                <Check className="w-4 h-4 text-success mx-auto" />
                              </TooltipTrigger>
                              <TooltipContent>Auto-categorized</TooltipContent>
                            </Tooltip>
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground mx-auto" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="mb-6 glass-frosted">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 glass rounded-lg hover-lift glow-sm border-success/20">
                  <p className="text-sm text-muted-foreground">Total Income</p>
                  <p className="text-2xl font-bold text-success">₦{totals.income.toLocaleString()}</p>
                </div>
                <div className="p-4 glass rounded-lg hover-lift border-destructive/20">
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold text-destructive">₦{totals.expenses.toLocaleString()}</p>
                </div>
                <div className="p-4 glass rounded-lg hover-lift border-accent/20">
                  <p className="text-sm text-muted-foreground">VATable Income</p>
                  <p className="text-2xl font-bold">₦{totals.vatableIncome.toLocaleString()}</p>
                </div>
                <div className="p-4 glass rounded-lg hover-lift border-accent/20">
                  <p className="text-sm text-muted-foreground">VATable Expenses</p>
                  <p className="text-2xl font-bold">₦{totals.vatableExpenses.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Apply to Calculator */}
          <Card className="glass-frosted border-primary/30 glow-sm">
            <CardContent className="flex flex-col sm:flex-row items-center justify-between p-6 gap-4">
              <div>
                <h3 className="font-semibold">Ready to Calculate?</h3>
                <p className="text-sm text-muted-foreground">
                  Apply these totals to the tax calculator
                </p>
              </div>
              <Button onClick={applyToCalculator} size="lg" className="glow-sm">
                <ArrowRight className="w-4 h-4 mr-2" />
                Apply to Calculator
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {savedBusinesses.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Saved Businesses</h3>
            <p className="text-muted-foreground mb-4">
              Save a business first to import transactions
            </p>
            <Link to="/calculator">
              <Button>Go to Calculator</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
};

export default Transactions;