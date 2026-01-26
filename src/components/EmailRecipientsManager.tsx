import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Mail, 
  Plus, 
  Trash2, 
  Star, 
  StarOff, 
  Loader2,
  UserPlus,
  Users
} from "lucide-react";

interface EmailRecipient {
  id: string;
  email: string;
  name: string | null;
  type: string | null;
  is_default: boolean;
}

interface EmailRecipientsManagerProps {
  onSelect?: (recipients: EmailRecipient[]) => void;
  selectionMode?: boolean;
  selectedIds?: string[];
}

const RECIPIENT_TYPES = [
  { value: 'accountant', label: 'Accountant' },
  { value: 'client', label: 'Client' },
  { value: 'partner', label: 'Business Partner' },
  { value: 'self', label: 'Personal' },
  { value: 'other', label: 'Other' },
];

export function EmailRecipientsManager({ 
  onSelect, 
  selectionMode = false,
  selectedIds = []
}: EmailRecipientsManagerProps) {
  const { user } = useAuth();
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));
  
  const [newRecipient, setNewRecipient] = useState({
    email: '',
    name: '',
    type: 'other',
    is_default: false,
  });

  useEffect(() => {
    fetchRecipients();
  }, [user]);

  const fetchRecipients = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('email_recipients')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching recipients:', error);
      toast.error('Failed to load email recipients');
    } else {
      setRecipients(data || []);
    }
    setLoading(false);
  };

  const handleAddRecipient = async () => {
    if (!user || !newRecipient.email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newRecipient.email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from('email_recipients')
      .insert({
        user_id: user.id,
        email: newRecipient.email.trim().toLowerCase(),
        name: newRecipient.name.trim() || null,
        type: newRecipient.type,
        is_default: newRecipient.is_default,
      })
      .select()
      .maybeSingle();

    setSaving(false);
    
    if (!data) {
      toast.error('Failed to add recipient');
      return;
    }

    if (error) {
      if (error.code === '23505') {
        toast.error('This email is already in your list');
      } else {
        console.error('Error adding recipient:', error);
        toast.error('Failed to add recipient');
      }
      return;
    }

    setRecipients(prev => [data, ...prev]);
    setShowAddDialog(false);
    setNewRecipient({ email: '', name: '', type: 'other', is_default: false });
    toast.success('Recipient added!');
  };

  const handleDeleteRecipient = async (id: string) => {
    const { error } = await supabase
      .from('email_recipients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting recipient:', error);
      toast.error('Failed to delete recipient');
      return;
    }

    setRecipients(prev => prev.filter(r => r.id !== id));
    setSelected(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    toast.success('Recipient removed');
  };

  const handleToggleDefault = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from('email_recipients')
      .update({ is_default: !currentValue })
      .eq('id', id);

    if (error) {
      console.error('Error updating recipient:', error);
      toast.error('Failed to update recipient');
      return;
    }

    setRecipients(prev => 
      prev.map(r => r.id === id ? { ...r, is_default: !currentValue } : r)
    );
  };

  const handleSelectionChange = (id: string) => {
    setSelected(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      
      if (onSelect) {
        const selectedRecipients = recipients.filter(r => newSet.has(r.id));
        onSelect(selectedRecipients);
      }
      
      return newSet;
    });
  };

  const getTypeLabel = (type: string | null) => {
    return RECIPIENT_TYPES.find(t => t.value === type)?.label || 'Other';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Email Recipients</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {recipients.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">No email recipients yet</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Recipient
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {recipients.map((recipient) => (
            <Card 
              key={recipient.id}
              className={`transition-all cursor-pointer ${
                selectionMode && selected.has(recipient.id) 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={selectionMode ? () => handleSelectionChange(recipient.id) : undefined}
            >
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {selectionMode && (
                      <input
                        type="checkbox"
                        checked={selected.has(recipient.id)}
                        onChange={() => handleSelectionChange(recipient.id)}
                        className="h-4 w-4 rounded border-input"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground truncate">
                          {recipient.name || recipient.email}
                        </p>
                        {recipient.is_default && (
                          <Star className="h-3.5 w-3.5 text-warning fill-warning flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {recipient.name && recipient.email}
                        {!recipient.name && <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{getTypeLabel(recipient.type)}</span>}
                      </p>
                    </div>
                  </div>
                  
                  {!selectionMode && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleDefault(recipient.id, recipient.is_default);
                        }}
                        title={recipient.is_default ? 'Remove from defaults' : 'Set as default'}
                      >
                        {recipient.is_default ? (
                          <Star className="h-4 w-4 text-warning fill-warning" />
                        ) : (
                          <StarOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRecipient(recipient.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Recipient Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Add Email Recipient
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email Address *</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={newRecipient.email}
                onChange={(e) => setNewRecipient(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Name (Optional)</Label>
              <Input
                placeholder="John Doe"
                value={newRecipient.name}
                onChange={(e) => setNewRecipient(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Type</Label>
              <Select 
                value={newRecipient.type} 
                onValueChange={(v) => setNewRecipient(prev => ({ ...prev, type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECIPIENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="is_default">Set as default recipient</Label>
              <Switch
                id="is_default"
                checked={newRecipient.is_default}
                onCheckedChange={(checked) => setNewRecipient(prev => ({ ...prev, is_default: checked }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRecipient} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Recipient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
