import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/contexts/SubscriptionContext";
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
import { NavMenu } from "@/components/NavMenu";
import { Plus, CheckCircle, Clock, AlertTriangle, Calendar, FileCheck, Trash2 } from "lucide-react";
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
  
  // Form state
  const [itemType, setItemType] = useState("");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");

  const tierOrder = ['free', 'starter', 'basic', 'freelancer', 'business', 'corporate'];
  const canAccess = tierOrder.indexOf(tier) >= tierOrder.indexOf('freelancer');

  useEffect(() => {
    if (user && canAccess) {
      fetchItems();
    }
  }, [user, canAccess]);

  const fetchItems = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('compliance_items')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      
      // Update overdue status
      const updatedItems = (data || []).map(item => ({
        ...item,
        status: item.status !== 'completed' && isPast(new Date(item.due_date)) ? 'overdue' : item.status
      }));
      
      setItems(updatedItems);
    } catch (error) {
      console.error('Error fetching compliance items:', error);
      toast.error('Failed to load compliance items');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!user || !itemType || !title || !dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('compliance_items')
        .insert({
          user_id: user.id,
          business_id: selectedBusiness || null,
          item_type: itemType,
          title,
          due_date: dueDate,
          status: 'pending',
        });

      if (error) throw error;

      toast.success('Compliance item created');
      setIsCreating(false);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error('Error creating compliance item:', error);
      toast.error('Failed to create compliance item');
    }
  };

  const resetForm = () => {
    setItemType("");
    setTitle("");
    setDueDate("");
    setSelectedBusiness("");
  };

  const toggleComplete = async (item: ComplianceItem) => {
    const newStatus = item.status === 'completed' ? 'pending' : 'completed';
    const completedDate = newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null;

    try {
      const { error } = await supabase
        .from('compliance_items')
        .update({ status: newStatus, completed_date: completedDate })
        .eq('id', item.id);

      if (error) throw error;
      
      toast.success(newStatus === 'completed' ? 'Marked as complete' : 'Marked as pending');
      fetchItems();
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('compliance_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Item deleted');
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  // Calculate completion stats
  const totalItems = items.length;
  const completedItems = items.filter(i => i.status === 'completed').length;
  const overdueItems = items.filter(i => i.status === 'overdue').length;
  const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-background">
        <NavMenu />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto text-center p-8">
            <FileCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Compliance Tracker</h2>
            <p className="text-muted-foreground mb-6">
              Track all your tax and regulatory compliance deadlines. Available on Freelancer plan and above.
            </p>
            <Button onClick={() => navigate('/pricing')}>Upgrade to Access</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavMenu />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Compliance Tracker</h1>
            <p className="text-muted-foreground">Track tax and regulatory deadlines</p>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Compliance Item</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label>Type *</Label>
                  <Select value={itemType} onValueChange={(val) => {
                    setItemType(val);
                    const type = COMPLIANCE_TYPES.find(t => t.value === val);
                    if (type && val !== 'custom') {
                      setTitle(type.label);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPLIANCE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div>{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Title *</Label>
                  <Input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Compliance item title"
                  />
                </div>

                <div>
                  <Label>Due Date *</Label>
                  <Input 
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                {savedBusinesses.length > 0 && (
                  <div>
                    <Label>Business (Optional)</Label>
                    <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business" />
                      </SelectTrigger>
                      <SelectContent>
                        {savedBusinesses.map((business: any) => (
                          <SelectItem key={business.id} value={business.id}>
                            {business.name}
                          </SelectItem>
                        ))}
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
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Items</div>
              <div className="text-2xl font-bold">{totalItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Completed</div>
              <div className="text-2xl font-bold text-green-600">{completedItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Overdue</div>
              <div className="text-2xl font-bold text-red-600">{overdueItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-2">Completion Rate</div>
              <Progress value={completionRate} className="h-2" />
              <div className="text-sm font-medium mt-1">{completionRate.toFixed(0)}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Items List */}
        <Card>
          <CardHeader>
            <CardTitle>All Compliance Items</CardTitle>
            <CardDescription>Click the checkbox to mark items as complete</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No compliance items yet. Add your first item to start tracking.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => {
                  const daysUntilDue = differenceInDays(new Date(item.due_date), new Date());
                  const isUrgent = daysUntilDue <= 7 && item.status !== 'completed';
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                        item.status === 'completed' ? 'bg-muted/30' : isUrgent ? 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Checkbox 
                          checked={item.status === 'completed'}
                          onCheckedChange={() => toggleComplete(item)}
                        />
                        <div>
                          <div className={`font-medium ${item.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                            {item.title}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            Due: {format(new Date(item.due_date), 'MMM d, yyyy')}
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
                        <Button variant="ghost" size="sm" onClick={() => deleteItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Compliance;