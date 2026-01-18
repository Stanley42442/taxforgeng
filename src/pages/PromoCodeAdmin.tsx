import { useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Gift, 
  Plus, 
  Edit2, 
  Trash2, 
  RefreshCw, 
  Copy,
  CheckCircle,
  XCircle,
  Calendar,
  Percent,
  DollarSign,
  Users,
  TrendingUp,
  Loader2,
  Shield,
  Search
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  max_discount_amount: number | null;
  min_purchase_amount: number | null;
  max_uses: number | null;
  max_uses_per_user: number | null;
  current_uses: number;
  applicable_tiers: string[] | null;
  applicable_billing_cycles: string[] | null;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  new_users_only: boolean;
  first_purchase_only: boolean;
  created_at: string;
}

interface PromoCodeFormData {
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_discount_amount: number | null;
  min_purchase_amount: number | null;
  max_uses: number | null;
  max_uses_per_user: number;
  applicable_tiers: string[];
  applicable_billing_cycles: string[];
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  new_users_only: boolean;
  first_purchase_only: boolean;
}

const defaultFormData: PromoCodeFormData = {
  code: '',
  description: '',
  discount_type: 'percentage',
  discount_value: 10,
  max_discount_amount: null,
  min_purchase_amount: null,
  max_uses: null,
  max_uses_per_user: 1,
  applicable_tiers: ['starter', 'basic', 'professional', 'business'],
  applicable_billing_cycles: ['monthly', 'annually'],
  valid_from: '',
  valid_until: '',
  is_active: true,
  new_users_only: false,
  first_purchase_only: false,
};

const TIERS = ['starter', 'basic', 'professional', 'business'];
const BILLING_CYCLES = ['monthly', 'annually'];

const PromoCodeAdmin = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState<PromoCodeFormData>(defaultFormData);

  // Stats
  const [stats, setStats] = useState({
    totalCodes: 0,
    activeCodes: 0,
    totalRedemptions: 0,
    totalDiscountGiven: 0
  });

  useEffect(() => {
    if (!adminLoading && user) {
      fetchPromoCodes();
      fetchStats();
    }
  }, [adminLoading, user]);

  const fetchPromoCodes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromoCodes(data || []);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      toast.error('Failed to fetch promo codes');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [codesResult, redemptionsResult] = await Promise.all([
        supabase.from('promo_codes').select('id, is_active'),
        supabase.from('promo_code_redemptions').select('discount_amount')
      ]);

      const codes = codesResult.data || [];
      const redemptions = redemptionsResult.data || [];

      setStats({
        totalCodes: codes.length,
        activeCodes: codes.filter(c => c.is_active).length,
        totalRedemptions: redemptions.length,
        totalDiscountGiven: redemptions.reduce((sum, r) => sum + (r.discount_amount || 0), 0) / 100
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'TFN';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  const openCreateDialog = () => {
    setEditingCode(null);
    setFormData(defaultFormData);
    generateCode();
    setIsDialogOpen(true);
  };

  const openEditDialog = (code: PromoCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      description: code.description || '',
      discount_type: code.discount_type as 'percentage' | 'fixed',
      discount_value: code.discount_value,
      max_discount_amount: code.max_discount_amount,
      min_purchase_amount: code.min_purchase_amount,
      max_uses: code.max_uses,
      max_uses_per_user: code.max_uses_per_user || 1,
      applicable_tiers: code.applicable_tiers || TIERS,
      applicable_billing_cycles: code.applicable_billing_cycles || BILLING_CYCLES,
      valid_from: code.valid_from ? code.valid_from.split('T')[0] : '',
      valid_until: code.valid_until ? code.valid_until.split('T')[0] : '',
      is_active: code.is_active,
      new_users_only: code.new_users_only || false,
      first_purchase_only: code.first_purchase_only || false,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: formData.code.toUpperCase().trim(),
        description: formData.description || null,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        max_discount_amount: formData.max_discount_amount,
        min_purchase_amount: formData.min_purchase_amount,
        max_uses: formData.max_uses,
        max_uses_per_user: formData.max_uses_per_user,
        applicable_tiers: formData.applicable_tiers,
        applicable_billing_cycles: formData.applicable_billing_cycles,
        valid_from: formData.valid_from || null,
        valid_until: formData.valid_until || null,
        is_active: formData.is_active,
        new_users_only: formData.new_users_only,
        first_purchase_only: formData.first_purchase_only,
        created_by: user?.id
      };

      if (editingCode) {
        const { error } = await supabase
          .from('promo_codes')
          .update(payload)
          .eq('id', editingCode.id);

        if (error) throw error;
        toast.success('Promo code updated');
      } else {
        const { error } = await supabase
          .from('promo_codes')
          .insert(payload);

        if (error) throw error;
        toast.success('Promo code created');
      }

      setIsDialogOpen(false);
      fetchPromoCodes();
      fetchStats();
    } catch (error: any) {
      console.error('Error saving promo code:', error);
      toast.error(error.message || 'Failed to save promo code');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (code: PromoCode) => {
    if (!confirm(`Are you sure you want to delete "${code.code}"?`)) return;

    try {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', code.id);

      if (error) throw error;
      toast.success('Promo code deleted');
      fetchPromoCodes();
      fetchStats();
    } catch (error) {
      console.error('Error deleting promo code:', error);
      toast.error('Failed to delete promo code');
    }
  };

  const toggleActive = async (code: PromoCode) => {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({ is_active: !code.is_active })
        .eq('id', code.id);

      if (error) throw error;
      toast.success(`Promo code ${code.is_active ? 'deactivated' : 'activated'}`);
      fetchPromoCodes();
      fetchStats();
    } catch (error) {
      console.error('Error toggling promo code:', error);
      toast.error('Failed to update promo code');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const filteredCodes = promoCodes.filter(code =>
    code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    code.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (adminLoading || loading) {
    return (
      <PageLayout title="Promo Code Management" icon={Gift} maxWidth="6xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (!isAdmin) {
    return (
      <PageLayout title="Promo Code Management" icon={Gift} maxWidth="6xl">
        <div className="text-center py-12">
          <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Promo Code Management" description="Create, edit, and track promotional codes" icon={Gift} maxWidth="6xl">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="animate-slide-up">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Codes</p>
                <p className="text-2xl font-bold">{stats.totalCodes}</p>
              </div>
              <Gift className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '50ms' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Codes</p>
                <p className="text-2xl font-bold text-success">{stats.activeCodes}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Redemptions</p>
                <p className="text-2xl font-bold">{stats.totalRedemptions}</p>
              </div>
              <Users className="h-8 w-8 text-info opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '150ms' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Discounts Given</p>
                <p className="text-2xl font-bold text-warning">{formatCurrency(stats.totalDiscountGiven)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-warning opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search promo codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={fetchPromoCodes} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCode ? 'Edit Promo Code' : 'Create Promo Code'}</DialogTitle>
              <DialogDescription>
                {editingCode ? 'Update the promo code details' : 'Create a new promotional discount code'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Code</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="SAVE20"
                      className="font-mono"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={generateCode}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Discount Type</Label>
                  <Select 
                    value={formData.discount_type} 
                    onValueChange={(v: 'percentage' | 'fixed') => setFormData(prev => ({ ...prev, discount_type: v }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (₦)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Discount Value</Label>
                  <div className="relative mt-1">
                    <Input
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_value: parseFloat(e.target.value) || 0 }))}
                      className="pl-8"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {formData.discount_type === 'percentage' ? '%' : '₦'}
                    </span>
                  </div>
                </div>
                <div>
                  <Label>Max Discount (optional)</Label>
                  <Input
                    type="number"
                    value={formData.max_discount_amount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_discount_amount: e.target.value ? parseFloat(e.target.value) : null }))}
                    placeholder="No limit"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="20% off for new users"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Valid From</Label>
                  <Input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Valid Until</Label>
                  <Input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Max Uses (total)</Label>
                  <Input
                    type="number"
                    value={formData.max_uses || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_uses: e.target.value ? parseInt(e.target.value) : null }))}
                    placeholder="Unlimited"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Max Uses Per User</Label>
                  <Input
                    type="number"
                    value={formData.max_uses_per_user}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_uses_per_user: parseInt(e.target.value) || 1 }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Applicable Tiers</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {TIERS.map(tier => (
                    <Badge
                      key={tier}
                      variant={formData.applicable_tiers.includes(tier) ? 'default' : 'outline'}
                      className="cursor-pointer capitalize"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          applicable_tiers: prev.applicable_tiers.includes(tier)
                            ? prev.applicable_tiers.filter(t => t !== tier)
                            : [...prev.applicable_tiers, tier]
                        }));
                      }}
                    >
                      {tier}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Billing Cycles</Label>
                <div className="flex gap-2 mt-2">
                  {BILLING_CYCLES.map(cycle => (
                    <Badge
                      key={cycle}
                      variant={formData.applicable_billing_cycles.includes(cycle) ? 'default' : 'outline'}
                      className="cursor-pointer capitalize"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          applicable_billing_cycles: prev.applicable_billing_cycles.includes(cycle)
                            ? prev.applicable_billing_cycles.filter(c => c !== cycle)
                            : [...prev.applicable_billing_cycles, cycle]
                        }));
                      }}
                    >
                      {cycle}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>New Users Only</Label>
                  <Switch
                    checked={formData.new_users_only}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, new_users_only: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>First Purchase Only</Label>
                  <Switch
                    checked={formData.first_purchase_only}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, first_purchase_only: checked }))}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingCode ? 'Update' : 'Create'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Promo Codes Table */}
      <Card>
        <CardContent className="p-0">
          {filteredCodes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No promo codes found</p>
              <Button variant="link" onClick={openCreateDialog}>Create your first code</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left p-4 font-medium text-muted-foreground">Code</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Discount</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Usage</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Validity</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCodes.map((code) => (
                    <tr key={code.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-primary">{code.code}</code>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(code.code)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        {code.description && (
                          <p className="text-xs text-muted-foreground mt-1">{code.description}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {code.discount_type === 'percentage' ? (
                            <>
                              <Percent className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{code.discount_value}%</span>
                            </>
                          ) : (
                            <>
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{formatCurrency(code.discount_value)}</span>
                            </>
                          )}
                        </div>
                        {code.max_discount_amount && (
                          <p className="text-xs text-muted-foreground">Max: {formatCurrency(code.max_discount_amount)}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{code.current_uses || 0}</span>
                          {code.max_uses && (
                            <span className="text-muted-foreground">/ {code.max_uses}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {code.valid_until ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(code.valid_until), 'MMM d, yyyy')}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No expiry</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant={code.is_active ? 'default' : 'secondary'} className={code.is_active ? 'bg-success' : ''}>
                          {code.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => toggleActive(code)}>
                            {code.is_active ? (
                              <XCircle className="h-4 w-4 text-destructive" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-success" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(code)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(code)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default PromoCodeAdmin;
