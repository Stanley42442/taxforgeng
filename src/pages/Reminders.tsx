import { useState, useEffect, useCallback, useRef } from "react";
import { PageLayout } from "@/components/PageLayout";
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
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { requestNotificationPermission } from "@/hooks/useReminderNotifications";
import { Textarea } from "@/components/ui/textarea";
import { useFormFeedback } from "@/hooks/useFormFeedback";
import { SuccessCelebration } from "@/components/ui/form-feedback";
import { useDeleteWithUndo } from "@/hooks/useDeleteWithUndo";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import logger from "@/lib/logger";

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

const formatDueDate = (dueDate: string): string => {
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

const calculateNextDueDate = (type: string): Date => {
  const now = new Date();
  const template = DEFAULT_REMINDERS.find(r => r.type === type);
  
  if (!template) return now;
  
  let nextDate = new Date();
  
  if (type === 'cit') {
    nextDate.setMonth(5, 30);
    nextDate.setHours(9, 0, 0, 0);
    if (nextDate <= now) {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }
  } else if (template.dayOfMonth) {
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
  const navigate = useNavigate();
  
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<SavedBusiness | null>(null);
  const [customReminderOpen, setCustomReminderOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);
  const [customTime, setCustomTime] = useState('09:00');
  const [customNote, setCustomNote] = useState('');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const pendingDeleteRef = useRef<{ timeout: NodeJS.Timeout; reminder: Reminder } | null>(null);

  // Use centralized delete with undo hook
  const deleteWithUndo = useDeleteWithUndo<Reminder>({
    onDelete: async (reminder) => {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminder.id);

      if (error) {
        console.error('Error deleting reminder:', error);
        setReminders(prev => [...prev, reminder]);
        toast.error('Failed to delete reminder');
      }
    },
    onRestore: (reminder) => {
      setReminders(prev => [...prev, reminder]);
    },
    getSuccessMessage: (reminder) => `Reminder "${reminder.name}" deleted`,
    getItemName: (reminder) => reminder.name,
  });

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

    const existingReminders = reminders.filter(r => r.businessId === businessId && r.type === type);
    const existing = existingReminders[0];
    
    if (existing) {
      const newEnabledState = !existing.enabled;
      
      setReminders(prev => prev.map(r => 
        r.businessId === businessId && r.type === type ? { ...r, enabled: newEnabledState } : r
      ));
      toast.success(newEnabledState ? 'Reminder enabled' : 'Reminder disabled');
      
      const { error } = await supabase
        .from('reminders')
        .update({ notify_email: newEnabledState })
        .eq('business_id', businessId)
        .eq('reminder_type', type)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating reminder:', error);
        setReminders(prev => prev.map(r => 
          r.businessId === businessId && r.type === type ? { ...r, enabled: existing.enabled } : r
        ));
        toast.error('Failed to update reminder');
      }
    } else {
      const template = DEFAULT_REMINDERS.find(d => d.type === type);
      if (!template) return;

      const nextDueDate = calculateNextDueDate(type);
      const tempId = `temp-${Date.now()}`;
      
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
        logger.error('Error creating reminder:', error);
        setReminders(prev => prev.filter(r => r.id !== tempId));
        toast.error('Failed to create reminder');
        return;
      }

      setReminders(prev => prev.map(r => 
        r.id === tempId ? { ...r, id: data.id } : r
      ));
    }
  };

  const isReminderEnabled = (businessId: string, type: string) => {
    return reminders.some(r => r.businessId === businessId && r.type === type && r.enabled);
  };

  // Form feedback for custom reminders
  const reminderFormFeedback = useFormFeedback({
    successDuration: 3000,
    onSuccess: () => {
      setCustomReminderOpen(false);
      setCustomName('');
      setCustomDate(undefined);
      setCustomTime('09:00');
      setCustomNote('');
    }
  });

  const addCustomReminder = async () => {
    if (!user || !selectedBusiness || !customName || !customDate) return;
    
    reminderFormFeedback.setLoading();
    
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
      logger.error('Error creating custom reminder:', error);
      reminderFormFeedback.setError('Failed to create reminder');
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
    reminderFormFeedback.setSuccess(
      'Reminder Created! 🔔',
      `"${customName}" scheduled for ${format(dueDate, 'PPP')}`
    );
  };

  const deleteReminder = (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      // Remove optimistically from UI first
      setReminders(prev => prev.filter(r => r.id !== id));
      deleteWithUndo.requestDelete(reminder);
    }
  };

  // Override confirm to handle optimistic update
  const handleConfirmDelete = () => {
    if (deleteWithUndo.itemToDelete) {
      // Item already removed optimistically in deleteReminder
      deleteWithUndo.confirmDelete();
    }
  };

  const handleCancelDelete = () => {
    // Restore item if cancel
    if (deleteWithUndo.itemToDelete) {
      setReminders(prev => [...prev, deleteWithUndo.itemToDelete!]);
    }
    deleteWithUndo.cancelDelete();
  };

  const tierOrder = ['free', 'starter', 'basic', 'professional', 'business', 'corporate'];
  const canAccessReminders = tierOrder.indexOf(tier) >= tierOrder.indexOf('starter');

  if (!canAccessReminders) {
    return (
      <PageLayout title="Tax Reminders" description="Stay on top of your tax filing deadlines" icon={Bell} maxWidth="4xl">
        <Card className="text-center glass-frosted shadow-futuristic">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4 animate-float glow-sm">
              <Bell className="w-8 h-8 text-accent" />
            </div>
            <CardTitle className="text-2xl">Automated Tax Reminders</CardTitle>
            <CardDescription>Never miss a tax deadline again</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 text-left">
              <div className="flex items-center gap-3 p-3 glass rounded-lg hover-lift stagger-1">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <span>Monthly VAT filing reminders</span>
              </div>
              <div className="flex items-center gap-3 p-3 glass rounded-lg hover-lift stagger-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>Annual CIT deadline alerts</span>
              </div>
              <div className="flex items-center gap-3 p-3 glass rounded-lg hover-lift stagger-3">
                <Mail className="w-5 h-5 text-primary" />
                <span>Email notifications</span>
              </div>
              <div className="flex items-center gap-3 p-3 glass rounded-lg hover-lift stagger-4">
                <Settings className="w-5 h-5 text-primary" />
                <span>Custom reminders</span>
              </div>
            </div>
            <Button className="w-full glow-sm" variant="hero" onClick={() => navigate('/pricing')}>
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Starter
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout title="Tax Reminders" description="Stay on top of your tax filing deadlines" icon={Bell} maxWidth="4xl">
        <div className="space-y-6 animate-fade-in">
          {/* Notification card skeleton */}
          <div className="glass-frosted rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="skeleton-shimmer h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <div className="skeleton-shimmer h-4 w-40 rounded" />
                  <div className="skeleton-shimmer h-3 w-56 rounded" />
                </div>
              </div>
              <div className="skeleton-shimmer h-9 w-36 rounded-lg" />
            </div>
          </div>
          
          {/* Reminder cards skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-frosted rounded-xl p-6" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="skeleton-shimmer h-10 w-10 rounded-lg" />
                  <div className="space-y-2">
                    <div className="skeleton-shimmer h-5 w-32 rounded" />
                    <div className="skeleton-shimmer h-3 w-24 rounded" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="skeleton-shimmer h-8 w-8 rounded-lg" />
                        <div className="space-y-1">
                          <div className="skeleton-shimmer h-4 w-28 rounded" />
                          <div className="skeleton-shimmer h-3 w-20 rounded" />
                        </div>
                      </div>
                      <div className="skeleton-shimmer h-6 w-10 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  const canCustomize = tier === 'business' || tier === 'corporate';

  return (
    <PageLayout title="Tax Reminders" description="Stay on top of your tax filing deadlines" icon={Bell} maxWidth="4xl">
      {/* Success Celebration with Confetti */}
      <SuccessCelebration 
        isVisible={reminderFormFeedback.isSuccess} 
        message={reminderFormFeedback.message}
        description={reminderFormFeedback.description}
        onComplete={reminderFormFeedback.reset}
      />
      
      {/* Notification Permission Card */}
      {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && (
        <Card className="mb-6 glass-frosted border-primary/20 glow-sm">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10 animate-pulse">
                  <BellRing className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Enable Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when reminders are due
                  </p>
                </div>
              </div>
              <Button onClick={handleEnableNotifications} size="sm" className="shrink-0 glow-sm">
                <Volume2 className="w-4 h-4 mr-2" />
                Enable Notifications
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {notificationPermission === 'granted' && (
        <Card className="mb-6 glass-frosted border-success/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-success/10">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">Push Notifications Enabled</p>
                <p className="text-sm text-muted-foreground">
                  You'll receive sound and push notifications when reminders are due
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Businesses State */}
      {savedBusinesses.length === 0 ? (
        <Card className="text-center glass-frosted shadow-futuristic">
          <CardContent className="py-12">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-float" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Businesses Yet</h3>
            <p className="text-muted-foreground mb-6">
              Add a business first to set up tax reminders
            </p>
            <Button asChild className="glow-sm">
              <Link to="/businesses">
                <Plus className="w-4 h-4 mr-2" />
                Add Business
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {savedBusinesses.map((business) => {
            const businessReminders = getBusinessReminders(business.id);
            
            return (
              <Card key={business.id} className="glass-frosted">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{business.name}</CardTitle>
                        <CardDescription>{business.entityType === 'company' ? 'Limited Company' : 'Business Name'}</CardDescription>
                      </div>
                    </div>
                    {canCustomize && (
                      <Dialog open={customReminderOpen && selectedBusiness?.id === business.id} onOpenChange={(open) => {
                        setCustomReminderOpen(open);
                        if (open) setSelectedBusiness(business);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Custom
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Custom Reminder</DialogTitle>
                            <DialogDescription>Set a custom tax reminder for {business.name}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label>Reminder Name</Label>
                              <Input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="e.g., TIN Renewal" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Due Date</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !customDate && "text-muted-foreground")}>
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {customDate ? format(customDate, "PPP") : "Pick a date"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={customDate} onSelect={setCustomDate} initialFocus />
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <div>
                                <Label>Time</Label>
                                <Input type="time" value={customTime} onChange={(e) => setCustomTime(e.target.value)} />
                              </div>
                            </div>
                            <div>
                              <Label>Note (Optional)</Label>
                              <Textarea value={customNote} onChange={(e) => setCustomNote(e.target.value)} placeholder="Add any notes..." />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={addCustomReminder} disabled={!customName || !customDate}>Add Reminder</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {DEFAULT_REMINDERS.map((template, index) => (
                      <div key={template.type} className={`flex items-center justify-between p-3 rounded-lg glass hover-lift stagger-${Math.min(index + 1, 4)}`}>
                        <div className="flex items-center gap-3">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground text-sm">{template.name}</p>
                            <p className="text-xs text-muted-foreground">{template.dueDate}</p>
                          </div>
                        </div>
                        <Switch
                          checked={isReminderEnabled(business.id, template.type)}
                          onCheckedChange={() => toggleReminder(business.id, template.type)}
                        />
                      </div>
                    ))}
                    
                    {/* Custom reminders */}
                    {businessReminders.filter(r => r.type === 'custom').map((reminder) => (
                      <div key={reminder.id} className="flex items-center justify-between p-3 rounded-lg glass border border-accent/20 hover-lift">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-xs">Custom</Badge>
                          <div>
                            <p className="font-medium text-foreground text-sm">{reminder.name}</p>
                            <p className="text-xs text-muted-foreground">{formatDueDate(reminder.dueDate)}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deleteReminder(reminder.id)}>
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteWithUndo.showDialog}
        onOpenChange={(open) => !open && handleCancelDelete()}
        onConfirm={handleConfirmDelete}
        title="Delete Reminder"
        itemName={deleteWithUndo.itemToDelete?.name}
      />
    </PageLayout>
  );
};

export default Reminders;
