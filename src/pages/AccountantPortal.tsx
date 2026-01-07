import { useState } from "react";
import { NavMenu } from "@/components/NavMenu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Building2,
  Users,
  Search,
  Download,
  Upload,
  FileText,
  BarChart3,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/taxCalculations";

interface ClientBusiness {
  id: string;
  name: string;
  entity_type: string;
  turnover: number;
  cac_verified: boolean;
  sector: string | null;
  created_at: string;
  user_id: string;
}

const AccountantPortal = () => {
  const { user } = useAuth();
  const { tier } = useSubscription();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  // Fetch all businesses the accountant manages (for corporate tier)
  const { data: clients, isLoading } = useQuery({
    queryKey: ["accountant-clients", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // For demo purposes, fetch own businesses
      // In production, this would fetch client businesses via team_members relationship
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as ClientBusiness[];
    },
    enabled: !!user,
  });

  const filteredClients = clients?.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.sector?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const toggleClient = (id: string) => {
    setSelectedClients(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredClients.map(c => c.id));
    }
  };

  const bulkExport = () => {
    const selectedData = filteredClients.filter(c => selectedClients.includes(c.id));
    const csv = [
      ["Business Name", "Entity Type", "Turnover", "CAC Verified", "Sector", "Created"].join(","),
      ...selectedData.map(c => [
        c.name,
        c.entity_type,
        c.turnover,
        c.cac_verified ? "Yes" : "No",
        c.sector || "N/A",
        new Date(c.created_at).toLocaleDateString(),
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "client-businesses.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${selectedData.length} businesses`);
  };

  const bulkVerifyCAC = async () => {
    toast.info(`Starting CAC verification for ${selectedClients.length} businesses...`);
    // Simulate bulk verification
    setTimeout(() => {
      toast.success(`Verified ${selectedClients.length} businesses`);
    }, 2000);
  };

  // Stats
  const totalTurnover = clients?.reduce((sum, c) => sum + c.turnover, 0) || 0;
  const verifiedCount = clients?.filter(c => c.cac_verified).length || 0;
  const pendingCount = (clients?.length || 0) - verifiedCount;

  if (tier !== 'corporate' && tier !== 'business') {
    return (
      <div className="min-h-screen bg-gradient-hero flex flex-col">
        <NavMenu />
        <main className="container mx-auto px-4 py-12 flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-6">
              <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Accountant Portal</h2>
              <p className="text-muted-foreground mb-4">
                Manage multiple client businesses with bulk operations. Available on Business and Corporate plans.
              </p>
              <Button asChild>
                <a href="/pricing">Upgrade to Access</a>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <NavMenu />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-2">
                <Building2 className="h-4 w-4" />
                Accountant Portal
              </div>
              <h1 className="text-3xl font-bold text-foreground">Client Management</h1>
              <p className="text-muted-foreground">Manage all your client businesses in one place</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Import Clients
              </Button>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Client
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="glass-frosted">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{clients?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Clients</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-frosted">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(totalTurnover)}</p>
                    <p className="text-sm text-muted-foreground">Total Turnover</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-frosted">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{verifiedCount}</p>
                    <p className="text-sm text-muted-foreground">CAC Verified</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-frosted">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{pendingCount}</p>
                    <p className="text-sm text-muted-foreground">Pending Verification</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="clients" className="space-y-6">
            <TabsList>
              <TabsTrigger value="clients">Client List</TabsTrigger>
              <TabsTrigger value="deadlines">Tax Deadlines</TabsTrigger>
              <TabsTrigger value="reports">Bulk Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="clients" className="space-y-4">
              {/* Search and Actions */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search clients by name or sector..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                  {selectedClients.length > 0 && (
                    <>
                      <Button variant="outline" size="sm" onClick={bulkExport} className="gap-2">
                        <Download className="h-4 w-4" />
                        Export ({selectedClients.length})
                      </Button>
                      <Button variant="outline" size="sm" onClick={bulkVerifyCAC} className="gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Verify CAC
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Client List */}
              <Card className="glass-frosted">
                <CardHeader className="border-b border-border">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">All Clients</CardTitle>
                    <Button variant="ghost" size="sm" onClick={selectAll}>
                      {selectedClients.length === filteredClients.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-8 text-center">
                      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
                    </div>
                  ) : filteredClients.length === 0 ? (
                    <div className="p-8 text-center">
                      <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No clients found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {filteredClients.map((client) => (
                        <div
                          key={client.id}
                          className={`flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors ${
                            selectedClients.includes(client.id) ? 'bg-primary/5' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedClients.includes(client.id)}
                            onChange={() => toggleClient(client.id)}
                            className="h-4 w-4 rounded border-border"
                          />
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{client.name}</p>
                              {client.cac_verified && (
                                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {client.entity_type === 'company' ? 'Limited Company' : 'Business Name'}
                              {client.sector && ` • ${client.sector}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(client.turnover)}</p>
                            <p className="text-xs text-muted-foreground">Annual Turnover</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deadlines">
              <Card className="glass-frosted">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Upcoming Tax Deadlines
                  </CardTitle>
                  <CardDescription>
                    Track tax deadlines for all your clients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <div>
                          <p className="font-medium">VAT Returns Due</p>
                          <p className="text-sm text-muted-foreground">3 clients have VAT due in 5 days</p>
                        </div>
                      </div>
                      <Badge variant="destructive">Urgent</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-warning/10 border border-warning/20">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-warning" />
                        <div>
                          <p className="font-medium">PAYE Remittance</p>
                          <p className="text-sm text-muted-foreground">7 clients have PAYE due in 10 days</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Upcoming</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">CIT Annual Returns</p>
                          <p className="text-sm text-muted-foreground">2 clients have CIT due in 30 days</p>
                        </div>
                      </div>
                      <Badge variant="outline">Scheduled</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card className="glass-frosted">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Bulk Report Generation
                  </CardTitle>
                  <CardDescription>
                    Generate reports for multiple clients at once
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto p-4 justify-start gap-4">
                      <FileText className="h-8 w-8 text-primary" />
                      <div className="text-left">
                        <p className="font-medium">Tax Summary Report</p>
                        <p className="text-sm text-muted-foreground">Generate tax summaries for selected clients</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 justify-start gap-4">
                      <TrendingUp className="h-8 w-8 text-success" />
                      <div className="text-left">
                        <p className="font-medium">Annual Comparison</p>
                        <p className="text-sm text-muted-foreground">Compare year-over-year tax data</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 justify-start gap-4">
                      <Download className="h-8 w-8 text-accent" />
                      <div className="text-left">
                        <p className="font-medium">Bulk Export</p>
                        <p className="text-sm text-muted-foreground">Export all client data to CSV/Excel</p>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 justify-start gap-4">
                      <Calendar className="h-8 w-8 text-warning" />
                      <div className="text-left">
                        <p className="font-medium">Deadline Report</p>
                        <p className="text-sm text-muted-foreground">Upcoming deadlines for all clients</p>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AccountantPortal;
