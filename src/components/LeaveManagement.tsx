import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  CalendarDays, Plus, Check, X, Clock, Users, 
  CalendarCheck, CalendarX, AlertCircle, FileText,
  Settings, Filter, Download, RefreshCw
} from "lucide-react";
import { useLeaveManagement, type LeaveRequest, type LeaveType, type LeaveBalance } from "@/hooks/useLeaveManagement";
import { useEmployees } from "@/hooks/useEmployees";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { format, differenceInBusinessDays, addDays } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200",
};

const DEFAULT_LEAVE_TYPES = [
  { name: "Annual Leave", code: "AL", defaultDays: 20, color: "#3b82f6", isPaid: true },
  { name: "Sick Leave", code: "SL", defaultDays: 10, color: "#ef4444", isPaid: true },
  { name: "Maternity Leave", code: "ML", defaultDays: 84, color: "#ec4899", isPaid: true },
  { name: "Paternity Leave", code: "PL", defaultDays: 14, color: "#8b5cf6", isPaid: true },
  { name: "Compassionate Leave", code: "CL", defaultDays: 5, color: "#6b7280", isPaid: true },
  { name: "Study Leave", code: "STL", defaultDays: 10, color: "#10b981", isPaid: false },
  { name: "Unpaid Leave", code: "UL", defaultDays: 30, color: "#f59e0b", isPaid: false },
];

export const LeaveManagement = () => {
  const { 
    leaveTypes, 
    leaveRequests, 
    isLoading,
    createLeaveType,
    createLeaveRequest,
    approveRequest,
    rejectRequest,
    initializeLeaveTypes,
  } = useLeaveManagement();
  const { employees } = useEmployees();
  const { savedBusinesses } = useSubscription();

  // Filter employees by active businesses
  const activeBusinessIds = useMemo(() => 
    new Set(savedBusinesses.map(b => b.id)),
    [savedBusinesses]
  );

  const validEmployees = useMemo(() => {
    return (employees || []).filter(emp => {
      if (!emp.business_id) return true;
      return activeBusinessIds.has(emp.business_id);
    });
  }, [employees, activeBusinessIds]);
  
  const [activeTab, setActiveTab] = useState("requests");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterEmployee, setFilterEmployee] = useState<string>("all");
  
  // New request form
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [reason, setReason] = useState("");
  
  // Leave type form
  const [showLeaveTypeDialog, setShowLeaveTypeDialog] = useState(false);
  const [newLeaveType, setNewLeaveType] = useState({
    name: "",
    code: "",
    defaultDays: 0,
    color: "#3b82f6",
    isPaid: true,
    requiresApproval: true,
    canCarryOver: false,
    maxCarryOverDays: 0,
  });

  // Calculate working days
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    if (isHalfDay) return 0.5;
    return differenceInBusinessDays(endDate, startDate) + 1;
  };

  // Filter requests - only show requests for employees from active businesses
  const validEmployeeIds = useMemo(() => new Set(validEmployees.map(e => e.id)), [validEmployees]);
  
  const filteredRequests = leaveRequests?.filter(req => {
    // First filter by active business employees
    if (!validEmployeeIds.has(req.employee_id)) return false;
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    const matchesEmployee = filterEmployee === "all" || req.employee_id === filterEmployee;
    return matchesStatus && matchesEmployee;
  }) || [];

  // Handle new leave request
  const handleSubmitRequest = async () => {
    if (!selectedEmployee || !selectedLeaveType || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const totalDays = calculateDays();
    if (totalDays <= 0) {
      toast.error("Invalid date range");
      return;
    }

    createLeaveRequest.mutate({
      employeeId: selectedEmployee,
      leaveTypeId: selectedLeaveType,
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      totalDays,
      isHalfDay,
      reason,
    });

    setShowNewRequestDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedEmployee("");
    setSelectedLeaveType("");
    setStartDate(undefined);
    setEndDate(undefined);
    setIsHalfDay(false);
    setReason("");
  };

  // Initialize default leave types
  const handleInitializeDefaults = () => {
    initializeLeaveTypes.mutate();
  };

  // Stats - only count requests for employees from active businesses
  const validRequests = leaveRequests?.filter(r => validEmployeeIds.has(r.employee_id)) || [];
  const pendingCount = validRequests.filter(r => r.status === "pending").length;
  const approvedThisMonth = validRequests.filter(r => 
    r.status === "approved" && 
    r.start_date.startsWith(format(new Date(), "yyyy-MM"))
  ).length;

  const getEmployeeName = (employeeId: string) => {
    const emp = employees?.find(e => e.id === employeeId);
    return emp ? `${emp.first_name} ${emp.last_name}` : "Unknown";
  };

  const getLeaveTypeName = (leaveTypeId: string) => {
    const type = leaveTypes?.find(t => t.id === leaveTypeId);
    return type?.name || "Unknown";
  };

  const getLeaveTypeColor = (leaveTypeId: string) => {
    const type = leaveTypes?.find(t => t.id === leaveTypeId);
    return type?.color || "#6b7280";
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CalendarCheck className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved This Month</p>
                <p className="text-2xl font-bold">{approvedThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employees</p>
                <p className="text-2xl font-bold">{validEmployees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <FileText className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Leave Types</p>
                <p className="text-2xl font-bold">{leaveTypes?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Leave Management
              </CardTitle>
              <CardDescription>Manage employee leave requests and balances</CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Request
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>New Leave Request</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Employee *</Label>
                      <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {validEmployees.filter(e => e.status === "active").map(emp => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.first_name} {emp.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Leave Type *</Label>
                      <Select value={selectedLeaveType} onValueChange={setSelectedLeaveType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                        <SelectContent>
                          {leaveTypes?.filter(t => t.is_active).map(type => (
                            <SelectItem key={type.id} value={type.id}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: type.color || "#6b7280" }} 
                                />
                                {type.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Start Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                              {startDate ? format(startDate, "PPP") : "Pick date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={startDate}
                              onSelect={setStartDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label>End Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                              {endDate ? format(endDate, "PPP") : "Pick date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={endDate}
                              onSelect={setEndDate}
                              disabled={(date) => startDate ? date < startDate : false}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Half Day</Label>
                      <Switch checked={isHalfDay} onCheckedChange={setIsHalfDay} />
                    </div>

                    {startDate && endDate && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">
                          Total: <strong>{calculateDays()} working day(s)</strong>
                        </p>
                      </div>
                    )}

                    <div>
                      <Label>Reason (Optional)</Label>
                      <Textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Brief description"
                        rows={2}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewRequestDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitRequest}>Submit Request</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="requests">
                Requests
                {pendingCount > 0 && (
                  <Badge variant="secondary" className="ml-2">{pendingCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="balances">Balances</TabsTrigger>
              <TabsTrigger value="types">Leave Types</TabsTrigger>
            </TabsList>

            <TabsContent value="requests">
              {/* Filters */}
              <div className="flex gap-4 mb-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {validEmployees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Requests Table */}
              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <CalendarX className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium mb-1">No leave requests</h3>
                  <p className="text-sm text-muted-foreground">
                    {leaveRequests?.length === 0 ? "Create a new request to get started" : "No requests match your filters"}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            {getEmployeeName(request.employee_id)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: getLeaveTypeColor(request.leave_type_id) }} 
                              />
                              {getLeaveTypeName(request.leave_type_id)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{format(new Date(request.start_date), "MMM d")}</p>
                              <p className="text-muted-foreground">to {format(new Date(request.end_date), "MMM d, yyyy")}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {request.total_days} {request.is_half_day && "(½)"}
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("capitalize", STATUS_COLORS[request.status || "pending"])}>
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {request.status === "pending" && (
                              <div className="flex justify-end gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => approveRequest.mutate(request.id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => rejectRequest.mutate({ requestId: request.id, reason: "Rejected by manager" })}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="balances">
              <div className="text-center py-8 text-muted-foreground">
                <p>Leave balances are initialized when employees are assigned leave types.</p>
                <p>Use the "Leave Types" tab to configure available leave categories.</p>
              </div>
            </TabsContent>

            <TabsContent value="types">
              {leaveTypes?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium mb-1">No leave types configured</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Set up leave types to start managing leave
                  </p>
                  <Button onClick={handleInitializeDefaults}>
                    <Plus className="h-4 w-4 mr-2" />
                    Initialize Default Types
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {leaveTypes.map(type => (
                    <Card key={type.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: type.color || "#6b7280" }} 
                            />
                            <div>
                              <p className="font-medium">{type.name}</p>
                              <p className="text-xs text-muted-foreground">Code: {type.code}</p>
                            </div>
                          </div>
                          <Badge variant={type.is_paid ? "default" : "secondary"}>
                            {type.is_paid ? "Paid" : "Unpaid"}
                          </Badge>
                        </div>
                        <div className="mt-3 text-sm text-muted-foreground">
                          <p>{type.default_days_per_year} days per year</p>
                          {type.can_carry_over && (
                            <p>Carry over: up to {type.max_carry_over_days} days</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveManagement;
