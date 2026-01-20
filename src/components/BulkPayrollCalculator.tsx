import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Calculator, Users, Download, Save, Plus, Trash2, 
  FileSpreadsheet, Clock, Gift, DollarSign, AlertCircle,
  CheckCircle, Calendar, Building
} from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { usePayrollHistory } from "@/hooks/usePayrollHistory";
import { usePayrollTemplates } from "@/hooks/usePayrollTemplates";
import { calculatePayrollWithExtras, type PayrollInput, type PayrollResult } from "@/lib/payrollCalculations";
import { formatCurrency } from "@/lib/taxCalculations";
import { generatePayslipPDF } from "@/lib/payslipPdfExport";
import { toast } from "sonner";
import { format } from "date-fns";

interface EmployeePayrollEntry {
  id: string;
  employeeId?: string;
  employeeName: string;
  department?: string;
  grossSalary: number;
  includeNhf: boolean;
  overtimeHours: number;
  overtimeMultiplier: number;
  bonusAmount: number;
  bonusType: string;
  leaveDeduction: number;
  selected: boolean;
  result?: PayrollResult;
}

const OVERTIME_RATES = [
  { value: "1.5", label: "1.5x (Regular OT)" },
  { value: "2", label: "2x (Weekend/Holiday)" },
];

const BONUS_TYPES = [
  { value: "none", label: "No Bonus" },
  { value: "performance", label: "Performance" },
  { value: "13th_month", label: "13th Month" },
  { value: "holiday", label: "Holiday" },
  { value: "other", label: "Other" },
];

export const BulkPayrollCalculator = () => {
  const { employees } = useEmployees();
  const { savePayrollRun, isSaving } = usePayrollHistory();
  const { templates, saveTemplate } = usePayrollTemplates();
  
  const [use2026Rules, setUse2026Rules] = useState(true);
  const [payPeriod, setPayPeriod] = useState(format(new Date(), "yyyy-MM"));
  const [payDate, setPayDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [entries, setEntries] = useState<EmployeePayrollEntry[]>([]);
  const [isCalculated, setIsCalculated] = useState(false);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");

  // Load employees into entries
  const loadEmployees = () => {
    if (!employees || employees.length === 0) {
      toast.error("No employees found");
      return;
    }

    const activeEmployees = employees.filter(e => e.status === "active");
    setEntries(activeEmployees.map(emp => ({
      id: crypto.randomUUID(),
      employeeId: emp.id,
      employeeName: `${emp.first_name} ${emp.last_name}`,
      department: emp.department || undefined,
      grossSalary: emp.current_gross_salary,
      includeNhf: emp.include_nhf ?? true,
      overtimeHours: 0,
      overtimeMultiplier: 1.5,
      bonusAmount: 0,
      bonusType: "none",
      leaveDeduction: 0,
      selected: true,
    })));
    setIsCalculated(false);
    toast.success(`Loaded ${activeEmployees.length} employees`);
  };

  // Add manual entry
  const addManualEntry = () => {
    setEntries([...entries, {
      id: crypto.randomUUID(),
      employeeName: "",
      grossSalary: 0,
      includeNhf: true,
      overtimeHours: 0,
      overtimeMultiplier: 1.5,
      bonusAmount: 0,
      bonusType: "none",
      leaveDeduction: 0,
      selected: true,
    }]);
    setIsCalculated(false);
  };

  // Update entry
  const updateEntry = (id: string, field: keyof EmployeePayrollEntry, value: any) => {
    setEntries(entries.map(e => e.id === id ? { ...e, [field]: value, result: undefined } : e));
    setIsCalculated(false);
  };

  // Remove entry
  const removeEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
    setIsCalculated(false);
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    setEntries(entries.map(e => e.id === id ? { ...e, selected: !e.selected } : e));
  };

  // Toggle all
  const toggleAll = (selected: boolean) => {
    setEntries(entries.map(e => ({ ...e, selected })));
  };

  // Calculate payroll for all selected entries
  const calculateAll = () => {
    const selectedEntries = entries.filter(e => e.selected && e.grossSalary > 0);
    
    if (selectedEntries.length === 0) {
      toast.error("No valid entries to calculate");
      return;
    }

    const updatedEntries = entries.map(entry => {
      if (!entry.selected || entry.grossSalary <= 0) return entry;

      const input: PayrollInput = {
        grossSalary: entry.grossSalary,
        includeNhf: entry.includeNhf,
        use2026Rules,
        annualRent: 0, // Could be added per employee
        overtimeHours: entry.overtimeHours,
        overtimeMultiplier: entry.overtimeMultiplier,
        bonusAmount: entry.bonusType !== "none" ? entry.bonusAmount : 0,
        bonusIsTaxable: true,
        leaveDeductionDays: 0,
        dailyRate: entry.grossSalary / 22,
      };

      const result = calculatePayrollWithExtras(input);
      return { ...entry, result };
    });

    setEntries(updatedEntries);
    setIsCalculated(true);
    toast.success(`Calculated payroll for ${selectedEntries.length} employees`);
  };

  // Totals
  const totals = useMemo(() => {
    const calculated = entries.filter(e => e.result && e.selected);
    return {
      count: calculated.length,
      totalGross: calculated.reduce((sum, e) => sum + (e.result?.grossSalary || 0), 0),
      totalOvertime: calculated.reduce((sum, e) => sum + (e.result?.overtimeAmount || 0), 0),
      totalBonus: calculated.reduce((sum, e) => sum + (e.result?.bonusAmount || 0), 0),
      totalPension: calculated.reduce((sum, e) => sum + (e.result?.pensionEmployee || 0), 0),
      totalPensionEmployer: calculated.reduce((sum, e) => sum + (e.result?.pensionEmployer || 0), 0),
      totalNhf: calculated.reduce((sum, e) => sum + (e.result?.nhf || 0), 0),
      totalPaye: calculated.reduce((sum, e) => sum + (e.result?.paye || 0), 0),
      totalNet: calculated.reduce((sum, e) => sum + (e.result?.netSalary || 0), 0),
      totalCost: calculated.reduce((sum, e) => sum + (e.result?.totalCostToCompany || 0), 0),
    };
  }, [entries]);

  // Save payroll run
  const handleSavePayrollRun = async () => {
    const validEntries = entries.filter(e => e.selected && e.result);
    
    if (validEntries.length === 0) {
      toast.error("No calculated entries to save");
      return;
    }

    await savePayrollRun({
      payPeriod,
      payDate,
      entries: validEntries.map(e => ({
        employeeId: e.employeeId,
        employeeName: e.employeeName,
        department: e.department,
        grossSalary: e.grossSalary,
        includeNhf: e.includeNhf,
        result: e.result!,
        overtimeHours: e.overtimeHours,
        overtimeMultiplier: e.overtimeMultiplier,
        bonusAmount: e.bonusAmount,
        bonusType: e.bonusType,
      })),
    });
  };

  // Save as template
  const handleSaveTemplate = async () => {
    if (!templateName) {
      toast.error("Please enter a template name");
      return;
    }

    await saveTemplate({
      name: templateName,
      description: templateDescription,
      entries: entries.map(e => ({
        employeeId: e.employeeId,
        employeeName: e.employeeName,
        department: e.department,
        grossSalary: e.grossSalary,
        includeNhf: e.includeNhf,
      })),
    });

    setShowSaveTemplateDialog(false);
    setTemplateName("");
    setTemplateDescription("");
  };

  // Download all payslips
  const downloadAllPayslips = async () => {
    const validEntries = entries.filter(e => e.selected && e.result);
    
    for (const entry of validEntries) {
      await generatePayslipPDF({
        employeeName: entry.employeeName,
        employeeId: entry.employeeId || "N/A",
        department: entry.department || "N/A",
        payPeriod,
        payDate,
        result: entry.result!,
        companyName: "Your Company", // Could be configurable
      });
    }
    
    toast.success(`Downloaded ${validEntries.length} payslips`);
  };

  const selectedCount = entries.filter(e => e.selected).length;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Bulk Payroll Calculator
              </CardTitle>
              <CardDescription>Calculate payroll for multiple employees at once</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={loadEmployees}>
                <Users className="h-4 w-4 mr-2" />
                Load Employees
              </Button>
              <Button variant="outline" onClick={addManualEntry}>
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Pay Period</Label>
              <Input
                type="month"
                value={payPeriod}
                onChange={(e) => setPayPeriod(e.target.value)}
              />
            </div>
            <div>
              <Label>Pay Date</Label>
              <Input
                type="date"
                value={payDate}
                onChange={(e) => setPayDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <div className="flex items-center gap-2">
                <Switch checked={use2026Rules} onCheckedChange={setUse2026Rules} />
                <Label>2026 Tax Rules</Label>
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={calculateAll} className="w-full" disabled={entries.length === 0}>
                <Calculator className="h-4 w-4 mr-2" />
                Calculate All ({selectedCount})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entries Table */}
      {entries.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Payroll Entries</CardTitle>
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={entries.every(e => e.selected)}
                  onCheckedChange={(checked) => toggleAll(!!checked)}
                />
                <span className="text-sm text-muted-foreground">Select All</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Gross Salary</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        OT Hours
                      </div>
                    </TableHead>
                    <TableHead>OT Rate</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <Gift className="h-3 w-3" />
                        Bonus
                      </div>
                    </TableHead>
                    <TableHead>NHF</TableHead>
                    <TableHead className="text-right">PAYE</TableHead>
                    <TableHead className="text-right">Net Salary</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id} className={!entry.selected ? "opacity-50" : ""}>
                      <TableCell>
                        <Checkbox 
                          checked={entry.selected}
                          onCheckedChange={() => toggleSelection(entry.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {entry.employeeId ? (
                          <div>
                            <p className="font-medium">{entry.employeeName}</p>
                            <p className="text-xs text-muted-foreground">{entry.department}</p>
                          </div>
                        ) : (
                          <Input
                            value={entry.employeeName}
                            onChange={(e) => updateEntry(entry.id, "employeeName", e.target.value)}
                            placeholder="Employee name"
                            className="h-8"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={entry.grossSalary || ""}
                          onChange={(e) => updateEntry(entry.id, "grossSalary", Number(e.target.value))}
                          className="h-8 w-28"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={entry.overtimeHours || ""}
                          onChange={(e) => updateEntry(entry.id, "overtimeHours", Number(e.target.value))}
                          className="h-8 w-16"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={entry.overtimeMultiplier.toString()} 
                          onValueChange={(v) => updateEntry(entry.id, "overtimeMultiplier", Number(v))}
                        >
                          <SelectTrigger className="h-8 w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {OVERTIME_RATES.map(rate => (
                              <SelectItem key={rate.value} value={rate.value}>{rate.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Select 
                            value={entry.bonusType} 
                            onValueChange={(v) => updateEntry(entry.id, "bonusType", v)}
                          >
                            <SelectTrigger className="h-8 w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {BONUS_TYPES.map(type => (
                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {entry.bonusType !== "none" && (
                            <Input
                              type="number"
                              value={entry.bonusAmount || ""}
                              onChange={(e) => updateEntry(entry.id, "bonusAmount", Number(e.target.value))}
                              className="h-8 w-24"
                              placeholder="Amount"
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch 
                          checked={entry.includeNhf}
                          onCheckedChange={(v) => updateEntry(entry.id, "includeNhf", v)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.result ? (
                          <span className="text-red-600">{formatCurrency(entry.result.paye)}</span>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.result ? (
                          <span className="font-medium text-green-600">{formatCurrency(entry.result.netSalary)}</span>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Totals & Actions */}
      {isCalculated && (
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Payroll Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Employees</p>
                <p className="text-2xl font-bold">{totals.count}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Gross</p>
                <p className="text-xl font-bold">{formatCurrency(totals.totalGross)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total PAYE</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(totals.totalPaye)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Net</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totals.totalNet)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cost to Company</p>
                <p className="text-xl font-bold">{formatCurrency(totals.totalCost)}</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Overtime:</span>
                <span>{formatCurrency(totals.totalOvertime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bonuses:</span>
                <span>{formatCurrency(totals.totalBonus)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pension (Employee):</span>
                <span>{formatCurrency(totals.totalPension)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pension (Employer):</span>
                <span>{formatCurrency(totals.totalPensionEmployer)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">NHF:</span>
                <span>{formatCurrency(totals.totalNhf)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSavePayrollRun} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Save Payroll Run
              </Button>
              <Button variant="outline" onClick={downloadAllPayslips}>
                <Download className="h-4 w-4 mr-2" />
                Download All Payslips
              </Button>
              <Button variant="outline" onClick={() => setShowSaveTemplateDialog(true)}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Save as Template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Template Dialog */}
      <Dialog open={showSaveTemplateDialog} onOpenChange={setShowSaveTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Template Name</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Monthly Staff Payroll"
              />
            </div>
            <div>
              <Label>Description (Optional)</Label>
              <Input
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Brief description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveTemplateDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BulkPayrollCalculator;
