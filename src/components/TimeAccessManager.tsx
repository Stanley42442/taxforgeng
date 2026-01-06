import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Clock, 
  Calendar,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Info
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TimeAccessManagerProps {
  userId: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun', fullLabel: 'Sunday' },
  { value: 1, label: 'Mon', fullLabel: 'Monday' },
  { value: 2, label: 'Tue', fullLabel: 'Tuesday' },
  { value: 3, label: 'Wed', fullLabel: 'Wednesday' },
  { value: 4, label: 'Thu', fullLabel: 'Thursday' },
  { value: 5, label: 'Fri', fullLabel: 'Friday' },
  { value: 6, label: 'Sat', fullLabel: 'Saturday' },
];

const HOURS = Array.from({ length: 25 }, (_, i) => ({
  value: i,
  label: i === 24 ? '12:00 AM (next day)' : `${i === 0 ? 12 : i > 12 ? i - 12 : i}:00 ${i < 12 ? 'AM' : 'PM'}`
}));

const TIMEZONES = [
  'UTC',
  'Africa/Lagos',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
];

export const TimeAccessManager = ({ userId }: TimeAccessManagerProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [allowedDays, setAllowedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [startHour, setStartHour] = useState(0);
  const [endHour, setEndHour] = useState(24);
  const [timezone, setTimezone] = useState('UTC');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('time_restrictions_enabled, allowed_days, allowed_start_hour, allowed_end_hour, time_restriction_timezone')
          .eq('id', userId)
          .single();

        if (error) throw error;

        setEnabled(data?.time_restrictions_enabled || false);
        setAllowedDays(data?.allowed_days || [0, 1, 2, 3, 4, 5, 6]);
        setStartHour(data?.allowed_start_hour ?? 0);
        setEndHour(data?.allowed_end_hour ?? 24);
        setTimezone(data?.time_restriction_timezone || 'UTC');
      } catch (error) {
        console.error("Error loading time settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [userId]);

  const toggleDay = (day: number) => {
    setAllowedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const handleSave = async () => {
    // Validation
    if (enabled && allowedDays.length === 0) {
      toast.error("Please select at least one day");
      return;
    }

    if (enabled && startHour >= endHour) {
      toast.error("End time must be after start time");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          time_restrictions_enabled: enabled,
          allowed_days: allowedDays,
          allowed_start_hour: startHour,
          allowed_end_hour: endHour,
          time_restriction_timezone: timezone
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success("Time restrictions updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Check if current time is within allowed window
  const isCurrentTimeAllowed = () => {
    if (!enabled) return true;
    
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    
    return allowedDays.includes(day) && hour >= startHour && hour < endHour;
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Time-Based Access
            </CardTitle>
            <CardDescription>
              Restrict logins to specific hours and days
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
            />
            <Badge variant={enabled ? "default" : "secondary"}>
              {enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        {enabled && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            isCurrentTimeAllowed() 
              ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900'
              : 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900'
          }`}>
            {isCurrentTimeAllowed() ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-800 dark:text-green-200">
                  You can currently log in based on your time restrictions
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span className="text-sm text-amber-800 dark:text-amber-200">
                  Outside allowed login hours - logins would be blocked
                </span>
              </>
            )}
          </div>
        )}

        {/* Days Selection */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Allowed Days
          </Label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <Button
                key={day.value}
                type="button"
                variant={allowedDays.includes(day.value) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleDay(day.value)}
                disabled={!enabled}
                className="min-w-[60px]"
              >
                {day.label}
              </Button>
            ))}
          </div>
          {enabled && allowedDays.length === 0 && (
            <p className="text-xs text-destructive">Select at least one day</p>
          )}
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Time</Label>
            <Select
              value={String(startHour)}
              onValueChange={(v) => setStartHour(Number(v))}
              disabled={!enabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HOURS.slice(0, 24).map((hour) => (
                  <SelectItem key={hour.value} value={String(hour.value)}>
                    {hour.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>End Time</Label>
            <Select
              value={String(endHour)}
              onValueChange={(v) => setEndHour(Number(v))}
              disabled={!enabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HOURS.slice(1).map((hour) => (
                  <SelectItem key={hour.value} value={String(hour.value)}>
                    {hour.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <Label>Timezone</Label>
          <Select
            value={timezone}
            onValueChange={setTimezone}
            disabled={!enabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="text-xs text-muted-foreground">
            <p>When enabled, you can only log in during the specified hours and days.</p>
            <p className="mt-1">Existing sessions won't be affected until they expire.</p>
          </div>
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Time Restrictions"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
