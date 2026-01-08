import { useState, useEffect, useRef } from "react";
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
  Info,
  MapPin,
  Download,
  Upload
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface GeoLocation {
  city?: string | null;
  country?: string | null;
  country_code?: string | null;
}

interface IPWhitelistEntry {
  id: string;
  ip_range: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  location?: GeoLocation | null;
}

interface IPWhitelistManagerProps {
  userId: string;
}

export const IPWhitelistManager = ({ userId }: IPWhitelistManagerProps) => {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<IPWhitelistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [whitelistEnabled, setWhitelistEnabled] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [newIpRange, setNewIpRange] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [currentIP, setCurrentIP] = useState<string | null>(null);
  const [currentIPLocation, setCurrentIPLocation] = useState<GeoLocation | null>(null);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [importing, setImporting] = useState(false);
  const [geoLocations, setGeoLocations] = useState<Record<string, GeoLocation>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch geolocation for an IP
  const fetchGeoLocation = async (ip: string): Promise<GeoLocation | null> => {
    // Skip for wildcards and CIDR ranges
    if (ip.includes('*') || ip.includes('/')) return null;
    
    try {
      const { data, error } = await supabase.functions.invoke('get-ip-location', {
        body: { ip }
      });
      
      if (error) throw error;
      
      return {
        city: data.city,
        country: data.country,
        country_code: data.country_code
      };
    } catch (error) {
      console.error("Error fetching geolocation:", error);
      return null;
    }
  };

  // Fetch current IP and its location
  useEffect(() => {
    const fetchCurrentIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setCurrentIP(data.ip);
        
        // Fetch location for current IP
        const location = await fetchGeoLocation(data.ip);
        if (location) {
          setCurrentIPLocation(location);
        }
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
        
        // Fetch geolocations for all entries
        if (whitelistData && whitelistData.length > 0) {
          const locations: Record<string, GeoLocation> = {};
          await Promise.all(
            whitelistData.map(async (entry) => {
              const location = await fetchGeoLocation(entry.ip_range);
              if (location) {
                locations[entry.id] = location;
              }
            })
          );
          setGeoLocations(locations);
        }
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
      
      // Fetch geolocation for the new entry
      const location = await fetchGeoLocation(newIpRange.trim());
      if (location) {
        setGeoLocations(prev => ({ ...prev, [data.id]: location }));
      }
      
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
      
      // Copy current IP location to the new entry
      if (currentIPLocation) {
        setGeoLocations(prev => ({ ...prev, [data.id]: currentIPLocation }));
      }
      
      toast.success("Current IP added to whitelist");
    } catch (error: any) {
      toast.error(error.message || "Failed to add IP");
    } finally {
      setSaving(false);
    }
  };

  // Export entries to CSV
  const handleExportCSV = () => {
    if (entries.length === 0) {
      toast.error("No entries to export");
      return;
    }

    const csvRows = [
      ['IP Range', 'Description', 'Active', 'City', 'Country', 'Created At'].join(',')
    ];

    entries.forEach(entry => {
      const location = geoLocations[entry.id];
      const row = [
        `"${entry.ip_range}"`,
        `"${entry.description || ''}"`,
        entry.is_active ? 'true' : 'false',
        `"${location?.city || ''}"`,
        `"${location?.country || ''}"`,
        `"${entry.created_at}"`
      ].join(',');
      csvRows.push(row);
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ip-whitelist-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("IP whitelist exported successfully");
  };

  // Import entries from CSV
  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header row
      const dataLines = lines.slice(1);
      
      if (dataLines.length === 0) {
        toast.error("No data found in CSV file");
        return;
      }

      let imported = 0;
      let skipped = 0;

      for (const line of dataLines) {
        // Parse CSV line (handle quoted values)
        const matches = line.match(/("([^"]*)"|[^,]+)/g);
        if (!matches || matches.length < 2) continue;

        const ipRange = matches[0].replace(/"/g, '').trim();
        const description = matches[1]?.replace(/"/g, '').trim() || null;
        const isActive = matches[2]?.toLowerCase().trim() !== 'false';

        if (!ipRange || !validateIPRange(ipRange)) {
          skipped++;
          continue;
        }

        // Check if already exists
        if (entries.some(e => e.ip_range === ipRange)) {
          skipped++;
          continue;
        }

        const { data, error } = await supabase
          .from('ip_whitelist')
          .insert({
            user_id: userId,
            ip_range: ipRange,
            description,
            is_active: isActive
          })
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            skipped++;
            continue;
          }
          console.error("Error importing entry:", error);
          skipped++;
          continue;
        }

        setEntries(prev => [data, ...prev]);
        
        // Fetch geolocation
        const location = await fetchGeoLocation(ipRange);
        if (location) {
          setGeoLocations(prev => ({ ...prev, [data.id]: location }));
        }
        
        imported++;
      }

      if (imported > 0) {
        toast.success(`Imported ${imported} entries${skipped > 0 ? `, ${skipped} skipped` : ''}`);
      } else {
        toast.info(`No new entries imported (${skipped} skipped)`);
      }
    } catch (error: any) {
      console.error("Error importing CSV:", error);
      toast.error("Failed to import CSV file");
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Globe className="h-5 w-5 text-primary shrink-0" />
                <span className="truncate">{t('security.ipWhitelist.title')}</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t('security.ipWhitelist.description')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Switch
                checked={whitelistEnabled}
                onCheckedChange={handleToggleWhitelist}
                disabled={toggling}
              />
              <Badge variant={whitelistEnabled ? "default" : "secondary"} className="whitespace-nowrap">
                {whitelistEnabled ? t('security.ipWhitelist.enabled') : t('security.ipWhitelist.disabled')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 overflow-hidden">
          {/* Current IP Info */}
          {currentIP && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg overflow-hidden">
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm whitespace-nowrap">{t('security.ipWhitelist.yourIp')}:</span>
                  <code className="text-xs sm:text-sm font-mono bg-background px-2 py-0.5 rounded truncate max-w-[120px] sm:max-w-none">
                    {currentIP}
                  </code>
                  {whitelistEnabled && (
                    isCurrentIPWhitelisted() ? (
                      <Badge variant="outline" className="text-green-600 border-green-600 text-xs whitespace-nowrap">
                        <CheckCircle2 className="h-3 w-3 mr-1 shrink-0" />
                        {t('security.ipWhitelist.whitelisted')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-600 text-xs whitespace-nowrap">
                        <AlertCircle className="h-3 w-3 mr-1 shrink-0" />
                        {t('security.ipWhitelist.notWhitelisted')}
                      </Badge>
                    )
                  )}
                </div>
                {currentIPLocation && (currentIPLocation.city || currentIPLocation.country) && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground ml-5">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      {[currentIPLocation.city, currentIPLocation.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddCurrentIP}
                disabled={saving || entries.some(e => e.ip_range === currentIP)}
                className="shrink-0 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-1" />
                {t('security.ipWhitelist.addThisIp')}
              </Button>
            </div>
          )}

          {/* Warning when enabled with no entries */}
          {whitelistEnabled && entries.filter(e => e.is_active).length === 0 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {t('security.ipWhitelist.noActiveWarning')}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {t('security.ipWhitelist.lockoutWarning')}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('security.ipWhitelist.addIpAddress')}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={entries.length === 0}
                className="flex-1 sm:flex-none"
              >
                <Download className="h-4 w-4 mr-1" />
                {t('security.ipWhitelist.export')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="flex-1 sm:flex-none"
              >
                {importing ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-1" />
                )}
                {t('security.ipWhitelist.import')}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
            </div>
          </div>

          {/* Entries List */}
          {entries.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between gap-2 p-3 rounded-lg border ${
                    entry.is_active 
                      ? 'bg-background border-border' 
                      : 'bg-muted/50 border-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <Switch
                      checked={entry.is_active}
                      onCheckedChange={() => handleToggleEntry(entry.id, entry.is_active)}
                      className="shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <code className={`text-xs sm:text-sm font-mono truncate ${!entry.is_active && 'text-muted-foreground'}`}>
                          {entry.ip_range}
                        </code>
                        {geoLocations[entry.id] && (geoLocations[entry.id].city || geoLocations[entry.id].country) && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0 hidden sm:flex items-center gap-0.5">
                            <MapPin className="h-2.5 w-2.5" />
                            <span className="truncate max-w-[80px]">
                              {geoLocations[entry.id].city || geoLocations[entry.id].country}
                            </span>
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {entry.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {entry.description}
                          </p>
                        )}
                        {geoLocations[entry.id] && (geoLocations[entry.id].city || geoLocations[entry.id].country) && (
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 sm:hidden">
                            <MapPin className="h-2.5 w-2.5 shrink-0" />
                            <span className="truncate">
                              {[geoLocations[entry.id].city, geoLocations[entry.id].country].filter(Boolean).join(', ')}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8"
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
              <p className="text-sm">{t('security.ipWhitelist.noEntries')}</p>
              <p className="text-xs">{t('security.ipWhitelist.addToRestrict')}</p>
            </div>
          )}

          {/* Help Text */}
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t overflow-hidden">
            <p><strong>{t('security.ipWhitelist.supportedFormats')}:</strong></p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li className="truncate">{t('security.ipWhitelist.exactIp')}: <code className="bg-muted px-1 rounded">192.168.1.100</code></li>
              <li className="truncate">{t('security.ipWhitelist.cidrRange')}: <code className="bg-muted px-1 rounded">192.168.1.0/24</code></li>
              <li className="truncate">{t('security.ipWhitelist.wildcard')}: <code className="bg-muted px-1 rounded">192.168.1.*</code></li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Add IP Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('security.ipWhitelist.addIp')}</DialogTitle>
            <DialogDescription>
              {t('security.ipWhitelist.addIpDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ipRange">{t('security.ipWhitelist.ipAddressOrRange')}</Label>
              <Input
                id="ipRange"
                value={newIpRange}
                onChange={(e) => setNewIpRange(e.target.value)}
                placeholder={t('security.ipWhitelist.ipPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t('security.ipWhitelist.descriptionLabel')}</Label>
              <Input
                id="description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder={t('security.ipWhitelist.descriptionPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleAddEntry} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('common.adding')}
                </>
              ) : (
                t('security.ipWhitelist.addToWhitelist')
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
              {t('security.ipWhitelist.enableTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('security.ipWhitelist.enableDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {t('security.ipWhitelist.warningTitle')}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {t('security.ipWhitelist.warningText')}
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
                  {t('security.ipWhitelist.addMyIpAndEnable')} ({currentIP})
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={toggleWhitelist}
              disabled={toggling}
            >
              {t('security.ipWhitelist.proceed')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
