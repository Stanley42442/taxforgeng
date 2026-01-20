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
import { 
  Users, Calculator, History, BarChart3, 
  CalendarDays, Clock, UserPlus, FileSpreadsheet 
} from "lucide-react";

const Payroll = () => {
  const { tier } = useSubscription();
  const [activeTab, setActiveTab] = useState("calculator");
  
  const tierOrder = ['free', 'starter', 'basic', 'professional', 'business', 'corporate'];
  const currentTierIndex = tierOrder.indexOf(tier);
  const canAccessBasic = currentTierIndex >= tierOrder.indexOf('basic');
  const canAccessProfessional = currentTierIndex >= tierOrder.indexOf('professional');
  const canAccessBusiness = currentTierIndex >= tierOrder.indexOf('business');

  // Basic tier can access single calculator, Professional+ for full features
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
    { 
      id: "calculator", 
      label: "Calculator", 
      icon: Calculator, 
      minTier: "basic",
      description: "Calculate PAYE for individual employees"
    },
    { 
      id: "bulk", 
      label: "Bulk Payroll", 
      icon: FileSpreadsheet, 
      minTier: "professional",
      badge: "Pro",
      description: "Process payroll for multiple employees"
    },
    { 
      id: "employees", 
      label: "Employees", 
      icon: UserPlus, 
      minTier: "professional",
      description: "Manage employee database"
    },
    { 
      id: "overtime", 
      label: "OT & Bonus", 
      icon: Clock, 
      minTier: "professional",
      description: "Calculate overtime and bonuses"
    },
    { 
      id: "leave", 
      label: "Leave", 
      icon: CalendarDays, 
      minTier: "business",
      badge: "Business",
      description: "Manage leave requests and balances"
    },
    { 
      id: "history", 
      label: "History", 
      icon: History, 
      minTier: "professional",
      description: "View past payroll runs"
    },
    { 
      id: "analytics", 
      label: "Analytics", 
      icon: BarChart3, 
      minTier: "business",
      badge: "Business",
      description: "Payroll insights and trends"
    },
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

        {/* Single Employee Calculator - Basic+ */}
        <TabsContent value="calculator" className="space-y-4">
          <PayrollCalculator />
        </TabsContent>

        {/* Bulk Payroll - Professional+ */}
        <TabsContent value="bulk" className="space-y-4">
          {canAccessProfessional ? (
            <BulkPayrollCalculator />
          ) : (
            <UpgradePrompt 
              feature="Bulk Payroll Processing" 
              requiredTier="professional" 
            />
          )}
        </TabsContent>

        {/* Employee Database - Professional+ */}
        <TabsContent value="employees" className="space-y-4">
          {canAccessProfessional ? (
            <EmployeeDatabase />
          ) : (
            <UpgradePrompt 
              feature="Employee Database" 
              requiredTier="professional" 
            />
          )}
        </TabsContent>

        {/* Overtime & Bonus Calculator - Professional+ */}
        <TabsContent value="overtime" className="space-y-4">
          {canAccessProfessional ? (
            <OvertimeBonusCalculator />
          ) : (
            <UpgradePrompt 
              feature="Overtime & Bonus Calculator" 
              requiredTier="professional" 
            />
          )}
        </TabsContent>

        {/* Leave Management - Business+ */}
        <TabsContent value="leave" className="space-y-4">
          {canAccessBusiness ? (
            <LeaveManagement />
          ) : (
            <UpgradePrompt 
              feature="Leave Management" 
              requiredTier="business" 
            />
          )}
        </TabsContent>

        {/* Payroll History - Professional+ */}
        <TabsContent value="history" className="space-y-4">
          {canAccessProfessional ? (
            <PayrollHistory />
          ) : (
            <UpgradePrompt 
              feature="Payroll History" 
              requiredTier="professional" 
            />
          )}
        </TabsContent>

        {/* Analytics Dashboard - Business+ */}
        <TabsContent value="analytics" className="space-y-4">
          {canAccessBusiness ? (
            <PayrollAnalyticsDashboard />
          ) : (
            <UpgradePrompt 
              feature="Payroll Analytics" 
              requiredTier="business" 
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Reference Card */}
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
