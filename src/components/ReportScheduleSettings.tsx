import { useState, useEffect } from "react";
import logger from "@/lib/logger";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Mail, Calendar, Clock, Loader2 } from "lucide-react";

interface ReportSchedule {
  id?: string;
  schedule_type: 'weekly' | 'monthly';
  is_enabled: boolean;
  day_of_week?: number;
  day_of_month?: number;
  preferred_hour: number;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${i.toString().padStart(2, '0')}:00`,
}));

const DAYS_OF_MONTH = Array.from({ length: 28 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}${getOrdinalSuffix(i + 1)}`,
}));

function getOrdinalSuffix(n: number): string {
  if (n > 3 && n < 21) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

export const ReportScheduleSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [weeklySchedule, setWeeklySchedule] = useState<ReportSchedule>({
    schedule_type: 'weekly',
    is_enabled: false,
    day_of_week: 1, // Monday
    preferred_hour: 9,
  });
  const [monthlySchedule, setMonthlySchedule] = useState<ReportSchedule>({
    schedule_type: 'monthly',
    is_enabled: false,
    day_of_month: 1,
    preferred_hour: 9,
  });

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('report_schedules')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;

        const weekly = data?.find(s => s.schedule_type === 'weekly');
        const monthly = data?.find(s => s.schedule_type === 'monthly');

        if (weekly) {
          setWeeklySchedule({
            id: weekly.id,
            schedule_type: 'weekly',
            is_enabled: weekly.is_enabled,
            day_of_week: weekly.day_of_week ?? 1,
            preferred_hour: weekly.preferred_hour,
          });
        }

        if (monthly) {
          setMonthlySchedule({
            id: monthly.id,
            schedule_type: 'monthly',
            is_enabled: monthly.is_enabled,
            day_of_month: monthly.day_of_month ?? 1,
            preferred_hour: monthly.preferred_hour,
          });
        }
      } catch (error) {
        logger.error('Error fetching schedules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [user]);

  const saveSchedule = async (schedule: ReportSchedule) => {
    if (!user) return;
    setSaving(true);

    try {
      const payload = {
        user_id: user.id,
        schedule_type: schedule.schedule_type,
        is_enabled: schedule.is_enabled,
        day_of_week: schedule.schedule_type === 'weekly' ? schedule.day_of_week : null,
        day_of_month: schedule.schedule_type === 'monthly' ? schedule.day_of_month : null,
        preferred_hour: schedule.preferred_hour,
      };

      if (schedule.id) {
        const { error } = await supabase
          .from('report_schedules')
          .update(payload)
          .eq('id', schedule.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('report_schedules')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        
        if (schedule.schedule_type === 'weekly') {
          setWeeklySchedule(prev => ({ ...prev, id: data.id }));
        } else {
          setMonthlySchedule(prev => ({ ...prev, id: data.id }));
        }
      }

      toast.success(`${schedule.schedule_type === 'weekly' ? 'Weekly' : 'Monthly'} report schedule saved`);
    } catch (error) {
      logger.error('Error saving schedule:', error);
      toast.error('Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass-frosted">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="glass-frosted border-border/40">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Scheduled Email Reports</CardTitle>
              <CardDescription>Receive automatic financial summaries via email</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Weekly Report */}
          <div className="p-4 rounded-xl bg-secondary/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Weekly Report</p>
                  <p className="text-sm text-muted-foreground">Sent every week on your chosen day</p>
                </div>
              </div>
              <Switch
                checked={weeklySchedule.is_enabled}
                onCheckedChange={(checked) => {
                  const updated = { ...weeklySchedule, is_enabled: checked };
                  setWeeklySchedule(updated);
                  saveSchedule(updated);
                }}
              />
            </div>

            {weeklySchedule.is_enabled && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Day of Week</Label>
                  <Select
                    value={weeklySchedule.day_of_week?.toString()}
                    onValueChange={(v) => {
                      const updated = { ...weeklySchedule, day_of_week: parseInt(v, 10) };
                      setWeeklySchedule(updated);
                      saveSchedule(updated);
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map(day => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Time (UTC)</Label>
                  <Select
                    value={weeklySchedule.preferred_hour.toString()}
                    onValueChange={(v) => {
                      const updated = { ...weeklySchedule, preferred_hour: parseInt(v, 10) };
                      setWeeklySchedule(updated);
                      saveSchedule(updated);
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <Clock className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map(hour => (
                        <SelectItem key={hour.value} value={hour.value.toString()}>
                          {hour.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Monthly Report */}
          <div className="p-4 rounded-xl bg-secondary/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-accent" />
                <div>
                  <p className="font-medium">Monthly Report</p>
                  <p className="text-sm text-muted-foreground">Sent once a month on your chosen date</p>
                </div>
              </div>
              <Switch
                checked={monthlySchedule.is_enabled}
                onCheckedChange={(checked) => {
                  const updated = { ...monthlySchedule, is_enabled: checked };
                  setMonthlySchedule(updated);
                  saveSchedule(updated);
                }}
              />
            </div>

            {monthlySchedule.is_enabled && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Day of Month</Label>
                  <Select
                    value={monthlySchedule.day_of_month?.toString()}
                    onValueChange={(v) => {
                      const updated = { ...monthlySchedule, day_of_month: parseInt(v, 10) };
                      setMonthlySchedule(updated);
                      saveSchedule(updated);
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_MONTH.map(day => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Time (UTC)</Label>
                  <Select
                    value={monthlySchedule.preferred_hour.toString()}
                    onValueChange={(v) => {
                      const updated = { ...monthlySchedule, preferred_hour: parseInt(v, 10) };
                      setMonthlySchedule(updated);
                      saveSchedule(updated);
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <Clock className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map(hour => (
                        <SelectItem key={hour.value} value={hour.value.toString()}>
                          {hour.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center pt-2">
            Reports include income, expenses, business summaries, and upcoming reminders
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
