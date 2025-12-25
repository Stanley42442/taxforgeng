import { useState, useEffect, useCallback } from "react";
import { NavMenu } from "@/components/NavMenu";
import { useSubscription, SavedBusiness } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Bell, Calendar, Mail, Plus, Settings, Clock, CheckCircle2, AlertTriangle, Building2, Crown, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Reminder {
  id: string;
  businessId: string | null;
  type: string;
  name: string;
  dueDate: string;
  enabled: boolean;
  customNote?: string;
}

const DEFAULT_REMINDERS = [
  { type: 'vat_monthly', name: 'Monthly VAT Filing', dueDate: '21st of each month' },
  { type: 'cit_annual', name: 'Annual CIT Return', dueDate: 'June 30th' },
  { type: 'pit_monthly', name: 'PIT Remittance', dueDate: '10th of each month' },
  { type: 'paye_monthly', name: 'PAYE Remittance', dueDate: '10th of each month' },
];

const Reminders = () => {
  const { tier, savedBusinesses } = useSubscription();
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<SavedBusiness | null>(null);
  const [customReminderOpen, setCustomReminderOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [customNote, setCustomNote] = useState('');

  // Fetch reminders from database
  const fetchReminders = useCallback(async () => {
    if (!user) {
      setReminders([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching reminders:', error);
      toast.error('Failed to load reminders');
    } else {
      const mapped: Reminder[] = (data || []).map(r => ({
        id: r.id,
        businessId: r.business_id,
        type: r.reminder_type,
        name: r.title,
        dueDate: r.due_date,
        enabled: r.notify_email,
        customNote: r.description || undefined,
      }));
      setReminders(mapped);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const getBusinessReminders = (businessId: string) => {
    return reminders.filter(r => r.businessId === businessId);
  };

  const toggleReminder = async (businessId: string, type: string) => {
    if (!user) return;

    const existing = reminders.find(r => r.businessId === businessId && r.type === type);
    
    if (existing) {
      // Toggle existing reminder
      const { error } = await supabase
        .from('reminders')
        .update({ notify_email: !existing.enabled })
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating reminder:', error);
        toast.error('Failed to update reminder');
        return;
      }

      setReminders(prev => prev.map(r => 
        r.id === existing.id ? { ...r, enabled: !r.enabled } : r
      ));
      toast.success(existing.enabled ? 'Reminder disabled' : 'Reminder enabled');
    } else {
      // Create new reminder
      const template = DEFAULT_REMINDERS.find(d => d.type === type);
      if (!template) return;

      const { data, error } = await supabase
        .from('reminders')
        .insert({
          user_id: user.id,
          business_id: businessId,
          reminder_type: type,
          title: template.name,
          due_date: new Date().toISOString(),
          notify_email: true,
          description: template.dueDate,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating reminder:', error);
        toast.error('Failed to create reminder');
        return;
      }

      const newReminder: Reminder = {
        id: data.id,
        businessId: data.business_id,
        type: data.reminder_type,
        name: data.title,
        dueDate: template.dueDate,
        enabled: true,
      };

      setReminders(prev => [...prev, newReminder]);
      toast.success('Reminder enabled');
    }
  };

  const isReminderEnabled = (businessId: string, type: string) => {
    return reminders.some(r => r.businessId === businessId && r.type === type && r.enabled);
  };

  const addCustomReminder = async () => {
    if (!user || !selectedBusiness || !customName || !customDate) return;
    
    const { data, error } = await supabase
      .from('reminders')
      .insert({
        user_id: user.id,
        business_id: selectedBusiness.id,
        reminder_type: 'custom',
        title: customName,
        due_date: new Date().toISOString(),
        notify_email: true,
        description: customNote || customDate,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating custom reminder:', error);
      toast.error('Failed to create reminder');
      return;
    }

    const newReminder: Reminder = {
      id: data.id,
      businessId: data.business_id,
      type: 'custom',
      name: customName,
      dueDate: customDate,
      enabled: true,
      customNote,
    };

    setReminders(prev => [...prev, newReminder]);
    setCustomReminderOpen(false);
    setCustomName('');
    setCustomDate('');
    setCustomNote('');
    toast.success('Custom reminder added');
  };

  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  const sendTestEmail = async (business: SavedBusiness, reminderType: string) => {
    if (!user?.email) {
      toast.error('No email address found for your account');
      return;
    }

    const template = DEFAULT_REMINDERS.find(d => d.type === reminderType);
    const reminder = reminders.find(r => r.businessId === business.id && r.type === reminderType);
    
    setSendingEmail(`${business.id}-${reminderType}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-reminder-email', {
        body: {
          userEmail: user.email,
          businessName: business.name,
          reminderType: reminderType,
          dueDate: reminder?.dueDate || template?.dueDate || 'Soon',
          reminderTitle: template?.name || reminderType,
        },
      });

      if (error) throw error;

      toast.success(`Test email sent to ${user.email}!`, { duration: 5000 });
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email. Please check your email configuration.');
    } finally {
      setSendingEmail(null);
    }
  };

  const deleteReminder = async (id: string) => {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting reminder:', error);
      toast.error('Failed to delete reminder');
      return;
    }

    setReminders(prev => prev.filter(r => r.id !== id));
    toast.success('Reminder deleted');
  };

  // Free tier - show upgrade prompt
  if (tier === 'free') {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <NavMenu />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl">Automated Reminders</CardTitle>
              <CardDescription>
                Never miss a tax deadline! Get automated reminders for VAT, CIT, PIT, and PAYE filing dates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3 text-left">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>Monthly VAT filing reminders</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>Annual CIT return deadline alerts</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Mail className="w-5 h-5 text-primary" />
                  <span>Email notifications (Basic+)</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Settings className="w-5 h-5 text-primary" />
                  <span>Custom reminders (Business+)</span>
                </div>
              </div>
              <Link to="/pricing">
                <Button className="w-full bg-gradient-primary hover:opacity-90">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Basic for Reminders
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <NavMenu />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-4">Loading reminders...</p>
        </div>
      </div>
    );
  }

  const canCustomize = tier === 'business' || tier === 'corporate';

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col overflow-x-hidden">
      <NavMenu />
      
      <div className="container mx-auto px-4 py-6 pb-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            <Bell className="inline-block w-8 h-8 mr-2 text-primary" />
            Tax Deadline Reminders
          </h1>
          <p className="text-muted-foreground">
            Set up automated reminders for your tax filing deadlines
          </p>
        </div>

        {savedBusinesses.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Saved Businesses</h3>
              <p className="text-muted-foreground mb-4">
                Save a business from the calculator to set up reminders
              </p>
              <Link to="/calculator">
                <Button>Go to Calculator</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {savedBusinesses.map(business => (
              <Card key={business.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {business.name}
                        {business.verificationStatus === 'verified' && (
                          <Badge variant="secondary" className="bg-success/20 text-success">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {business.entityType === 'company' ? 'Limited Company' : 'Business Name'} • 
                        ₦{business.turnover.toLocaleString()} turnover
                      </CardDescription>
                    </div>
                    {canCustomize && (
                      <Dialog open={customReminderOpen && selectedBusiness?.id === business.id} onOpenChange={(open) => {
                        setCustomReminderOpen(open);
                        if (open) setSelectedBusiness(business);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-1" />
                            Custom
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Custom Reminder</DialogTitle>
                            <DialogDescription>
                              Create a custom tax deadline reminder for {business.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Reminder Name</Label>
                              <Input
                                id="name"
                                placeholder="e.g., Quarterly Returns"
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="date">Due Date</Label>
                              <Input
                                id="date"
                                placeholder="e.g., March 31st"
                                value={customDate}
                                onChange={(e) => setCustomDate(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="note">Note (Optional)</Label>
                              <Input
                                id="note"
                                placeholder="Additional details..."
                                value={customNote}
                                onChange={(e) => setCustomNote(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setCustomReminderOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={addCustomReminder} disabled={!customName || !customDate}>
                              Add Reminder
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      Standard Deadlines
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {DEFAULT_REMINDERS.map(reminder => (
                        <div 
                          key={reminder.type}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isReminderEnabled(business.id, reminder.type) 
                                ? 'bg-success/20' 
                                : 'bg-muted'
                            }`}>
                              <Calendar className={`w-5 h-5 ${
                                isReminderEnabled(business.id, reminder.type) 
                                  ? 'text-success' 
                                  : 'text-muted-foreground'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{reminder.name}</p>
                              <p className="text-xs text-muted-foreground">{reminder.dueDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isReminderEnabled(business.id, reminder.type) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => sendTestEmail(business, reminder.type)}
                                className="text-xs"
                                disabled={sendingEmail === `${business.id}-${reminder.type}`}
                              >
                                {sendingEmail === `${business.id}-${reminder.type}` ? (
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                ) : (
                                  <Mail className="w-3 h-3 mr-1" />
                                )}
                                {sendingEmail === `${business.id}-${reminder.type}` ? 'Sending...' : 'Test'}
                              </Button>
                            )}
                            <Switch
                              checked={isReminderEnabled(business.id, reminder.type)}
                              onCheckedChange={() => toggleReminder(business.id, reminder.type)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Custom Reminders */}
                    {getBusinessReminders(business.id).filter(r => r.type === 'custom').length > 0 && (
                      <>
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mt-6">
                          Custom Reminders
                        </h4>
                        <div className="grid gap-3">
                          {getBusinessReminders(business.id)
                            .filter(r => r.type === 'custom')
                            .map(reminder => (
                              <div 
                                key={reminder.id}
                                className="flex items-center justify-between p-3 border rounded-lg bg-accent/5"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                                    <Settings className="w-5 h-5 text-accent" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{reminder.name}</p>
                                    <p className="text-xs text-muted-foreground">{reminder.dueDate}</p>
                                    {reminder.customNote && (
                                      <p className="text-xs text-muted-foreground italic">{reminder.customNote}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteReminder(reminder.id)}
                                    className="text-destructive"
                                  >
                                    Delete
                                  </Button>
                                  <Switch
                                    checked={reminder.enabled}
                                    onCheckedChange={async () => {
                                      const { error } = await supabase
                                        .from('reminders')
                                        .update({ notify_email: !reminder.enabled })
                                        .eq('id', reminder.id);
                                      
                                      if (!error) {
                                        setReminders(prev => prev.map(r => 
                                          r.id === reminder.id ? { ...r, enabled: !r.enabled } : r
                                        ));
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!canCustomize && (
          <Card className="mt-6 border-accent/50 bg-accent/5">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-accent" />
                <span className="text-sm">
                  Upgrade to Business to add custom reminder dates and notes
                </span>
              </div>
              <Link to="/pricing">
                <Button variant="outline" size="sm">Upgrade</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reminders;
