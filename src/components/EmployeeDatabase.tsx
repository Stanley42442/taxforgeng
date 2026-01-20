import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, Plus, Search, Edit, Trash2, Download, Upload, 
  UserPlus, Building, DollarSign, Calendar, Mail, Phone,
  TrendingUp, MoreHorizontal, History, FileText, AlertCircle
} from "lucide-react";
import { useEmployees, type Employee, type NewEmployee } from "@/hooks/useEmployees";
import { formatCurrency } from "@/lib/taxCalculations";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DEPARTMENTS = [
  "Executive", "Finance", "Human Resources", "IT", "Marketing", 
  "Operations", "Sales", "Engineering", "Legal", "Admin", "Other"
];

const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full-Time" },
  { value: "part_time", label: "Part-Time" },
  { value: "contract", label: "Contract" },
  { value: "intern", label: "Intern" },
];

const BANKS = [
  "Access Bank", "Citibank", "Ecobank", "Fidelity Bank", "First Bank",
  "First City Monument Bank", "Guaranty Trust Bank", "Heritage Bank",
  "Keystone Bank", "Polaris Bank", "Stanbic IBTC", "Standard Chartered",
  "Sterling Bank", "Union Bank", "United Bank for Africa", "Unity Bank",
  "Wema Bank", "Zenith Bank"
];

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  currentGrossSalary: number;
  employmentType: string;
  hireDate: string;
  includeNhf: boolean;
  bankName: string;
  bankAccountNumber: string;
  pfaName: string;
  pensionPin: string;
  taxId: string;
  nhfNumber: string;
}

const initialFormData: EmployeeFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  position: "",
  department: "",
  currentGrossSalary: 0,
  employmentType: "full_time",
  hireDate: format(new Date(), "yyyy-MM-dd"),
  includeNhf: true,
  bankName: "",
  bankAccountNumber: "",
  pfaName: "",
  pensionPin: "",
  taxId: "",
  nhfNumber: "",
};

export const EmployeeDatabase = () => {
  const { employees, isLoading, createEmployee, updateEmployee, deleteEmployee, updateSalary } = useEmployees();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("active");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSalaryDialogOpen, setIsSalaryDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [newSalary, setNewSalary] = useState<number>(0);
  const [salaryChangeReason, setSalaryChangeReason] = useState("");

  // Filter employees
  const filteredEmployees = employees?.filter(emp => {
    const matchesSearch = 
      emp.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = filterDepartment === "all" || emp.department === filterDepartment;
    const matchesStatus = filterStatus === "all" || emp.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  }) || [];

  // Stats
  const totalEmployees = employees?.filter(e => e.status === "active").length || 0;
  const totalPayroll = employees?.filter(e => e.status === "active").reduce((sum, e) => sum + e.current_gross_salary, 0) || 0;
  const avgSalary = totalEmployees > 0 ? totalPayroll / totalEmployees : 0;
  const departmentCounts = employees?.reduce((acc, e) => {
    if (e.status === "active" && e.department) {
      acc[e.department] = (acc[e.department] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  const handleAddEmployee = async () => {
    if (!formData.firstName || !formData.lastName || formData.currentGrossSalary <= 0) {
      toast.error("Please fill in required fields");
      return;
    }

    const newEmployee: NewEmployee = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      position: formData.position || undefined,
      department: formData.department || undefined,
      current_gross_salary: formData.currentGrossSalary,
      employment_type: formData.employmentType,
      hire_date: formData.hireDate || undefined,
      include_nhf: formData.includeNhf,
      bank_name: formData.bankName || undefined,
      bank_account_number: formData.bankAccountNumber || undefined,
      pfa_name: formData.pfaName || undefined,
      pension_pin: formData.pensionPin || undefined,
      tax_id: formData.taxId || undefined,
      nhf_number: formData.nhfNumber || undefined,
    };

    await createEmployee(newEmployee);
    setFormData(initialFormData);
    setIsAddDialogOpen(false);
  };

  const handleEditEmployee = async () => {
    if (!selectedEmployee) return;

    await updateEmployee(selectedEmployee.id, {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      position: formData.position || undefined,
      department: formData.department || undefined,
      employment_type: formData.employmentType,
      include_nhf: formData.includeNhf,
      bank_name: formData.bankName || undefined,
      bank_account_number: formData.bankAccountNumber || undefined,
      pfa_name: formData.pfaName || undefined,
      pension_pin: formData.pensionPin || undefined,
      tax_id: formData.taxId || undefined,
      nhf_number: formData.nhfNumber || undefined,
    });
    setIsEditDialogOpen(false);
    setSelectedEmployee(null);
  };

  const handleSalaryUpdate = async () => {
    if (!selectedEmployee || newSalary <= 0) return;

    await updateSalary(selectedEmployee.id, newSalary, salaryChangeReason);
    setIsSalaryDialogOpen(false);
    setSelectedEmployee(null);
    setNewSalary(0);
    setSalaryChangeReason("");
  };

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      firstName: employee.first_name,
      lastName: employee.last_name,
      email: employee.email || "",
      phone: employee.phone || "",
      position: employee.position || "",
      department: employee.department || "",
      currentGrossSalary: employee.current_gross_salary,
      employmentType: employee.employment_type || "full_time",
      hireDate: employee.hire_date || "",
      includeNhf: employee.include_nhf ?? true,
      bankName: employee.bank_name || "",
      bankAccountNumber: employee.bank_account_number || "",
      pfaName: employee.pfa_name || "",
      pensionPin: employee.pension_pin || "",
      taxId: employee.tax_id || "",
      nhfNumber: employee.nhf_number || "",
    });
    setIsEditDialogOpen(true);
  };

  const openSalaryDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setNewSalary(employee.current_gross_salary);
    setIsSalaryDialogOpen(true);
  };

  const EmployeeForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="employment">Employment</TabsTrigger>
        <TabsTrigger value="banking">Banking & Tax</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>First Name *</Label>
            <Input
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="John"
            />
          </div>
          <div>
            <Label>Last Name *</Label>
            <Input
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Doe"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john.doe@company.com"
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+234 XXX XXX XXXX"
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="employment" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Position</Label>
            <Input
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="Software Engineer"
            />
          </div>
          <div>
            <Label>Department</Label>
            <Select value={formData.department} onValueChange={(v) => setFormData({ ...formData, department: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Employment Type</Label>
            <Select value={formData.employmentType} onValueChange={(v) => setFormData({ ...formData, employmentType: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Hire Date</Label>
            <Input
              type="date"
              value={formData.hireDate}
              onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
            />
          </div>
        </div>
        {!isEdit && (
          <div>
            <Label>Monthly Gross Salary (₦) *</Label>
            <Input
              type="number"
              value={formData.currentGrossSalary || ""}
              onChange={(e) => setFormData({ ...formData, currentGrossSalary: Number(e.target.value) })}
              placeholder="500000"
            />
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <Label>Include NHF</Label>
            <p className="text-xs text-muted-foreground">2.5% National Housing Fund</p>
          </div>
          <Switch 
            checked={formData.includeNhf} 
            onCheckedChange={(v) => setFormData({ ...formData, includeNhf: v })} 
          />
        </div>
      </TabsContent>

      <TabsContent value="banking" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Bank Name</Label>
            <Select value={formData.bankName} onValueChange={(v) => setFormData({ ...formData, bankName: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select bank" />
              </SelectTrigger>
              <SelectContent>
                {BANKS.map(bank => (
                  <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Account Number</Label>
            <Input
              value={formData.bankAccountNumber}
              onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
              placeholder="0123456789"
              maxLength={10}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>PFA Name</Label>
            <Input
              value={formData.pfaName}
              onChange={(e) => setFormData({ ...formData, pfaName: e.target.value })}
              placeholder="ARM Pension Managers"
            />
          </div>
          <div>
            <Label>Pension PIN</Label>
            <Input
              value={formData.pensionPin}
              onChange={(e) => setFormData({ ...formData, pensionPin: e.target.value })}
              placeholder="PEN123456789"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Tax ID (TIN)</Label>
            <Input
              value={formData.taxId}
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              placeholder="12345678-0001"
            />
          </div>
          <div>
            <Label>NHF Number</Label>
            <Input
              value={formData.nhfNumber}
              onChange={(e) => setFormData({ ...formData, nhfNumber: e.target.value })}
              placeholder="NHF123456"
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Employees</p>
                <p className="text-2xl font-bold">{totalEmployees}</p>
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
                <p className="text-sm text-muted-foreground">Monthly Payroll</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPayroll)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Salary</p>
                <p className="text-2xl font-bold">{formatCurrency(avgSalary)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Building className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold">{Object.keys(departmentCounts).length}</p>
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
                <Users className="h-5 w-5" />
                Employee Database
              </CardTitle>
              <CardDescription>Manage your employees and their payroll information</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                </DialogHeader>
                <EmployeeForm />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddEmployee}>Add Employee</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {DEPARTMENTS.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium mb-1">No employees found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {employees?.length === 0 ? "Add your first employee to get started" : "Try adjusting your filters"}
              </p>
              {employees?.length === 0 && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add First Employee
                </Button>
              )}
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Gross Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                          <p className="text-sm text-muted-foreground">{employee.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{employee.position || "-"}</TableCell>
                      <TableCell>{employee.department || "-"}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(employee.current_gross_salary)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(employee)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openSalaryDialog(employee)}>
                              <DollarSign className="h-4 w-4 mr-2" />
                              Update Salary
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <History className="h-4 w-4 mr-2" />
                              Salary History
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              View Payslips
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => deleteEmployee(employee.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <EmployeeForm isEdit />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditEmployee}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Salary Update Dialog */}
      <Dialog open={isSalaryDialogOpen} onOpenChange={setIsSalaryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Salary</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedEmployee.first_name} {selectedEmployee.last_name}</p>
                <p className="text-sm text-muted-foreground">Current: {formatCurrency(selectedEmployee.current_gross_salary)}</p>
              </div>
              <div>
                <Label>New Monthly Gross Salary (₦)</Label>
                <Input
                  type="number"
                  value={newSalary || ""}
                  onChange={(e) => setNewSalary(Number(e.target.value))}
                />
                {newSalary !== selectedEmployee.current_gross_salary && newSalary > 0 && (
                  <p className="text-sm mt-1">
                    <span className={newSalary > selectedEmployee.current_gross_salary ? "text-green-600" : "text-red-600"}>
                      {newSalary > selectedEmployee.current_gross_salary ? "+" : ""}
                      {formatCurrency(newSalary - selectedEmployee.current_gross_salary)}
                    </span>
                    <span className="text-muted-foreground"> change</span>
                  </p>
                )}
              </div>
              <div>
                <Label>Reason for Change</Label>
                <Input
                  value={salaryChangeReason}
                  onChange={(e) => setSalaryChangeReason(e.target.value)}
                  placeholder="e.g., Annual review, Promotion"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSalaryDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSalaryUpdate}>Update Salary</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeDatabase;
