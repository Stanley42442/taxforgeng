import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Plus, CheckCircle, Clock, AlertTriangle, Calendar, FileCheck, Trash2 } from "lucide-react";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { format, differenceInDays, isPast } from "date-fns";

interface ComplianceItem {
  id: string;
  item_type: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string;
  completed_date: string | null;
  notes: string | null;
  business_id: string | null;
}

const COMPLIANCE_TYPES = [
  { value: 'cac_returns', label: 'CAC Annual Returns', description: 'Due within 42 days of AGM' },
  { value: 'vat_filing', label: 'VAT Filing', description: 'Monthly, due 21st of following month' },
  { value: 'paye_remittance', label: 'PAYE Remittance', description: 'Monthly, due 10th of following month' },
  { value: 'pension', label: 'Pension Remittance', description: 'Monthly, due 7th of following month' },
  { value: 'cit_filing', label: 'CIT Filing', description: '6 months after year end' },
  { value: 'withholding_tax', label: 'WHT Remittance', description: 'Monthly, due 21st of following month' },
  { value: 'custom', label: 'Custom', description: 'Custom compliance item' },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const Compliance = () => {
  const { user } = useAuth();
  const { savedBusinesses, tier } = useSubscription();
  const navigate = useNavigate();
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  const [itemType, setItemType] = useState("");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");

  const tierOrder = ['free', 'starter', 'basic', 'professional', 'business', 'corporate'];
  const canAccess = tierOrder.indexOf(tier) >= tierOrder.indexOf('professional');

  useEffect(() => {
    if (user && canAccess) fetchItems();
  }, [user, canAccess]);

  const fetchItems = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('compliance_items').select('*').eq('user_id', user.id).order('due_date', { ascending: true });
      if (error) throw error;
      const updatedItems = (data || []).map(item => ({
        ...item,
        status: item.status !== 'completed' && isPast(new Date(item.due_date)) ? 'overdue' : item.status
      }));
      setItems(updatedItems);
    } catch (error) {
      toast.error('Failed to load compliance items');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!user || !itemType || !title || !dueDate) { toast.error('Please fill in all required fields'); return; }
    try {
      await supabase.from('compliance_items').insert({ user_id: user.id, business_id: selectedBusiness || null, item_type: itemType, title, due_date: dueDate, status: 'pending' });
      toast.success('Compliance item created');
      setIsCreating(false);
      setItemType(""); setTitle(""); setDueDate(""); setSelectedBusiness("");
      fetchItems();
    } catch (error) {
      toast.error('Failed to create compliance item');
    }
  };

  const toggleComplete = async (item: ComplianceItem) => {
    const newStatus = item.status === 'completed' ? 'pending' : 'completed';
    const completedDate = newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null;
    try {
      await supabase.from('compliance_items').update({ status: newStatus, completed_date: completedDate }).eq('id', item.id);
      toast.success(newStatus === 'completed' ? 'Marked as complete' : 'Marked as pending');
      fetchItems();
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await supabase.from('compliance_items').delete().eq('id', id);
      toast.success('Item deleted');
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const totalItems = items.length;
  const completedItems = items.filter(i => i.status === 'completed').length;
  const overdueItems = items.filter(i => i.status === 'overdue').length;
  const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  if (!canAccess) {
    return (
      <PageLayout title="Compliance Tracker" description="Track tax and regulatory deadlines" icon={FileCheck}>
        <div className="max-w-lg mx-auto py-12">
          <UpgradePrompt 
            feature="Compliance Tracker" 
            requiredTier="professional"
            showFeatures={true}
          />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Compliance Tracker" 
      description="Track tax and regulatory deadlines" 
      icon={FileCheck}
      headerActions={
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Compliance Item</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Type *</Label>
                <Select value={itemType} onValueChange={(val) => { setItemType(val); const type = COMPLIANCE_TYPES.find(t => t.value === val); if (type && val !== 'custom') setTitle(type.label); }}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {COMPLIANCE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Compliance item title" /></div>
              <div><Label>Due Date *</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
              {savedBusinesses.length > 0 && (
                <div>
                  <Label>Business (Optional)</Label>
                  <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                    <SelectTrigger><SelectValue placeholder="Select business" /></SelectTrigger>
                    <SelectContent>
                      {savedBusinesses.map((business: any) => (<SelectItem key={business.id} value={business.id}>{business.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button onClick={handleCreate}>Add Item</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="glass-frosted hover-lift stagger-1"><CardContent className="p-4"><div className="text-sm text-muted-foreground">Total Items</div><div className="text-2xl font-bold">{totalItems}</div></CardContent></Card>
        <Card className="glass-frosted hover-lift stagger-2 border-success/20"><CardContent className="p-4"><div className="text-sm text-muted-foreground">Completed</div><div className="text-2xl font-bold text-success">{completedItems}</div></CardContent></Card>
        <Card className="glass-frosted hover-lift stagger-3 border-destructive/20"><CardContent className="p-4"><div className="text-sm text-muted-foreground">Overdue</div><div className="text-2xl font-bold text-destructive">{overdueItems}</div></CardContent></Card>
        <Card className="glass-frosted hover-lift stagger-4"><CardContent className="p-4"><div className="text-sm text-muted-foreground mb-2">Completion Rate</div><Progress value={completionRate} className="h-2" /><div className="text-sm font-medium mt-1">{completionRate.toFixed(0)}%</div></CardContent></Card>
      </div>

      {/* Items List */}
      <Card className="glass-frosted">
        <CardHeader><CardTitle>All Compliance Items</CardTitle><CardDescription>Click the checkbox to mark items as complete</CardDescription></CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No compliance items yet. Add your first item to start tracking.</div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => {
                const daysUntilDue = differenceInDays(new Date(item.due_date), new Date());
                const isUrgent = daysUntilDue <= 7 && item.status !== 'completed';
                
                return (
                  <div key={item.id} className={`flex items-center justify-between p-4 glass rounded-lg transition-all hover-lift stagger-${Math.min(index + 1, 6)} ${item.status === 'completed' ? 'opacity-60' : isUrgent ? 'border-destructive/30 glow-sm' : ''}`}>
                    <div className="flex items-center gap-4">
                      <Checkbox checked={item.status === 'completed'} onCheckedChange={() => toggleComplete(item)} />
                      <div>
                        <div className={`font-medium ${item.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>{item.title}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-3 w-3" />Due: {format(new Date(item.due_date), 'MMM d, yyyy')}
                          {item.status !== 'completed' && (
                            <span className={isUrgent ? 'text-red-600 font-medium' : ''}>
                              ({daysUntilDue > 0 ? `${daysUntilDue} days left` : daysUntilDue === 0 ? 'Due today' : `${Math.abs(daysUntilDue)} days overdue`})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={statusColors[item.status]}>
                        {item.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {item.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {item.status === 'overdue' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        <span className="capitalize">{item.status.replace('_', ' ')}</span>
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => deleteItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default Compliance;
