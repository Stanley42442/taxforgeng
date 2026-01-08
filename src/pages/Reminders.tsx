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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Calendar as CalendarIcon, Mail, Plus, Settings, Clock, CheckCircle2, AlertTriangle, Building2, Crown, Loader2, BellRing, Volume2, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { requestNotificationPermission } from "@/hooks/useReminderNotifications";
import { Textarea } from "@/components/ui/textarea";

interface Reminder {
  id: string;
  businessId: string | null;
  type: string;
  name: string;
  dueDate: string;
  enabled: boolean;
  notifyWhatsapp?: boolean;
  customNote?: string;
}

const DEFAULT_REMINDERS = [
  { type: 'vat', name: 'Monthly VAT Filing', dueDate: '21st of each month', dayOfMonth: 21 },
  { type: 'cit', name: 'Annual CIT Return', dueDate: 'June 30th', month: 5, dayOfMonth: 30 },
  { type: 'pit', name: 'PIT Remittance', dueDate: '10th of each month', dayOfMonth: 10 },
  { type: 'paye', name: 'PAYE Remittance', dueDate: '10th of each month', dayOfMonth: 10 },
];

// Format due date for display - handles both ISO strings and readable text
const formatDueDate = (dueDate: string): string => {
  // Check if it's an ISO date string
  if (dueDate.includes('T') || dueDate.match(/^\d{4}-\d{2}-\d{2}/)) {
    try {
      const date = new Date(dueDate);
      return format(date, "PPP 'at' h:mm a");
    } catch {
      return dueDate;
    }
  }
  return dueDate;
};

// Calculate the next due date based on reminder type
const calculateNextDueDate = (type: string): Date => {
  const now = new Date();
  const template = DEFAULT_REMINDERS.find(r => r.type === type);
  
  if (!template) return now;
  
  let nextDate = new Date();
  
  if (type === 'cit') {
    // June 30th annually
    nextDate.setMonth(5, 30);
    nextDate.setHours(9, 0, 0, 0);
    if (nextDate <= now) {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }
  } else if (template.dayOfMonth) {
    // Monthly reminders
    nextDate.setDate(template.dayOfMonth);
    nextDate.setHours(9, 0, 0, 0);
    if (nextDate <= now) {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
  }
  
  return nextDate;
};

const Reminders = () => {
  const { tier, savedBusinesses } = useSubscription();
  const { user } = useAuth();
  
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<SavedBusiness | null>(null);
  const [customReminderOpen, setCustomReminderOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);
  const [customTime, setCustomTime] = useState('09:00');
  const [customNote, setCustomNote] = useState('');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    } else {
      setNotificationPermission('unsupported');
    }
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationPermission('granted');
      toast.success('Push notifications enabled!');
    } else {
      setNotificationPermission(Notification.permission);
      toast.error('Notification permission denied');
    }
  };

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
        notifyWhatsapp: (r as any).notify_whatsapp ?? false,
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

    // Find all matching reminders (there might be duplicates)
    const existingReminders = reminders.filter(r => r.businessId === businessId && r.type === type);
    const existing = existingReminders[0];
    
    if (existing) {
      const newEnabledState = !existing.enabled;
      
      // Optimistic update - update UI immediately
      setReminders(prev => prev.map(r => 
        r.businessId === businessId && r.type === type ? { ...r, enabled: newEnabledState } : r
      ));
      toast.success(newEnabledState ? 'Reminder enabled' : 'Reminder disabled');
      
      // Then sync with database for all matching reminders
      const { error } = await supabase
        .from('reminders')
        .update({ notify_email: newEnabledState })
        .eq('business_id', businessId)
        .eq('reminder_type', type)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating reminder:', error);
        // Revert on error
        setReminders(prev => prev.map(r => 
          r.businessId === businessId && r.type === type ? { ...r, enabled: existing.enabled } : r
        ));
        toast.error('Failed to update reminder');
      }
    } else {
      // Create new reminder
      const template = DEFAULT_REMINDERS.find(d => d.type === type);
      if (!template) return;

      const nextDueDate = calculateNextDueDate(type);
      const tempId = `temp-${Date.now()}`;
      
      // Optimistic update - add to UI immediately with temp id
      const optimisticReminder: Reminder = {
        id: tempId,
        businessId: businessId,
        type: type,
        name: template.name,
        dueDate: template.dueDate,
        enabled: true,
      };
      setReminders(prev => [...prev, optimisticReminder]);
      toast.success('Reminder enabled');
      
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          user_id: user.id,
          business_id: businessId,
          reminder_type: type,
          title: template.name,
          due_date: nextDueDate.toISOString(),
          notify_email: true,
          description: template.dueDate,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating reminder:', error);
        // Revert on error
        setReminders(prev => prev.filter(r => r.id !== tempId));
        toast.error('Failed to create reminder');
        return;
      }

      // Replace temp reminder with real one
      setReminders(prev => prev.map(r => 
        r.id === tempId ? { ...r, id: data.id } : r
      ));
    }
  };

  const isReminderEnabled = (businessId: string, type: string) => {
    return reminders.some(r => r.businessId === businessId && r.type === type && r.enabled);
  };

  const toggleWhatsApp = async (reminderId: string) => {
    if (!user) return;
    
    const reminder = reminders.find(r => r.id === reminderId);
    if (!reminder) return;
    
    const newWhatsappState = !reminder.notifyWhatsapp;
    
    // Optimistic update
    setReminders(prev => prev.map(r => 
      r.id === reminderId ? { ...r, notifyWhatsapp: newWhatsappState } : r
    ));
    
    const { error } = await supabase
      .from('reminders')
      .update({ notify_whatsapp: newWhatsappState } as any)
      .eq('id', reminderId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error updating WhatsApp setting:', error);
      // Revert on error
      setReminders(prev => prev.map(r => 
        r.id === reminderId ? { ...r, notifyWhatsapp: reminder.notifyWhatsapp } : r
      ));
      toast.error('Failed to update WhatsApp notification');
    } else {
      toast.success(newWhatsappState ? 'WhatsApp notifications enabled' : 'WhatsApp notifications disabled');
    }
  };

  const addCustomReminder = async () => {
    if (!user || !selectedBusiness || !customName || !customDate) return;
    
    // Parse time and combine with date using local timezone
    const [hours, minutes] = customTime.split(':').map(Number);
    const year = customDate.getFullYear();
    const month = customDate.getMonth();
    const day = customDate.getDate();
    const dueDate = new Date(year, month, day, hours, minutes, 0, 0);
    
    const { data, error } = await supabase
      .from('reminders')
      .insert({
        user_id: user.id,
        business_id: selectedBusiness.id,
        reminder_type: 'custom',
        title: customName,
        due_date: dueDate.toISOString(),
        notify_email: true,
        description: customNote || null,
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
      dueDate: dueDate.toISOString(),
      enabled: true,
      customNote,
    };

    setReminders(prev => [...prev, newReminder]);
    setCustomReminderOpen(false);
    setCustomName('');
    setCustomDate(undefined);
    setCustomTime('09:00');
    setCustomNote('');
    toast.success('Custom reminder added');
  };

  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  const sendTestEmail = async (business: SavedBusiness, reminderType: string, reminderId?: string) => {
    if (!user?.email) {
      toast.error('No email address found for your account');
      return;
    }

    const template = DEFAULT_REMINDERS.find(d => d.type === reminderType);
    // Find the specific reminder - use reminderId for custom reminders
    const reminder = reminderId 
      ? reminders.find(r => r.id === reminderId)
      : reminders.find(r => r.businessId === business.id && r.type === reminderType);
    
    // Use the actual reminder name, not the template name
    const reminderTitle = reminder?.name || template?.name || reminderType;
    
    setSendingEmail(`${business.id}-${reminderType}-${reminderId || ''}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-reminder-email', {
        body: {
          userEmail: user.email,
          businessName: business.name,
          reminderType: reminderType,
          dueDate: reminder?.dueDate || template?.dueDate || 'Soon',
          reminderTitle: reminderTitle,
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
              <CardTitle className="text-2xl">{t('reminders.automatedReminders')}</CardTitle>
              <CardDescription>
                {t('reminders.neverMiss')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3 text-left">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <span>{t('reminders.vatFiling')}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>{t('reminders.citDeadline')}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Mail className="w-5 h-5 text-primary" />
                  <span>{t('reminders.emailNotifications')}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Settings className="w-5 h-5 text-primary" />
                  <span>{t('reminders.customReminders')}</span>
                </div>
              </div>
              <Link to="/pricing">
                <Button className="w-full bg-gradient-primary hover:opacity-90">
                  <Crown className="w-4 h-4 mr-2" />
                  {t('reminders.upgradeToBasic')}
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
          <p className="text-muted-foreground mt-4">{t('reminders.loadingReminders')}</p>
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
            {t('reminders.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('reminders.subtitle')}
          </p>
        </div>

        {/* Notification Permission Card */}
        {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <BellRing className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t('reminders.enablePush')}</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when reminders are due, even when the app is in the background
                    </p>
                  </div>
                </div>
                <Button onClick={handleEnableNotifications} size="sm" className="shrink-0">
                  <Volume2 className="w-4 h-4 mr-2" />
                  {t('reminders.enableNotifications')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {notificationPermission === 'granted' && (
          <Card className="mb-6 border-success/20 bg-success/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-success/10">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{t('reminders.pushEnabled')}</p>
                  <p className="text-sm text-muted-foreground">
                    You'll receive sound and push notifications when reminders are due
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* WhatsApp Info Card */}
        <Card className="mb-6 border-accent/20 bg-accent/5">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-accent/10">
                  <MessageCircle className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">WhatsApp Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Enable WhatsApp notifications for individual reminders below
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">Coming Soon</Badge>
            </div>
          </CardContent>
        </Card>

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
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label htmlFor="dueDate">Due Date</Label>
                                <div className="relative">
                                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                  <Input
                                    id="dueDate"
                                    type="date"
                                    className="pl-10"
                                    value={customDate ? format(customDate, "yyyy-MM-dd") : ""}
                                    min={format(new Date(), "yyyy-MM-dd")}
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        setCustomDate(new Date(e.target.value));
                                      } else {
                                        setCustomDate(undefined);
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="dueTime">Time</Label>
                                <Input
                                  id="dueTime"
                                  type="time"
                                  className="w-full"
                                  value={customTime}
                                  onChange={(e) => setCustomTime(e.target.value)}
                                />
                              </div>
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
                          <DialogFooter className="gap-2 sm:gap-0">
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
                          className="flex items-center justify-between p-3 border rounded-lg min-w-0 overflow-hidden"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center ${
                              isReminderEnabled(business.id, reminder.type) 
                                ? 'bg-success/20' 
                                : 'bg-muted'
                            }`}>
                              <CalendarIcon className={`w-5 h-5 ${
                                isReminderEnabled(business.id, reminder.type) 
                                  ? 'text-success' 
                                  : 'text-muted-foreground'
                              }`} />
                            </div>
                            <div className="min-w-0 mr-3">
                              <p className="font-medium text-sm truncate">{reminder.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{formatDueDate(reminder.dueDate)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                            {isReminderEnabled(business.id, reminder.type) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => sendTestEmail(business, reminder.type)}
                                className="text-xs px-2"
                                disabled={sendingEmail === `${business.id}-${reminder.type}`}
                              >
                                {sendingEmail === `${business.id}-${reminder.type}` ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Mail className="w-3 h-3" />
                                )}
                                <span className="hidden sm:inline ml-1">
                                  {sendingEmail === `${business.id}-${reminder.type}` ? 'Sending...' : 'Test'}
                                </span>
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
                                className="flex items-center justify-between p-3 border rounded-lg bg-accent/5 min-w-0 overflow-hidden"
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className="w-10 h-10 flex-shrink-0 rounded-full bg-accent/20 flex items-center justify-center">
                                    <Settings className="w-5 h-5 text-accent" />
                                  </div>
                                  <div className="min-w-0 mr-3">
                                    <p className="font-medium text-sm truncate">{reminder.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{formatDueDate(reminder.dueDate)}</p>
                                    {reminder.customNote && (
                                      <p className="text-xs text-muted-foreground italic truncate">{reminder.customNote}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                  {/* WhatsApp toggle */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleWhatsApp(reminder.id)}
                                    className={`text-xs px-2 ${reminder.notifyWhatsapp ? 'text-accent' : 'text-muted-foreground'}`}
                                    title="WhatsApp notifications (coming soon)"
                                  >
                                    <MessageCircle className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => sendTestEmail(business, reminder.type, reminder.id)}
                                    className="text-xs px-2"
                                    disabled={sendingEmail === `${business.id}-${reminder.type}-${reminder.id}`}
                                  >
                                    {sendingEmail === `${business.id}-${reminder.type}-${reminder.id}` ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Mail className="w-3 h-3" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteReminder(reminder.id)}
                                    className="text-destructive px-2"
                                  >
                                    <span className="hidden sm:inline">Delete</span>
                                    <span className="sm:hidden">×</span>
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
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0" />
                <span className="text-sm">
                  Upgrade to Business to add custom reminder dates and notes
                </span>
              </div>
              <div className="flex-shrink-0 ml-2">
                <Link to="/pricing">
                  <Button variant="outline" size="sm">Upgrade</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reminders;
