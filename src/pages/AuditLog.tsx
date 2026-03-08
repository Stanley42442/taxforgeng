import { useState, useMemo, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Crown, Building2, Download, Filter, FileText, Edit, Plus, Trash2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { exportAuditLogPDF, exportAuditLogCSV } from "@/lib/auditLogExport";

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

  useEffect(() => {
    if (filterBusiness !== 'all' && !savedBusinesses.find(b => b.id === filterBusiness)) {
      setFilterBusiness('all');
    }
  }, [savedBusinesses, filterBusiness]);

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

  const handleExportPDF = () => {
    exportAuditLogPDF(filteredLogs);
    toast.success('Audit log exported');
  };

  const handleExportCSV = () => {
    exportAuditLogCSV(filteredLogs);
    toast.success('Audit log exported as CSV');
  };

  if (!canAccess) {
    return (
      <PageLayout title="Audit Log & History" icon={History} maxWidth="2xl">
        <Card className="glass-frosted shadow-futuristic animate-slide-up text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 glow-sm">
              <History className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Audit Log & History</CardTitle>
            <CardDescription>
              Track all changes made to your businesses for compliance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 text-left">
              {[
                { icon: History, label: 'Complete change history per business' },
                { icon: Edit, label: 'Track who changed what and when' },
                { icon: Download, label: 'Export logs as PDF or CSV' },
                { icon: FileText, label: 'Compliance-ready documentation' },
              ].map(({ icon: Icon, label }, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 glass rounded-xl hover-lift transition-all stagger-${i + 1}`}>
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <Link to="/pricing">
              <Button className="w-full bg-gradient-primary hover:opacity-90 glow-sm">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Corporate for Audit Log
              </Button>
            </Link>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Audit Log" 
      icon={History}
      description="Track all changes for compliance and accountability"
      maxWidth="6xl"
      headerActions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="glass-frosted">
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF} className="glass-frosted">
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      }
    >
      {/* Filters */}
      <Card className="mb-6 glass-frosted">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Filter className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={filterBusiness} onValueChange={setFilterBusiness}>
              <SelectTrigger className="w-[200px] glass">
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
              <SelectTrigger className="w-[150px] glass">
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
            <Badge variant="outline" className="h-10 px-3 flex items-center glass">
              {filteredLogs.length} entries
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card className="glass-frosted shadow-futuristic animate-slide-up">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Activity History</CardTitle>
          <CardDescription className="text-sm">All recorded changes and actions</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 animate-float">
                <History className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold mb-1">No Activity Found</h3>
              <p className="text-sm text-muted-foreground">
                {filterBusiness !== 'all' || filterAction !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'Activity will appear here as you use the app'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
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
                    <TableRow key={entry.id} className="hover:bg-muted/30 transition-all">
                      <TableCell className="px-2 sm:px-4 py-2">{getActionIcon(entry.action)}</TableCell>
                      <TableCell className="px-2 sm:px-4 py-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <Badge 
                            variant="outline" 
                            className={`capitalize text-[10px] sm:text-xs px-1.5 py-0.5 h-5 w-fit glass ${
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
    </PageLayout>
  );
};

export default AuditLog;
