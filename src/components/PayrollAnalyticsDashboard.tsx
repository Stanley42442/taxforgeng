import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, TrendingDown, Users, DollarSign, Building, 
  Calendar, Download, BarChart3, PieChart, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { usePayrollHistory } from "@/hooks/usePayrollHistory";
import { useEmployees } from "@/hooks/useEmployees";
import { formatCurrency } from "@/lib/taxCalculations";
import { ReusableAreaChart } from "@/components/ui/reusable-area-chart";
import { ReusableBarChart } from "@/components/ui/reusable-bar-chart";
import { ReusablePieChart } from "@/components/ui/reusable-pie-chart";
import { format, subMonths, startOfMonth } from "date-fns";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  subtitle?: string;
}

const MetricCard = ({ title, value, change, icon, subtitle }: MetricCardProps) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{typeof value === "number" ? formatCurrency(value) : value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              {change >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500" />
              )}
              <span className={`text-xs ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
                {change >= 0 ? "+" : ""}{change.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className="p-2 rounded-lg bg-primary/10">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export const PayrollAnalyticsDashboard = () => {
  const { payrollRuns, isLoading } = usePayrollHistory();
  const { employees } = useEmployees();
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [compareToYear, setCompareToYear] = useState(currentYear - 1);

  // Calculate analytics
  const analytics = useMemo(() => {
    if (!payrollRuns || !employees) {
      return {
        monthlyTrends: [],
        departmentMetrics: [],
        departmentDistribution: [],
        yoyComparison: [],
        totalCost: 0,
        headcount: 0,
        averageSalary: 0,
        totalPaye: 0,
        costChangePercent: 0,
        headcountChange: 0,
        avgSalaryChange: 0,
      };
    }

    // Filter runs by year
    const yearRuns = payrollRuns.filter(r => r.pay_period.startsWith(selectedYear.toString()));
    const prevYearRuns = payrollRuns.filter(r => r.pay_period.startsWith(compareToYear.toString()));

    // Monthly trends
    const months = Array.from({ length: 12 }, (_, i) => {
      const month = `${selectedYear}-${String(i + 1).padStart(2, "0")}`;
      const monthRuns = yearRuns.filter(r => r.pay_period === month);
      
      const totalGross = monthRuns.reduce((sum, r) => sum + (r.total_gross_salaries || 0), 0);
      const totalPaye = monthRuns.reduce((sum, r) => sum + (r.total_paye || 0), 0);
      const totalPension = monthRuns.reduce((sum, r) => sum + (r.total_pension_employee || 0) + (r.total_pension_employer || 0), 0);
      const totalNhf = monthRuns.reduce((sum, r) => sum + (r.total_nhf || 0), 0);
      const employeeCount = monthRuns[0]?.total_employees || 0;

      return {
        month: format(new Date(selectedYear, i), "MMM"),
        totalGross,
        totalPaye,
        totalPension,
        totalNhf,
        employeeCount,
        totalNet: monthRuns.reduce((sum, r) => sum + (r.total_net_salaries || 0), 0),
      };
    });

    // Department metrics
    const activeEmployees = employees.filter(e => e.status === "active");
    const deptGroups = activeEmployees.reduce((acc, emp) => {
      const dept = emp.department || "Unassigned";
      if (!acc[dept]) {
        acc[dept] = { employees: [], totalSalary: 0 };
      }
      acc[dept].employees.push(emp);
      acc[dept].totalSalary += emp.current_gross_salary;
      return acc;
    }, {} as Record<string, { employees: typeof activeEmployees; totalSalary: number }>);

    const departmentMetrics = Object.entries(deptGroups).map(([dept, data]) => ({
      department: dept,
      employeeCount: data.employees.length,
      totalGross: data.totalSalary,
      averageSalary: data.totalSalary / data.employees.length,
      highestSalary: Math.max(...data.employees.map(e => e.current_gross_salary)),
      lowestSalary: Math.min(...data.employees.map(e => e.current_gross_salary)),
    }));

    const totalPayroll = activeEmployees.reduce((sum, e) => sum + e.current_gross_salary, 0);
    const departmentColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
    const departmentDistribution = departmentMetrics.map((d, i) => ({
      name: d.department,
      value: d.totalGross,
      color: departmentColors[i % departmentColors.length],
    }));

    // YoY comparison
    const currentYearTotal = yearRuns.reduce((sum, r) => sum + (r.total_gross_salaries || 0), 0);
    const prevYearTotal = prevYearRuns.reduce((sum, r) => sum + (r.total_gross_salaries || 0), 0);
    const currentYearPaye = yearRuns.reduce((sum, r) => sum + (r.total_paye || 0), 0);
    const prevYearPaye = prevYearRuns.reduce((sum, r) => sum + (r.total_paye || 0), 0);

    const yoyComparison = [
      {
        metric: "Total Payroll Cost",
        currentYear: currentYearTotal,
        previousYear: prevYearTotal,
        change: currentYearTotal - prevYearTotal,
        changePercent: prevYearTotal ? ((currentYearTotal - prevYearTotal) / prevYearTotal) * 100 : 0,
      },
      {
        metric: "Total PAYE Remitted",
        currentYear: currentYearPaye,
        previousYear: prevYearPaye,
        change: currentYearPaye - prevYearPaye,
        changePercent: prevYearPaye ? ((currentYearPaye - prevYearPaye) / prevYearPaye) * 100 : 0,
      },
      {
        metric: "Average Headcount",
        currentYear: yearRuns.length ? yearRuns.reduce((sum, r) => sum + (r.total_employees || 0), 0) / yearRuns.length : 0,
        previousYear: prevYearRuns.length ? prevYearRuns.reduce((sum, r) => sum + (r.total_employees || 0), 0) / prevYearRuns.length : 0,
        change: 0,
        changePercent: 0,
      },
    ];

    // Calculate month-over-month changes
    const lastMonth = months[months.length - 1];
    const prevMonth = months[months.length - 2];
    
    return {
      monthlyTrends: months,
      departmentMetrics,
      departmentDistribution,
      yoyComparison,
      totalCost: totalPayroll,
      headcount: activeEmployees.length,
      averageSalary: activeEmployees.length ? totalPayroll / activeEmployees.length : 0,
      totalPaye: currentYearPaye,
      costChangePercent: prevMonth?.totalGross ? ((lastMonth?.totalGross || 0) - prevMonth.totalGross) / prevMonth.totalGross * 100 : 0,
      headcountChange: 0,
      avgSalaryChange: 0,
    };
  }, [payrollRuns, employees, selectedYear, compareToYear]);

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Payroll Analytics
          </h2>
          <p className="text-muted-foreground">Insights into your payroll data</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v, 10))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Monthly Payroll Cost"
          value={analytics.totalCost}
          change={analytics.costChangePercent}
          icon={<DollarSign className="h-5 w-5 text-primary" />}
        />
        <MetricCard
          title="Active Employees"
          value={analytics.headcount.toString()}
          icon={<Users className="h-5 w-5 text-primary" />}
        />
        <MetricCard
          title="Average Salary"
          value={analytics.averageSalary}
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
        />
        <MetricCard
          title="Total PAYE (YTD)"
          value={analytics.totalPaye}
          icon={<Building className="h-5 w-5 text-primary" />}
        />
      </div>

      {/* Monthly Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Payroll Costs</CardTitle>
          <CardDescription>Breakdown of payroll expenses over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ReusableAreaChart
              data={analytics.monthlyTrends}
              xAxisKey="month"
              series={[
                { dataKey: "totalGross", name: "Gross Salaries", color: "hsl(var(--primary))" },
                { dataKey: "totalPaye", name: "PAYE", color: "hsl(var(--destructive))" },
                { dataKey: "totalPension", name: "Pension", color: "hsl(var(--success))" },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Department Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Average Salary by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ReusableBarChart
                data={analytics.departmentMetrics}
                xAxisKey="department"
                bars={[{ dataKey: "averageSalary", name: "Avg Salary", color: "hsl(var(--primary))" }]}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payroll Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ReusablePieChart
                data={analytics.departmentDistribution}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Department Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Employees</TableHead>
                <TableHead className="text-right">Total Payroll</TableHead>
                <TableHead className="text-right">Average Salary</TableHead>
                <TableHead className="text-right">Highest</TableHead>
                <TableHead className="text-right">Lowest</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.departmentMetrics.map(dept => (
                <TableRow key={dept.department}>
                  <TableCell className="font-medium">{dept.department}</TableCell>
                  <TableCell className="text-right">{dept.employeeCount}</TableCell>
                  <TableCell className="text-right">{formatCurrency(dept.totalGross)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(dept.averageSalary)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(dept.highestSalary)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(dept.lowestSalary)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Year-over-Year Comparison */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Year-over-Year Comparison</CardTitle>
            <Select value={compareToYear.toString()} onValueChange={(v) => setCompareToYear(parseInt(v, 10))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.filter(y => y !== selectedYear).map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead className="text-right">{selectedYear}</TableHead>
                <TableHead className="text-right">{compareToYear}</TableHead>
                <TableHead className="text-right">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.yoyComparison.map(row => (
                <TableRow key={row.metric}>
                  <TableCell className="font-medium">{row.metric}</TableCell>
                  <TableCell className="text-right">
                    {row.metric.includes("Headcount") ? row.currentYear.toFixed(0) : formatCurrency(row.currentYear)}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.metric.includes("Headcount") ? row.previousYear.toFixed(0) : formatCurrency(row.previousYear)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={row.changePercent >= 0 ? "default" : "destructive"}>
                      {row.changePercent >= 0 ? "+" : ""}{row.changePercent.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollAnalyticsDashboard;
