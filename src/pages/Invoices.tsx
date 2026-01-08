import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { NavMenu } from "@/components/NavMenu";
import { Plus, FileText, Send, Check, Clock, X, Trash2, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/taxCalculations";

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  is_vatable: boolean;
}

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string | null;
  subtotal: number;
  vat_amount: number;
  total: number;
  status: string;
  issued_date: string;
  due_date: string;
  paid_date: string | null;
  notes: string | null;
  business_id: string | null;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

const statusIcons: Record<string, React.ReactNode> = {
  draft: <FileText className="h-4 w-4" />,
  sent: <Send className="h-4 w-4" />,
  paid: <Check className="h-4 w-4" />,
  overdue: <Clock className="h-4 w-4" />,
  cancelled: <X className="h-4 w-4" />,
};

const Invoices = () => {
  const { user } = useAuth();
  const { savedBusinesses, tier } = useSubscription();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  
  // New invoice form state
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unit_price: 0, amount: 0, is_vatable: true }
  ]);

  const tierOrder = ['free', 'starter', 'basic', 'freelancer', 'business', 'corporate'];
  const canAccess = tierOrder.indexOf(tier) >= tierOrder.indexOf('basic');

  useEffect(() => {
    if (user && canAccess) {
      fetchInvoices();
    }
  }, [user, canAccess]);

  const fetchInvoices = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const vatableAmount = items.filter(i => i.is_vatable).reduce((sum, item) => sum + item.amount, 0);
    const vatAmount = vatableAmount * 0.075;
    const total = subtotal + vatAmount;
    return { subtotal, vatAmount, total };
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].amount = newItems[index].quantity * newItems[index].unit_price;
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0, amount: 0, is_vatable: true }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleCreateInvoice = async () => {
    if (!user || !clientName || !dueDate) {
      toast.error('Please fill in required fields');
      return;
    }

    const { subtotal, vatAmount, total } = calculateTotals();
    const invoiceNumber = generateInvoiceNumber();

    try {
      // Create the invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          business_id: selectedBusiness || null,
          invoice_number: invoiceNumber,
          client_name: clientName,
          client_email: clientEmail || null,
          subtotal,
          vat_amount: vatAmount,
          total,
          status: 'draft',
          due_date: dueDate,
          notes: notes || null,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      const itemsToInsert = items.filter(item => item.description && item.amount > 0).map(item => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.amount,
        is_vatable: item.is_vatable,
      }));

      if (itemsToInsert.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      toast.success(`Invoice ${invoiceNumber} created!`);
      setIsCreating(false);
      resetForm();
      fetchInvoices();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    }
  };

  const resetForm = () => {
    setClientName("");
    setClientEmail("");
    setDueDate("");
    setNotes("");
    setItems([{ description: "", quantity: 1, unit_price: 0, amount: 0, is_vatable: true }]);
  };

  const updateInvoiceStatus = async (invoiceId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'paid') {
        updateData.paid_date = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId);

      if (error) throw error;
      
      toast.success(`Invoice marked as ${newStatus}`);
      fetchInvoices();
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Failed to update invoice');
    }
  };

  const deleteInvoice = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (error) throw error;
      
      toast.success('Invoice deleted');
      fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    }
  };

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-background">
        <NavMenu />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto text-center p-8">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Invoicing System</h2>
            <p className="text-muted-foreground mb-6">
              Create professional invoices with automatic VAT calculation. Available on Basic plan and above.
            </p>
            <Button onClick={() => navigate('/pricing')}>Upgrade to Access</Button>
          </Card>
        </div>
      </div>
    );
  }

  const { subtotal, vatAmount, total } = calculateTotals();

  return (
    <div className="min-h-screen bg-background">
      <NavMenu />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Invoices</h1>
            <p className="text-muted-foreground">Create and manage professional invoices</p>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {savedBusinesses.length > 0 && (
                  <div>
                    <Label>Business (Optional)</Label>
                    <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a business" />
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Client Name *</Label>
                    <Input 
                      value={clientName} 
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Client name"
                    />
                  </div>
                  <div>
                    <Label>Client Email</Label>
                    <Input 
                      type="email"
                      value={clientEmail} 
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@email.com"
                    />
                  </div>
                </div>

                <div>
                  <Label>Due Date *</Label>
                  <Input 
                    type="date"
                    value={dueDate} 
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Invoice Items</Label>
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-4">
                          <Input 
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input 
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input 
                            type="number"
                            placeholder="Price"
                            value={item.unit_price || ''}
                            onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                          />
                        </div>
                        <div className="col-span-2 text-right font-medium">
                          {formatCurrency(item.amount)}
                        </div>
                        <div className="col-span-2 flex gap-1">
                          <Button
                            type="button"
                            variant={item.is_vatable ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateItem(index, 'is_vatable', !item.is_vatable)}
                          >
                            VAT
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Plus className="h-4 w-4 mr-1" /> Add Item
                    </Button>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>VAT (7.5%):</span>
                    <span>{formatCurrency(vatAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Payment terms, bank details, etc."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                  <Button onClick={handleCreateInvoice}>Create Invoice</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Invoiced</div>
              <div className="text-2xl font-bold">
                {formatCurrency(invoices.reduce((sum, inv) => sum + Number(inv.total), 0))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Paid</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + Number(inv.total), 0))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(invoices.filter(i => i.status === 'sent').reduce((sum, inv) => sum + Number(inv.total), 0))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Overdue</div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(invoices.filter(i => i.status === 'overdue').reduce((sum, inv) => sum + Number(inv.total), 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice List */}
        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No invoices yet. Create your first invoice to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-medium">{invoice.invoice_number}</div>
                        <div className="text-sm text-muted-foreground">{invoice.client_name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(Number(invoice.total))}</div>
                        <div className="text-sm text-muted-foreground">
                          Due: {new Date(invoice.due_date).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge className={statusColors[invoice.status]}>
                        {statusIcons[invoice.status]}
                        <span className="ml-1 capitalize">{invoice.status}</span>
                      </Badge>
                      <div className="flex gap-1">
                        {invoice.status === 'draft' && (
                          <Button size="sm" variant="outline" onClick={() => updateInvoiceStatus(invoice.id, 'sent')}>
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        {invoice.status === 'sent' && (
                          <Button size="sm" variant="outline" onClick={() => updateInvoiceStatus(invoice.id, 'paid')}>
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => deleteInvoice(invoice.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Invoices;