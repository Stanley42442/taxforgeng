import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  AlertCircle, 
  Globe, 
  Plus, 
  Trash2, 
  Shield,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Info
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface IPWhitelistEntry {
  id: string;
  ip_range: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

interface IPWhitelistManagerProps {
  userId: string;
}

export const IPWhitelistManager = ({ userId }: IPWhitelistManagerProps) => {
  const [entries, setEntries] = useState<IPWhitelistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [whitelistEnabled, setWhitelistEnabled] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [newIpRange, setNewIpRange] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [currentIP, setCurrentIP] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  // Fetch current IP
  useEffect(() => {
    const fetchCurrentIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setCurrentIP(data.ip);
      } catch (error) {
        console.error("Error fetching IP:", error);
      }
    };
    fetchCurrentIP();
  }, []);

  // Load whitelist entries and status
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load whitelist enabled status
        const { data: profile } = await supabase
          .from('profiles')
          .select('ip_whitelist_enabled')
          .eq('id', userId)
          .single();
        
        setWhitelistEnabled(profile?.ip_whitelist_enabled || false);

        // Load whitelist entries
        const { data: whitelistData, error } = await supabase
          .from('ip_whitelist')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setEntries(whitelistData || []);
      } catch (error) {
        console.error("Error loading IP whitelist:", error);
        toast.error("Failed to load IP whitelist settings");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  // Check if current IP is whitelisted
  const isCurrentIPWhitelisted = () => {
    if (!currentIP) return false;
    return entries.some(entry => {
      if (!entry.is_active) return false;
      // Exact match
      if (entry.ip_range === currentIP) return true;
      // Wildcard match
      if (entry.ip_range.includes('*')) {
        const pattern = entry.ip_range.replace(/\*/g, '.*');
        return new RegExp(`^${pattern}$`).test(currentIP);
      }
      // CIDR match (simplified - just check prefix)
      if (entry.ip_range.includes('/')) {
        const [baseIP] = entry.ip_range.split('/');
        const baseParts = baseIP.split('.');
        const currentParts = currentIP.split('.');
        // Simple prefix match for common cases
        return baseParts.slice(0, 3).join('.') === currentParts.slice(0, 3).join('.');
      }
      return false;
    });
  };

  const handleToggleWhitelist = async () => {
    // If enabling and current IP is not whitelisted, show warning
    if (!whitelistEnabled && currentIP && !isCurrentIPWhitelisted() && entries.length === 0) {
      setShowConfirmDialog(true);
      return;
    }
    
    await toggleWhitelist();
  };

  const toggleWhitelist = async () => {
    setToggling(true);
    try {
      const newValue = !whitelistEnabled;
      
      const { error } = await supabase
        .from('profiles')
        .update({ ip_whitelist_enabled: newValue })
        .eq('id', userId);

      if (error) throw error;

      setWhitelistEnabled(newValue);
      setShowConfirmDialog(false);
      toast.success(newValue ? "IP whitelist enabled" : "IP whitelist disabled");
    } catch (error: any) {
      toast.error(error.message || "Failed to update settings");
    } finally {
      setToggling(false);
    }
  };

  const validateIPRange = (ip: string): boolean => {
    // Allow exact IP, CIDR notation, or wildcard
    const exactIPRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    const wildcardRegex = /^(\d{1,3}\.){0,3}\*$/;
    
    return exactIPRegex.test(ip) || cidrRegex.test(ip) || wildcardRegex.test(ip);
  };

  const handleAddEntry = async () => {
    if (!newIpRange.trim()) {
      toast.error("Please enter an IP address or range");
      return;
    }

    if (!validateIPRange(newIpRange.trim())) {
      toast.error("Invalid IP format. Use exact IP (192.168.1.1), CIDR (192.168.1.0/24), or wildcard (192.168.1.*)");
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('ip_whitelist')
        .insert({
          user_id: userId,
          ip_range: newIpRange.trim(),
          description: newDescription.trim() || null,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error("This IP range is already whitelisted");
          return;
        }
        throw error;
      }

      setEntries([data, ...entries]);
      setNewIpRange("");
      setNewDescription("");
      setShowAddDialog(false);
      toast.success("IP range added to whitelist");
    } catch (error: any) {
      toast.error(error.message || "Failed to add IP range");
    } finally {
      setSaving(false);
    }
  };

  const handleAddCurrentIP = async () => {
    if (!currentIP) return;
    
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('ip_whitelist')
        .insert({
          user_id: userId,
          ip_range: currentIP,
          description: "My current IP",
          is_active: true
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error("This IP is already whitelisted");
          return;
        }
        throw error;
      }

      setEntries([data, ...entries]);
      toast.success("Current IP added to whitelist");
    } catch (error: any) {
      toast.error(error.message || "Failed to add IP");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEntry = async (entryId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('ip_whitelist')
        .update({ is_active: !isActive })
        .eq('id', entryId);

      if (error) throw error;

      setEntries(entries.map(e => 
        e.id === entryId ? { ...e, is_active: !isActive } : e
      ));
    } catch (error: any) {
      toast.error(error.message || "Failed to update entry");
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('ip_whitelist')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      setEntries(entries.filter(e => e.id !== entryId));
      toast.success("IP range removed from whitelist");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete entry");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                IP Address Whitelist
              </CardTitle>
              <CardDescription>
                Restrict logins to specific IP addresses or ranges
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={whitelistEnabled}
                onCheckedChange={handleToggleWhitelist}
                disabled={toggling}
              />
              <Badge variant={whitelistEnabled ? "default" : "secondary"}>
                {whitelistEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current IP Info */}
          {currentIP && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Your current IP:</span>
                <code className="text-sm font-mono bg-background px-2 py-0.5 rounded">
                  {currentIP}
                </code>
                {whitelistEnabled && (
                  isCurrentIPWhitelisted() ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Whitelisted
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600 border-amber-600">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Not whitelisted
                    </Badge>
                  )
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddCurrentIP}
                disabled={saving || entries.some(e => e.ip_range === currentIP)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add This IP
              </Button>
            </div>
          )}

          {/* Warning when enabled with no entries */}
          {whitelistEnabled && entries.filter(e => e.is_active).length === 0 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  No active IP addresses whitelisted
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  You won't be able to log in from any IP address. Add at least one IP to avoid being locked out.
                </p>
              </div>
            </div>
          )}

          {/* Add Entry Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add IP Address or Range
          </Button>

          {/* Entries List */}
          {entries.length > 0 ? (
            <div className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    entry.is_active 
                      ? 'bg-background border-border' 
                      : 'bg-muted/50 border-muted'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Switch
                      checked={entry.is_active}
                      onCheckedChange={() => handleToggleEntry(entry.id, entry.is_active)}
                    />
                    <div className="min-w-0">
                      <code className={`text-sm font-mono ${!entry.is_active && 'text-muted-foreground'}`}>
                        {entry.ip_range}
                      </code>
                      {entry.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {entry.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => handleDeleteEntry(entry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No IP addresses whitelisted</p>
              <p className="text-xs">Add IP addresses to restrict login access</p>
            </div>
          )}

          {/* Help Text */}
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <p><strong>Supported formats:</strong></p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Exact IP: <code className="bg-muted px-1 rounded">192.168.1.100</code></li>
              <li>CIDR range: <code className="bg-muted px-1 rounded">192.168.1.0/24</code></li>
              <li>Wildcard: <code className="bg-muted px-1 rounded">192.168.1.*</code></li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Add IP Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add IP Address</DialogTitle>
            <DialogDescription>
              Add an IP address or range to your whitelist
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ipRange">IP Address or Range</Label>
              <Input
                id="ipRange"
                value={newIpRange}
                onChange={(e) => setNewIpRange(e.target.value)}
                placeholder="e.g., 192.168.1.100 or 192.168.1.0/24"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="e.g., Home network, Office IP"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEntry} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add to Whitelist"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Enable Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Enable IP Whitelist?
            </DialogTitle>
            <DialogDescription>
              You're about to enable IP whitelisting without adding your current IP address.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Warning: You may lock yourself out
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  If you enable the whitelist without adding any IP addresses, you won't be able to log in from any location.
                </p>
              </div>
            </div>
            {currentIP && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    await handleAddCurrentIP();
                    await toggleWhitelist();
                  }}
                  disabled={saving || toggling}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add my IP ({currentIP}) and enable
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={toggleWhitelist}
              disabled={toggling}
            >
              Enable anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
