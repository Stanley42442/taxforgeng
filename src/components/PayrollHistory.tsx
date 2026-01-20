import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  History, Calendar, Users, Download, Eye, Search,
  FileText, DollarSign, TrendingUp, ChevronDown
} from "lucide-react";
import { usePayrollHistory } from "@/hooks/usePayrollHistory";
import { formatCurrency } from "@/lib/taxCalculations";
import { generatePayslipPDF } from "@/lib/payslipPdfExport";
import { format } from "date-fns";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export const PayrollHistory = () => {
  const { payrollRuns, payrollEntries, isLoading } = usePayrollHistory();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [selectedRun, setSelectedRun] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  // Filter runs
  const filteredRuns = payrollRuns?.filter(run => {
    const matchesYear = filterYear === "all" || run.pay_period.startsWith(filterYear);
    return matchesYear;
  }) || [];

  // Get entries for selected run
  const selectedRunEntries = payrollEntries?.filter(e => e.payroll_run_id === selectedRun) || [];
  const selectedRunData = payrollRuns?.find(r => r.id === selectedRun);

  // Stats
  const totalRuns = payrollRuns?.length || 0;
  const totalPaid = payrollRuns?.reduce((sum, r) => sum + (r.total_net_salaries || 0), 0) || 0;

  const handleViewDetails = (runId: string) => {
    setSelectedRun(runId);
    setShowDetailsDialog(true);
  };

  const handleDownloadPayslip = async (entry: any) => {
    await generatePayslipPDF({
      employeeName: entry.employee_name,
      employeeId: entry.employee_id || "N/A",
      department: "N/A",
      payPeriod: selectedRunData?.pay_period || "",
      payDate: selectedRunData?.pay_date || "",
      result: {
        grossSalary: entry.gross_salary,
        pensionEmployee: entry.pension_employee,
        pensionEmployer: entry.pension_employer,
        nhf: entry.nhf || 0,
        paye: entry.paye,
        netSalary: entry.net_salary,
        taxableIncome: entry.taxable_income,
        rentRelief: 0,
        totalCostToCompany: entry.gross_salary + entry.pension_employer,
        overtimeAmount: entry.overtime_amount || 0,
        bonusAmount: entry.bonus_amount || 0,
        leaveDeduction: entry.leave_deduction || 0,
        breakdown: [],
      },
      companyName: "Your Company",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <History className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Payroll Runs</p>
                <p className="text-2xl font-bold">{totalRuns}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Disbursed</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Latest Period</p>
                <p className="text-2xl font-bold">
                  {payrollRuns?.[0]?.pay_period || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Payroll History
              </CardTitle>
              <CardDescription>View and manage past payroll runs</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by period..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Runs List */}
          {filteredRuns.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <History className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-1">No payroll runs found</h3>
              <p className="text-sm text-muted-foreground">
                {payrollRuns?.length === 0 
                  ? "Run your first payroll to see history" 
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {filteredRuns.map((run) => (
                  <Collapsible key={run.id}>
                    <Card>
                      <CollapsibleTrigger asChild>
                        <CardContent className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Calendar className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {format(new Date(run.pay_period + "-01"), "MMMM yyyy")}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Paid on {format(new Date(run.pay_date), "MMM d, yyyy")}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(run.total_net_salaries || 0)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {run.total_employees} employees
                                </p>
                              </div>
                              <Badge variant={run.status === "completed" ? "default" : "secondary"}>
                                {run.status}
                              </Badge>
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0 pb-4">
                          <Separator className="mb-4" />
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
                            <div>
                              <p className="text-muted-foreground">Total Gross</p>
                              <p className="font-medium">{formatCurrency(run.total_gross_salaries || 0)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total PAYE</p>
                              <p className="font-medium text-red-600">{formatCurrency(run.total_paye || 0)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total Pension</p>
                              <p className="font-medium">{formatCurrency((run.total_pension_employee || 0) + (run.total_pension_employer || 0))}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total NHF</p>
                              <p className="font-medium">{formatCurrency(run.total_nhf || 0)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total Net</p>
                              <p className="font-medium text-green-600">{formatCurrency(run.total_net_salaries || 0)}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleViewDetails(run.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Payroll Run Details - {selectedRunData && format(new Date(selectedRunData.pay_period + "-01"), "MMMM yyyy")}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRunData && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Employees</p>
                  <p className="text-xl font-bold">{selectedRunData.total_employees}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Gross</p>
                  <p className="text-xl font-bold">{formatCurrency(selectedRunData.total_gross_salaries || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total PAYE</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(selectedRunData.total_paye || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Net</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(selectedRunData.total_net_salaries || 0)}</p>
                </div>
              </div>

              {/* Entries Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead className="text-right">Pension</TableHead>
                    <TableHead className="text-right">PAYE</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedRunEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.employee_name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(entry.gross_salary)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(entry.pension_employee)}</TableCell>
                      <TableCell className="text-right text-red-600">{formatCurrency(entry.paye)}</TableCell>
                      <TableCell className="text-right text-green-600 font-medium">{formatCurrency(entry.net_salary)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" onClick={() => handleDownloadPayslip(entry)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayrollHistory;
