import { useState, useMemo } from "react";
import { NavMenu } from "@/components/NavMenu";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Crown, Building2, Download, Filter, FileText, Edit, Plus, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import jsPDF from "jspdf";


interface AuditEntry {
  id: string;
  businessId: string;
  businessName: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'export';
  field?: string;
  oldValue?: string;
  newValue?: string;
  user: string;
  timestamp: Date;
}

// Mock audit log data
const MOCK_AUDIT_LOG: AuditEntry[] = [
  { id: '1', businessId: 'b1', businessName: 'Lagos Tech Hub Ltd', action: 'update', field: 'turnover', oldValue: '₦30,000,000', newValue: '₦35,000,000', user: 'owner@example.com', timestamp: new Date('2024-12-17T14:30:00') },
  { id: '2', businessId: 'b1', businessName: 'Lagos Tech Hub Ltd', action: 'export', user: 'owner@example.com', timestamp: new Date('2024-12-17T12:15:00') },
  { id: '3', businessId: 'b2', businessName: 'Adeyemi Consulting', action: 'create', user: 'owner@example.com', timestamp: new Date('2024-12-16T09:45:00') },
  { id: '4', businessId: 'b1', businessName: 'Lagos Tech Hub Ltd', action: 'update', field: 'RC Number', oldValue: 'None', newValue: 'RC1234567', user: 'editor@example.com', timestamp: new Date('2024-12-15T16:20:00') },
  { id: '5', businessId: 'b2', businessName: 'Adeyemi Consulting', action: 'view', user: 'viewer@example.com', timestamp: new Date('2024-12-15T11:00:00') },
  { id: '6', businessId: 'b3', businessName: 'Kano Trading Enterprise', action: 'delete', user: 'owner@example.com', timestamp: new Date('2024-12-14T08:30:00') },
  { id: '7', businessId: 'b1', businessName: 'Lagos Tech Hub Ltd', action: 'update', field: 'entity type', oldValue: 'Business Name', newValue: 'Limited Company', user: 'owner@example.com', timestamp: new Date('2024-12-13T17:45:00') },
];

const AuditLog = () => {
  const { tier, savedBusinesses } = useSubscription();
  const [filterBusiness, setFilterBusiness] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');

  const canAccess = tier === 'corporate';

  const filteredLogs = useMemo(() => {
    return MOCK_AUDIT_LOG.filter(entry => {
      if (filterBusiness !== 'all' && entry.businessId !== filterBusiness) return false;
      if (filterAction !== 'all' && entry.action !== filterAction) return false;
      return true;
    });
  }, [filterBusiness, filterAction]);

  const getActionIcon = (action: AuditEntry['action']) => {
    switch (action) {
      case 'create': return <Plus className="w-4 h-4 text-success" />;
      case 'update': return <Edit className="w-4 h-4 text-warning" />;
      case 'delete': return <Trash2 className="w-4 h-4 text-destructive" />;
      case 'view': return <Eye className="w-4 h-4 text-info" />;
      case 'export': return <Download className="w-4 h-4 text-primary" />;
    }
  };

  const getActionLabel = (entry: AuditEntry) => {
    switch (entry.action) {
      case 'create': return `Created ${entry.businessName}`;
      case 'update': return `Updated ${entry.field} on ${entry.businessName}`;
      case 'delete': return `Deleted ${entry.businessName}`;
      case 'view': return `Viewed ${entry.businessName}`;
      case 'export': return `Exported report for ${entry.businessName}`;
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Audit Log Export', 20, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
    
    let y = 45;
    doc.setFontSize(9);
    
    filteredLogs.forEach((entry, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      const timestamp = new Date(entry.timestamp).toLocaleString();
      doc.text(`${index + 1}. [${timestamp}] ${entry.user}`, 20, y);
      y += 5;
      doc.text(`   ${getActionLabel(entry)}`, 20, y);
      if (entry.oldValue && entry.newValue) {
        y += 5;
        doc.text(`   Changed: "${entry.oldValue}" → "${entry.newValue}"`, 20, y);
      }
      y += 10;
    });
    
    doc.save('audit-log.pdf');
    toast.success('Audit log exported');
  };

  const exportCSV = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Business', 'Field', 'Old Value', 'New Value'];
    const rows = filteredLogs.map(entry => [
      new Date(entry.timestamp).toISOString(),
      entry.user,
      entry.action,
      entry.businessName,
      entry.field || '',
      entry.oldValue || '',
      entry.newValue || ''
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-log.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Audit log exported as CSV');
  };

  // Non-corporate tier - show teaser
  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <NavMenu />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
                <History className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl">Audit Log & History</CardTitle>
              <CardDescription>
                Track all changes made to your businesses for compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3 text-left">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <History className="w-5 h-5 text-primary" />
                  <span>Complete change history per business</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Edit className="w-5 h-5 text-primary" />
                  <span>Track who changed what and when</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Download className="w-5 h-5 text-primary" />
                  <span>Export logs as PDF or CSV</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                  <span>Compliance-ready documentation</span>
                </div>
              </div>
              <Link to="/pricing">
                <Button className="w-full bg-gradient-primary hover:opacity-90">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Corporate for Audit Log
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col overflow-x-hidden">
      <NavMenu />
      
      <div className="container mx-auto px-4 py-6 pb-8 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              <History className="inline-block w-8 h-8 mr-2 text-primary" />
              Audit Log
            </h1>
            <p className="text-muted-foreground">
              Track all changes for compliance and accountability
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button variant="outline" onClick={exportPDF}>
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <Select value={filterBusiness} onValueChange={setFilterBusiness}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All businesses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Businesses</SelectItem>
                  {savedBusinesses.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Created</SelectItem>
                  <SelectItem value="update">Updated</SelectItem>
                  <SelectItem value="delete">Deleted</SelectItem>
                  <SelectItem value="view">Viewed</SelectItem>
                  <SelectItem value="export">Exported</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline" className="h-10 px-3 flex items-center">
                {filteredLogs.length} entries
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Audit Log Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Activity History</CardTitle>
            <CardDescription className="text-sm">All recorded changes and actions</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-base font-semibold mb-1">No Activity Found</h3>
                <p className="text-sm text-muted-foreground">
                  {filterBusiness !== 'all' || filterAction !== 'all' 
                    ? 'Try adjusting your filters'
                    : 'Activity will appear here as you use the app'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10 px-2 sm:px-4">Type</TableHead>
                      <TableHead className="px-2 sm:px-4">Action</TableHead>
                      <TableHead className="hidden sm:table-cell px-2 sm:px-4">User</TableHead>
                      <TableHead className="hidden md:table-cell px-2 sm:px-4">Changes</TableHead>
                      <TableHead className="text-right px-2 sm:px-4 whitespace-nowrap">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map(entry => (
                      <TableRow key={entry.id}>
                        <TableCell className="px-2 sm:px-4 py-2">{getActionIcon(entry.action)}</TableCell>
                        <TableCell className="px-2 sm:px-4 py-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <Badge 
                              variant="outline" 
                              className={`capitalize text-[10px] sm:text-xs px-1.5 py-0.5 h-5 w-fit ${
                                entry.action === 'create' ? 'bg-success/10 text-success border-success/30' :
                                entry.action === 'update' ? 'bg-warning/10 text-warning border-warning/30' :
                                entry.action === 'delete' ? 'bg-destructive/10 text-destructive border-destructive/30' :
                                entry.action === 'view' ? 'bg-info/10 text-info border-info/30' :
                                entry.action === 'export' ? 'bg-primary/10 text-primary border-primary/30' :
                                'bg-muted'
                              }`}
                            >
                              {entry.action}
                            </Badge>
                            <span className="font-medium text-sm truncate max-w-[120px] sm:max-w-none">{entry.businessName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm px-2 sm:px-4 py-2 truncate max-w-[150px]">
                          {entry.user}
                        </TableCell>
                        <TableCell className="hidden md:table-cell px-2 sm:px-4 py-2">
                          {entry.oldValue && entry.newValue ? (
                            <div className="text-xs">
                              <span className="text-muted-foreground">{entry.field}: </span>
                              <span className="line-through text-destructive/70">{entry.oldValue}</span>
                              <span className="mx-1">→</span>
                              <span className="text-success">{entry.newValue}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground px-2 sm:px-4 py-2 whitespace-nowrap">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditLog;
