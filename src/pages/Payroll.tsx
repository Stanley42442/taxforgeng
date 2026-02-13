import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { PayrollCalculator } from "@/components/PayrollCalculator";
import { BulkPayrollCalculator } from "@/components/BulkPayrollCalculator";
import { EmployeeDatabase } from "@/components/EmployeeDatabase";
import { LeaveManagement } from "@/components/LeaveManagement";
import { PayrollHistory } from "@/components/PayrollHistory";
import { PayrollAnalyticsDashboard } from "@/components/PayrollAnalyticsDashboard";
import { OvertimeBonusCalculator } from "@/components/OvertimeBonusCalculator";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Users, Calculator, History, BarChart3, 
  CalendarDays, Clock, UserPlus, FileSpreadsheet,
  Building2, Plus, Trash2
} from "lucide-react";

// Employer Cost Calculator Component
const EmployerCostCalculator = () => {
  const [salaries, setSalaries] = useState<{ id: number; gross: number }[]>([{ id: 1, gross: 0 }]);

  const addSalary = () => setSalaries(prev => [...prev, { id: Date.now(), gross: 0 }]);
  const removeSalary = (id: number) => setSalaries(prev => prev.filter(s => s.id !== id));
  const updateSalary = (id: number, gross: number) => setSalaries(prev => prev.map(s => s.id === id ? { ...s, gross } : s));

  const calculateCost = (gross: number) => {
    if (gross <= 0) return null;
    const pensionEmployee = gross * 0.08;
    const pensionEmployer = gross * 0.10;
    const nsitf = gross * 0.01;
    const itf = gross * 0.01;
    const nhf = gross * 0.025;
    const totalEmployerCost = gross + pensionEmployer + nsitf + itf;
    
    // Simple net pay estimate (PIT + pension + NHF)
    // Using simplified progressive tax for display
    const taxableIncome = gross - pensionEmployee - nhf;
    let pit = 0;
    const bands = [
      { limit: 800000, rate: 0 },
      { limit: 3000000, rate: 0.15 },
      { limit: 12000000, rate: 0.18 },
      { limit: 25000000, rate: 0.21 },
      { limit: 50000000, rate: 0.23 },
      { limit: Infinity, rate: 0.25 },
    ];
    let remaining = Math.max(0, taxableIncome);
    let prev = 0;
    for (const band of bands) {
      if (remaining <= 0) break;
      const bandAmt = band.limit - prev;
      const taxable = Math.min(remaining, bandAmt);
      pit += taxable * band.rate;
      remaining -= taxable;
      prev = band.limit;
    }
    
    const netPay = gross - pensionEmployee - nhf - pit;

    return {
      gross,
      pensionEmployee,
      pensionEmployer,
      nsitf,
      itf,
      nhf,
      pit,
      netPay: Math.max(0, netPay),
      totalEmployerCost,
      costToCompanyRatio: gross > 0 ? ((totalEmployerCost / gross) * 100).toFixed(1) : '0',
    };
  };

  const results = salaries.map(s => ({ ...s, result: calculateCost(s.gross) }));
  const totalGross = salaries.reduce((sum, s) => sum + s.gross, 0);
  const totalCost = results.reduce((sum, r) => sum + (r.result?.totalEmployerCost || 0), 0);

  return (
    <div className="space-y-6">
      <Card className="glass-frosted border-0 shadow-futuristic">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Employer Cost Calculator
          </CardTitle>
          <CardDescription>
            Calculate the true cost-to-company including employer pension, NSITF, and ITF contributions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {salaries.map((salary, index) => (
            <div key={salary.id} className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <Label className="text-sm font-medium">
                  {salaries.length > 1 ? `Employee ${index + 1} - ` : ''}Annual Gross Salary
                </Label>
                <CurrencyInput
                  value={salary.gross}
                  onChange={(v) => updateSalary(salary.id, v)}
                  placeholder="Enter gross salary"
                />
              </div>
              {salaries.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removeSalary(salary.id)} className="mb-0.5">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addSalary} className="gap-2">
            <Plus className="h-4 w-4" /> Add Another Salary Level
          </Button>
        </CardContent>
      </Card>

      {results.some(r => r.result) && (
        <Card className="glass-frosted border-0 shadow-futuristic animate-slide-up">
          <CardHeader>
            <CardTitle className="text-base">Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {results.map((r, i) => r.result && (
                <div key={r.id} className="space-y-3">
                  {salaries.length > 1 && (
                    <h4 className="font-medium text-sm text-muted-foreground">Employee {i + 1}</h4>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-xs text-muted-foreground">Gross Salary</p>
                      <p className="text-lg font-bold text-primary">₦{r.result.gross.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                      <p className="text-xs text-muted-foreground">Total Cost to Company</p>
                      <p className="text-lg font-bold text-accent">₦{r.result.totalEmployerCost.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                      <p className="text-xs text-muted-foreground">Employee Take-Home</p>
                      <p className="text-lg font-bold text-success">₦{Math.round(r.result.netPay).toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary">
                      <p className="text-xs text-muted-foreground">Cost Ratio</p>
                      <p className="text-lg font-bold">{r.result.costToCompanyRatio}%</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground">Employer Pension (10%)</p>
                      <p className="font-medium">₦{r.result.pensionEmployer.toLocaleString()}</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground">Employee Pension (8%)</p>
                      <p className="font-medium">₦{r.result.pensionEmployee.toLocaleString()}</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground">NSITF (1%)</p>
                      <p className="font-medium">₦{r.result.nsitf.toLocaleString()}</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground">ITF (1%)</p>
                      <p className="font-medium">₦{r.result.itf.toLocaleString()}</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground">PAYE (est.)</p>
                      <p className="font-medium">₦{Math.round(r.result.pit).toLocaleString()}</p>
                    </div>
                  </div>
                  {salaries.length > 1 && i < results.length - 1 && <hr className="border-border" />}
                </div>
              ))}

              {salaries.length > 1 && totalGross > 0 && (
                <div className="pt-4 border-t border-border">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <p className="text-sm text-muted-foreground">Total Gross Payroll</p>
                      <p className="text-xl font-bold text-primary">₦{totalGross.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                      <p className="text-sm text-muted-foreground">Total Cost to Company</p>
                      <p className="text-xl font-bold text-accent">₦{Math.round(totalCost).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const Payroll = () => {
  const { tier } = useSubscription();
  const [activeTab, setActiveTab] = useState("calculator");
  
  const tierOrder = ['free', 'starter', 'basic', 'professional', 'business', 'corporate'];
  const currentTierIndex = tierOrder.indexOf(tier);
  const canAccessBasic = currentTierIndex >= tierOrder.indexOf('basic');
  const canAccessProfessional = currentTierIndex >= tierOrder.indexOf('professional');
  const canAccessBusiness = currentTierIndex >= tierOrder.indexOf('business');

  if (!canAccessBasic) {
    return (
      <PageLayout 
        title="Payroll Management" 
        description="Complete payroll solution for Nigerian businesses" 
        icon={Users}
      >
        <div className="max-w-2xl mx-auto">
          <UpgradePrompt 
            feature="Payroll Management" 
            requiredTier="basic"
            showFeatures={true}
          />
        </div>
      </PageLayout>
    );
  }

  const tabs = [
    { id: "calculator", label: "Calculator", icon: Calculator, minTier: "basic", description: "Calculate PAYE for individual employees" },
    { id: "employer-cost", label: "Cost to Co.", icon: Building2, minTier: "basic", description: "Calculate total employer cost" },
    { id: "bulk", label: "Bulk Payroll", icon: FileSpreadsheet, minTier: "professional", badge: "Pro", description: "Process payroll for multiple employees" },
    { id: "employees", label: "Employees", icon: UserPlus, minTier: "professional", description: "Manage employee database" },
    { id: "overtime", label: "OT & Bonus", icon: Clock, minTier: "professional", description: "Calculate overtime and bonuses" },
    { id: "leave", label: "Leave", icon: CalendarDays, minTier: "business", badge: "Business", description: "Manage leave requests and balances" },
    { id: "history", label: "History", icon: History, minTier: "professional", description: "View past payroll runs" },
    { id: "analytics", label: "Analytics", icon: BarChart3, minTier: "business", badge: "Business", description: "Payroll insights and trends" },
  ];

  const canAccessTab = (minTier: string) => {
    return currentTierIndex >= tierOrder.indexOf(minTier);
  };

  return (
    <PageLayout 
      title="Payroll Management" 
      description="Complete payroll solution with 2026 Nigerian tax compliance" 
      icon={Users}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const accessible = canAccessTab(tab.minTier);
            
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                disabled={!accessible}
                className="flex items-center gap-2 data-[state=active]:bg-background"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.badge && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">
                    {tab.badge}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="calculator" className="space-y-4">
          <PayrollCalculator />
        </TabsContent>

        <TabsContent value="employer-cost" className="space-y-4">
          <EmployerCostCalculator />
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          {canAccessProfessional ? <BulkPayrollCalculator /> : <UpgradePrompt feature="Bulk Payroll Processing" requiredTier="professional" />}
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          {canAccessProfessional ? <EmployeeDatabase /> : <UpgradePrompt feature="Employee Database" requiredTier="professional" />}
        </TabsContent>

        <TabsContent value="overtime" className="space-y-4">
          {canAccessProfessional ? <OvertimeBonusCalculator /> : <UpgradePrompt feature="Overtime & Bonus Calculator" requiredTier="professional" />}
        </TabsContent>

        <TabsContent value="leave" className="space-y-4">
          {canAccessBusiness ? <LeaveManagement /> : <UpgradePrompt feature="Leave Management" requiredTier="business" />}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {canAccessProfessional ? <PayrollHistory /> : <UpgradePrompt feature="Payroll History" requiredTier="professional" />}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {canAccessBusiness ? <PayrollAnalyticsDashboard /> : <UpgradePrompt feature="Payroll Analytics" requiredTier="business" />}
        </TabsContent>
      </Tabs>

      <Card className="mt-6 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            2026 Nigerian Tax Quick Reference
          </CardTitle>
          <CardDescription>Current tax rates and thresholds</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs">Tax-Free Threshold</p>
              <p className="font-bold text-primary">₦800,000</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs">First Band (15%)</p>
              <p className="font-bold">₦800K - ₦3M</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs">Second Band (18%)</p>
              <p className="font-bold">₦3M - ₦12M</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs">Pension (Employee)</p>
              <p className="font-bold">8%</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground text-xs">NHF</p>
              <p className="font-bold">2.5%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default Payroll;
