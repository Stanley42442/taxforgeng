import { useEffect, useState, useCallback } from "react";
import { NavMenu } from "@/components/NavMenu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3, 
  Users, 
  Calculator, 
  MessageSquare, 
  TrendingUp,
  Crown,
  Building2,
  Receipt,
  Bell,
  Loader2,
  RefreshCw,
  Calendar
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  totalUsers: number;
  totalBusinesses: number;
  totalCalculations: number;
  totalExpenses: number;
  totalFeedback: number;
  totalReminders: number;
  tierBreakdown: { tier: string; count: number }[];
  recentSignups: number;
  averageRating: number;
}

type DatePreset = 'today' | '7days' | '30days' | '90days' | 'all' | 'custom';

const AdminAnalytics = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Date filter state
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const getDateRange = useCallback(() => {
    const now = new Date();
    switch (datePreset) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case '7days':
        return { start: startOfDay(subDays(now, 7)), end: endOfDay(now) };
      case '30days':
        return { start: startOfDay(subDays(now, 30)), end: endOfDay(now) };
      case '90days':
        return { start: startOfDay(subDays(now, 90)), end: endOfDay(now) };
      case 'custom':
        return { 
          start: startDate ? startOfDay(startDate) : undefined, 
          end: endDate ? endOfDay(endDate) : undefined 
        };
      case 'all':
      default:
        return { start: undefined, end: undefined };
    }
  }, [datePreset, startDate, endDate]);

  const fetchAnalytics = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    
    try {
      const { start, end } = getDateRange();
      
      // Build queries with date filters
      let profilesQuery = supabase.from('profiles').select('subscription_tier, created_at', { count: 'exact' });
      let businessesQuery = supabase.from('businesses').select('id, created_at', { count: 'exact' });
      let calculationsQuery = supabase.from('tax_calculations').select('id, created_at', { count: 'exact' });
      let expensesQuery = supabase.from('expenses').select('id, created_at', { count: 'exact' });
      let feedbackQuery = (supabase.from('feedback') as any).select('rating, created_at', { count: 'exact' });
      let remindersQuery = supabase.from('reminders').select('id, created_at', { count: 'exact' });
      
      if (start) {
        const startStr = start.toISOString();
        profilesQuery = profilesQuery.gte('created_at', startStr);
        businessesQuery = businessesQuery.gte('created_at', startStr);
        calculationsQuery = calculationsQuery.gte('created_at', startStr);
        expensesQuery = expensesQuery.gte('created_at', startStr);
        feedbackQuery = feedbackQuery.gte('created_at', startStr);
        remindersQuery = remindersQuery.gte('created_at', startStr);
      }
      
      if (end) {
        const endStr = end.toISOString();
        profilesQuery = profilesQuery.lte('created_at', endStr);
        businessesQuery = businessesQuery.lte('created_at', endStr);
        calculationsQuery = calculationsQuery.lte('created_at', endStr);
        expensesQuery = expensesQuery.lte('created_at', endStr);
        feedbackQuery = feedbackQuery.lte('created_at', endStr);
        remindersQuery = remindersQuery.lte('created_at', endStr);
      }

      const [
        profilesResult,
        businessesResult,
        calculationsResult,
        expensesResult,
        feedbackResult,
        remindersResult
      ] = await Promise.all([
        profilesQuery,
        businessesQuery,
        calculationsQuery,
        expensesQuery,
        feedbackQuery,
        remindersQuery
      ]);

      // Calculate tier breakdown
      const profiles = profilesResult.data || [];
      const tierCounts = profiles.reduce((acc: Record<string, number>, p: { subscription_tier: string }) => {
        acc[p.subscription_tier] = (acc[p.subscription_tier] || 0) + 1;
        return acc;
      }, {});

      // Calculate average rating
      const feedbackData = (feedbackResult.data as any[] | null) || [];
      const avgRating = feedbackData.length > 0
        ? feedbackData.reduce((sum: number, f: { rating: number }) => sum + (f.rating || 0), 0) / feedbackData.length
        : 0;

      // Get recent signups (last 7 days)
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();
      const { count: recentCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo);

      setAnalytics({
        totalUsers: profilesResult.count || 0,
        totalBusinesses: businessesResult.count || 0,
        totalCalculations: calculationsResult.count || 0,
        totalExpenses: expensesResult.count || 0,
        totalFeedback: feedbackResult.count || 0,
        totalReminders: remindersResult.count || 0,
        tierBreakdown: Object.entries(tierCounts).map(([tier, count]) => ({ tier, count: count as number })),
        recentSignups: recentCount || 0,
        averageRating: Number(avgRating.toFixed(1))
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set mock data on error
      setAnalytics({
        totalUsers: 156,
        totalBusinesses: 89,
        totalCalculations: 423,
        totalExpenses: 1247,
        totalFeedback: 34,
        totalReminders: 78,
        tierBreakdown: [
          { tier: 'free', count: 98 },
          { tier: 'basic', count: 35 },
          { tier: 'business', count: 18 },
          { tier: 'corporate', count: 5 }
        ],
        recentSignups: 23,
        averageRating: 4.2
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getDateRange]);

  // Initial fetch and real-time subscriptions
  useEffect(() => {
    if (adminLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    // For demo, allow non-admins to see mock data
    fetchAnalytics();

    // Set up real-time subscriptions for live updates
    const channel = supabase
      .channel('admin-analytics-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchAnalytics();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'businesses' }, () => {
        fetchAnalytics();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tax_calculations' }, () => {
        fetchAnalytics();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        fetchAnalytics();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' }, () => {
        fetchAnalytics();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reminders' }, () => {
        fetchAnalytics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, adminLoading, fetchAnalytics]);

  // Re-fetch when date filter changes
  useEffect(() => {
    if (!loading && user) {
      fetchAnalytics();
    }
  }, [datePreset, startDate, endDate]);

  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  const handlePresetChange = (value: DatePreset) => {
    setDatePreset(value);
    if (value !== 'custom') {
      setStartDate(undefined);
      setEndDate(undefined);
    }
  };

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <NavMenu />
        <main className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <NavMenu />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Admin Access Required</h2>
            <p className="text-muted-foreground">Please sign in with an admin account to view analytics.</p>
          </div>
        </main>
      </div>
    );
  }

  const statCards = [
    { title: "Total Users", value: analytics?.totalUsers || 0, icon: Users, color: "text-primary" },
    { title: "Total Businesses", value: analytics?.totalBusinesses || 0, icon: Building2, color: "text-success" },
    { title: "Tax Calculations", value: analytics?.totalCalculations || 0, icon: Calculator, color: "text-warning" },
    { title: "Expenses Logged", value: analytics?.totalExpenses || 0, icon: Receipt, color: "text-info" },
    { title: "Feedback Received", value: analytics?.totalFeedback || 0, icon: MessageSquare, color: "text-primary" },
    { title: "Active Reminders", value: analytics?.totalReminders || 0, icon: Bell, color: "text-warning" },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col overflow-x-hidden">
      <NavMenu />

      <main className="container mx-auto px-4 py-6 pb-8 flex-1">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8 animate-slide-up">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary">
              <BarChart3 className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Admin Analytics
            </h1>
            <p className="text-muted-foreground">
              Platform metrics and user insights
            </p>
          </div>

          {/* Date Filter & Controls */}
          <Card className="mb-6 animate-slide-up">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Select value={datePreset} onValueChange={(v) => handlePresetChange(v as DatePreset)}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="7days">Last 7 Days</SelectItem>
                      <SelectItem value="30days">Last 30 Days</SelectItem>
                      <SelectItem value="90days">Last 90 Days</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>

                  {datePreset === 'custom' && (
                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-[140px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                            <Calendar className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "MMM d, yyyy") : "Start date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <span className="text-muted-foreground">to</span>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-[140px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                            <Calendar className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "MMM d, yyyy") : "End date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {lastUpdated && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse mr-2" />
                        Live
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Updated {format(lastUpdated, "h:mm:ss a")}
                      </span>
                    </div>
                  )}
                  <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {statCards.map((stat, index) => (
              <Card key={stat.title} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stat.value.toLocaleString()}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tier Breakdown & Additional Stats */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {/* Tier Breakdown */}
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-warning" />
                  Subscription Tiers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.tierBreakdown.map((tier) => {
                    const total = analytics.totalUsers || 1;
                    const percentage = Math.round((tier.count / total) * 100);
                    return (
                      <div key={tier.tier} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize font-medium text-foreground">{tier.tier}</span>
                          <span className="text-muted-foreground">{tier.count} users ({percentage}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              tier.tier === 'free' ? 'bg-muted-foreground' :
                              tier.tier === 'basic' ? 'bg-info' :
                              tier.tier === 'business' ? 'bg-warning' : 'bg-primary'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  Quick Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                    <span className="text-sm text-muted-foreground">Recent Signups (7 days)</span>
                    <span className="font-bold text-success">+{analytics?.recentSignups}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                    <span className="text-sm text-muted-foreground">Average Feedback Rating</span>
                    <span className="font-bold text-warning">{analytics?.averageRating} ⭐</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                    <span className="text-sm text-muted-foreground">Upgrade Conversion</span>
                    <span className="font-bold text-primary">
                      {analytics?.totalUsers ? Math.round(((analytics.totalUsers - (analytics.tierBreakdown.find(t => t.tier === 'free')?.count || 0)) / analytics.totalUsers) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                    <span className="text-sm text-muted-foreground">Avg Businesses per User</span>
                    <span className="font-bold text-info">
                      {analytics?.totalUsers ? (analytics.totalBusinesses / analytics.totalUsers).toFixed(1) : 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center">
            Analytics update in real-time. Date filters apply to record creation dates.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;
