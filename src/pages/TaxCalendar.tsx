import { useState, useMemo } from "react";
import { toast } from "sonner";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Bell,
  FileText,
  Building2,
  Users,
  DollarSign,
  Download,
  AlertCircle,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from "date-fns";

interface TaxDeadline {
  id: string;
  title: string;
  date: Date;
  type: "vat" | "cit" | "pit" | "paye" | "wht" | "other";
  description?: string;
  isRecurring?: boolean;
}

const TAX_TYPE_CONFIG = {
  vat: { color: "bg-blue-500", icon: FileText, label: "VAT" },
  cit: { color: "bg-green-500", icon: Building2, label: "CIT" },
  pit: { color: "bg-orange-500", icon: Users, label: "PIT" },
  paye: { color: "bg-purple-500", icon: DollarSign, label: "PAYE" },
  wht: { color: "bg-red-500", icon: FileText, label: "WHT" },
  other: { color: "bg-gray-500", icon: Bell, label: "Other" },
};

const getStandardDeadlines = (year: number): TaxDeadline[] => [
  { id: "vat-jan", title: "VAT Returns (Previous Month)", date: new Date(year, 0, 21), type: "vat", isRecurring: true },
  { id: "vat-feb", title: "VAT Returns (Previous Month)", date: new Date(year, 1, 21), type: "vat", isRecurring: true },
  { id: "vat-mar", title: "VAT Returns (Previous Month)", date: new Date(year, 2, 21), type: "vat", isRecurring: true },
  { id: "vat-apr", title: "VAT Returns (Previous Month)", date: new Date(year, 3, 21), type: "vat", isRecurring: true },
  { id: "vat-may", title: "VAT Returns (Previous Month)", date: new Date(year, 4, 21), type: "vat", isRecurring: true },
  { id: "vat-jun", title: "VAT Returns (Previous Month)", date: new Date(year, 5, 21), type: "vat", isRecurring: true },
  { id: "vat-jul", title: "VAT Returns (Previous Month)", date: new Date(year, 6, 21), type: "vat", isRecurring: true },
  { id: "vat-aug", title: "VAT Returns (Previous Month)", date: new Date(year, 7, 21), type: "vat", isRecurring: true },
  { id: "vat-sep", title: "VAT Returns (Previous Month)", date: new Date(year, 8, 21), type: "vat", isRecurring: true },
  { id: "vat-oct", title: "VAT Returns (Previous Month)", date: new Date(year, 9, 21), type: "vat", isRecurring: true },
  { id: "vat-nov", title: "VAT Returns (Previous Month)", date: new Date(year, 10, 21), type: "vat", isRecurring: true },
  { id: "vat-dec", title: "VAT Returns (Previous Month)", date: new Date(year, 11, 21), type: "vat", isRecurring: true },
  { id: "cit-annual", title: "CIT Annual Return", date: new Date(year, 5, 30), type: "cit", description: "Annual Company Income Tax return" },
  { id: "pit-annual", title: "PIT Annual Return", date: new Date(year, 2, 31), type: "pit", description: "Personal Income Tax annual filing" },
  { id: "paye-jan", title: "PAYE Monthly Remittance", date: new Date(year, 0, 10), type: "paye", isRecurring: true },
  { id: "paye-feb", title: "PAYE Monthly Remittance", date: new Date(year, 1, 10), type: "paye", isRecurring: true },
  { id: "paye-mar", title: "PAYE Monthly Remittance", date: new Date(year, 2, 10), type: "paye", isRecurring: true },
  { id: "paye-apr", title: "PAYE Monthly Remittance", date: new Date(year, 3, 10), type: "paye", isRecurring: true },
  { id: "paye-may", title: "PAYE Monthly Remittance", date: new Date(year, 4, 10), type: "paye", isRecurring: true },
  { id: "paye-jun", title: "PAYE Monthly Remittance", date: new Date(year, 5, 10), type: "paye", isRecurring: true },
  { id: "paye-jul", title: "PAYE Monthly Remittance", date: new Date(year, 6, 10), type: "paye", isRecurring: true },
  { id: "paye-aug", title: "PAYE Monthly Remittance", date: new Date(year, 7, 10), type: "paye", isRecurring: true },
  { id: "paye-sep", title: "PAYE Monthly Remittance", date: new Date(year, 8, 10), type: "paye", isRecurring: true },
  { id: "paye-oct", title: "PAYE Monthly Remittance", date: new Date(year, 9, 10), type: "paye", isRecurring: true },
  { id: "paye-nov", title: "PAYE Monthly Remittance", date: new Date(year, 10, 10), type: "paye", isRecurring: true },
  { id: "paye-dec", title: "PAYE Monthly Remittance", date: new Date(year, 11, 10), type: "paye", isRecurring: true },
];

const TaxCalendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: userReminders } = useQuery({
    queryKey: ["reminders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_completed", false);
      return data || [];
    },
    enabled: !!user,
  });

  const year = currentDate.getFullYear();
  const standardDeadlines = useMemo(() => getStandardDeadlines(year), [year]);

  const allDeadlines = useMemo(() => {
    const userDeadlines: TaxDeadline[] = (userReminders || []).map((r) => ({
      id: r.id,
      title: r.title,
      date: new Date(r.due_date),
      type: r.reminder_type as TaxDeadline["type"],
      description: r.description || undefined,
    }));
    return [...standardDeadlines, ...userDeadlines];
  }, [standardDeadlines, userReminders]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = monthStart.getDay();
  const paddedDays = [...Array(startDay).fill(null), ...days];

  const getDeadlinesForDate = (date: Date) => {
    return allDeadlines.filter((d) => isSameDay(d.date, date));
  };

  const selectedDeadlines = selectedDate ? getDeadlinesForDate(selectedDate) : [];

  const upcomingDeadlines = useMemo(() => {
    const today = new Date();
    return allDeadlines
      .filter((d) => d.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  }, [allDeadlines]);

  const exportToICS = () => {
    import("@/lib/taxCalendarExport").then(({ exportTaxCalendarICS }) => {
      exportTaxCalendarICS(allDeadlines);
      toast.success("Calendar exported successfully");
    });
  };

  return (
    <PageLayout 
      title="Tax Calendar" 
      description="Track important tax deadlines and filing dates" 
      icon={Calendar} 
      maxWidth="6xl"
      headerActions={
        <Button onClick={exportToICS} variant="outline" className="gap-2 hover-lift">
          <Download className="h-4 w-4" />
          Export
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="glass-frosted shadow-futuristic lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {format(currentDate, "MMMM yyyy")}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="hover-lift">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="hover-lift">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {paddedDays.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="h-16" />;
                }

                const deadlines = getDeadlinesForDate(day);
                const hasDeadlines = deadlines.length > 0;
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={`h-16 p-1 rounded-lg border transition-all hover-lift ${
                          isToday(day)
                            ? 'border-primary bg-primary/10 glow-sm'
                            : isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-transparent hover:bg-secondary/50 hover:glass'
                        } ${!isSameMonth(day, currentDate) ? 'opacity-50' : ''}`}
                      >
                    <span className={`text-sm font-medium ${isToday(day) ? "text-primary" : "text-foreground"}`}>
                      {format(day, "d")}
                    </span>
                    {hasDeadlines && (
                      <div className="flex gap-0.5 mt-1 flex-wrap">
                        {deadlines.slice(0, 3).map((d) => (
                          <div key={d.id} className={`h-1.5 w-1.5 rounded-full ${TAX_TYPE_CONFIG[d.type].color}`} />
                        ))}
                        {deadlines.length > 3 && (
                          <span className="text-[8px] text-muted-foreground">+{deadlines.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border">
              {Object.entries(TAX_TYPE_CONFIG).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <div className={`h-3 w-3 rounded-full ${config.color}`} />
                  <span className="text-muted-foreground">{config.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Details */}
          {selectedDate && (
            <Card className="glass-frosted shadow-futuristic animate-slide-up">
              <CardHeader>
                <CardTitle className="text-base">{format(selectedDate, "MMMM d, yyyy")}</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDeadlines.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No deadlines on this date</p>
                ) : (
                  <div className="space-y-3">
                    {selectedDeadlines.map((deadline) => {
                      const config = TAX_TYPE_CONFIG[deadline.type];
                      const Icon = config.icon;
                      return (
                        <div key={deadline.id} className="flex items-start gap-3 p-3 rounded-lg glass hover-lift">
                          <div className={`h-8 w-8 rounded-lg ${config.color} flex items-center justify-center shrink-0`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{deadline.title}</p>
                            {deadline.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">{deadline.description}</p>
                            )}
                            <Badge variant="secondary" className="mt-1 text-xs">{config.label}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Upcoming Deadlines */}
          <Card className="glass-frosted shadow-futuristic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertCircle className="h-4 w-4 text-warning animate-pulse" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingDeadlines.map((deadline, index) => {
                  const config = TAX_TYPE_CONFIG[deadline.type];
                  const daysUntil = Math.ceil((deadline.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={deadline.id} className={`flex items-center justify-between hover-lift p-2 rounded-lg glass stagger-${Math.min(index + 1, 5)}`}>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${config.color}`} />
                        <span className="text-sm font-medium truncate max-w-[150px]">{deadline.title}</span>
                      </div>
                      <Badge variant={daysUntil <= 7 ? "destructive" : "secondary"} className={`text-xs ${daysUntil <= 7 ? 'animate-pulse' : ''}`}>
                        {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default TaxCalendar;
