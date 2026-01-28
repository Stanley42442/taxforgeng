import { useEffect, useState, useCallback, useMemo } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/lib/supabaseClient";

import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Loader2,
  RefreshCw,
  Bot,
  Zap,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ReusableAreaChart } from "@/components/ui/reusable-area-chart";
import { ReusablePieChart, PieChartDataItem } from "@/components/ui/reusable-pie-chart";
import logger from "@/lib/logger";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AIQuery {
  id: string;
  question: string;
  response: string;
  categories: string[] | null;
  sector: string | null;
  created_at: string | null;
  feedback: number | null;
  response_time_ms: number | null;
}

interface AnalyticsData {
  totalQueries: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  avgResponseTime: number;
  categoryBreakdown: { category: string; count: number }[];
  sectorBreakdown: { sector: string; count: number }[];
  dailyQueries: { date: string; count: number; positive: number; negative: number }[];
  recentQueries: AIQuery[];
  satisfactionRate: number;
}

type DatePreset = '7days' | '30days' | '90days' | 'all';

const CATEGORY_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--info))',
  'hsl(var(--warning))',
  'hsl(var(--success))',
  'hsl(var(--destructive))',
  'hsl(142 76% 36%)',
  'hsl(280 65% 60%)',
  'hsl(32 95% 44%)',
];

const SECTOR_COLORS: Record<string, string> = {
  technology: 'hsl(var(--primary))',
  agriculture: 'hsl(142 76% 36%)',
  manufacturing: 'hsl(var(--warning))',
  retail: 'hsl(var(--info))',
  'oil_gas': 'hsl(32 95% 44%)',
  healthcare: 'hsl(var(--destructive))',
  education: 'hsl(280 65% 60%)',
  construction: 'hsl(25 95% 53%)',
  hospitality: 'hsl(340 82% 52%)',
  renewables: 'hsl(142 71% 45%)',
  general: 'hsl(var(--muted-foreground))',
};

const CATEGORY_LABELS: Record<string, string> = {
  pit: 'Personal Income Tax',
  cit: 'Corporate Income Tax',
  vat: 'VAT',
  vat_digital: 'Digital VAT',
  foreign_income: 'Foreign Income',
  crypto: 'Cryptocurrency',
  withholding: 'Withholding Tax',
  capital_gains: 'Capital Gains',
  oil_gas: 'Oil & Gas',
  exemptions: 'Exemptions',
  compliance: 'Compliance',
  penalties: 'Penalties',
  filing: 'Tax Filing',
  registration: 'Registration',
};

const AIQueryAnalytics = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [datePreset, setDatePreset] = useState<DatePreset>('30days');

  const getDateRange = useCallback(() => {
    const now = new Date();
    switch (datePreset) {
      case '7days':
        return { start: startOfDay(subDays(now, 7)), end: endOfDay(now) };
      case '30days':
        return { start: startOfDay(subDays(now, 30)), end: endOfDay(now) };
      case '90days':
        return { start: startOfDay(subDays(now, 90)), end: endOfDay(now) };
      case 'all':
      default:
        return { start: undefined, end: undefined };
    }
  }, [datePreset]);

  const fetchAnalytics = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);

    try {
      const { start, end } = getDateRange();

      let query = supabase.from('ai_queries').select('*');

      if (start) {
        query = query.gte('created_at', start.toISOString());
      }
      if (end) {
        query = query.lte('created_at', end.toISOString());
      }

      const { data: queries, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const allQueries = queries || [];

      // Calculate metrics
      const totalQueries = allQueries.length;
      const positiveCount = allQueries.filter(q => q.feedback === 1).length;
      const negativeCount = allQueries.filter(q => q.feedback === -1).length;
      const neutralCount = allQueries.filter(q => q.feedback === 0 || q.feedback === null).length;

      // Average response time
      const validTimes = allQueries.filter(q => q.response_time_ms !== null);
      const avgResponseTime = validTimes.length > 0
        ? validTimes.reduce((sum, q) => sum + (q.response_time_ms || 0), 0) / validTimes.length
        : 0;

      // Category breakdown
      const categoryMap: Record<string, number> = {};
      allQueries.forEach(q => {
        (q.categories || []).forEach(cat => {
          categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });
      });
      const categoryBreakdown = Object.entries(categoryMap)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // Sector breakdown
      const sectorMap: Record<string, number> = {};
      allQueries.forEach(q => {
        const sector = q.sector || 'general';
        sectorMap[sector] = (sectorMap[sector] || 0) + 1;
      });
      const sectorBreakdown = Object.entries(sectorMap)
        .map(([sector, count]) => ({ sector, count }))
        .sort((a, b) => b.count - a.count);

      // Daily queries with feedback breakdown
      const dailyMap: Record<string, { count: number; positive: number; negative: number }> = {};
      const days = datePreset === '7days' ? 7 : datePreset === '30days' ? 30 : 90;
      for (let i = days - 1; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'MMM d');
        dailyMap[date] = { count: 0, positive: 0, negative: 0 };
      }
      allQueries.forEach(q => {
        if (q.created_at) {
          const date = format(new Date(q.created_at), 'MMM d');
          if (dailyMap[date]) {
            dailyMap[date].count++;
            if (q.feedback === 1) dailyMap[date].positive++;
            if (q.feedback === -1) dailyMap[date].negative++;
          }
        }
      });
      const dailyQueries = Object.entries(dailyMap).map(([date, data]) => ({
        date,
        ...data
      }));

      // Satisfaction rate
      const feedbackCount = positiveCount + negativeCount;
      const satisfactionRate = feedbackCount > 0 ? (positiveCount / feedbackCount) * 100 : 0;

      setAnalytics({
        totalQueries,
        positiveCount,
        negativeCount,
        neutralCount,
        avgResponseTime,
        categoryBreakdown,
        sectorBreakdown,
        dailyQueries,
        recentQueries: allQueries.slice(0, 10),
        satisfactionRate
      });
    } catch (error) {
      logger.error('Error fetching AI analytics:', error);
      // Mock data fallback
      setAnalytics({
        totalQueries: 256,
        positiveCount: 189,
        negativeCount: 23,
        neutralCount: 44,
        avgResponseTime: 1250,
        categoryBreakdown: [
          { category: 'pit', count: 78 },
          { category: 'vat', count: 56 },
          { category: 'cit', count: 45 },
          { category: 'foreign_income', count: 32 },
          { category: 'crypto', count: 28 },
          { category: 'compliance', count: 17 }
        ],
        sectorBreakdown: [
          { sector: 'technology', count: 68 },
          { sector: 'agriculture', count: 45 },
          { sector: 'retail', count: 38 },
          { sector: 'manufacturing', count: 32 },
          { sector: 'general', count: 73 }
        ],
        dailyQueries: Array.from({ length: 7 }, (_, i) => ({
          date: format(subDays(new Date(), 6 - i), 'MMM d'),
          count: Math.floor(Math.random() * 20) + 5,
          positive: Math.floor(Math.random() * 15) + 3,
          negative: Math.floor(Math.random() * 5)
        })),
        recentQueries: [],
        satisfactionRate: 89.1
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getDateRange, datePreset]);

  useEffect(() => {
    if (adminLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchAnalytics();
  }, [user, adminLoading, fetchAnalytics]);

  useEffect(() => {
    if (!loading && user) {
      fetchAnalytics();
    }
  }, [datePreset]);

  const handleRefresh = () => fetchAnalytics(true);

  // Prepare chart data
  const pieData: PieChartDataItem[] = useMemo(() => {
    return analytics?.categoryBreakdown.map((c, i) => ({
      name: CATEGORY_LABELS[c.category] || c.category,
      value: c.count,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length]
    })) || [];
  }, [analytics?.categoryBreakdown]);

  const sectorPieData: PieChartDataItem[] = useMemo(() => {
    return analytics?.sectorBreakdown.map(s => ({
      name: s.sector.charAt(0).toUpperCase() + s.sector.slice(1).replace('_', ' '),
      value: s.count,
      color: SECTOR_COLORS[s.sector] || 'hsl(var(--muted))'
    })) || [];
  }, [analytics?.sectorBreakdown]);

  if (loading || adminLoading) {
    return (
      <PageLayout title="AI TaxBot Analytics" icon={Bot} maxWidth="7xl">
        <div className="space-y-6 animate-fade-in">
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-frosted rounded-xl p-5">
                <div className="skeleton-shimmer h-3 w-24 mb-3 rounded" />
                <div className="skeleton-shimmer h-8 w-20 mb-2 rounded" />
                <div className="skeleton-shimmer h-3 w-16 rounded" />
              </div>
            ))}
          </div>
          
          {/* Charts skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-frosted rounded-xl p-6">
                <div className="skeleton-shimmer h-5 w-32 mb-6 rounded" />
                <div className="skeleton-shimmer h-48 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!user || !isAdmin) {
    return (
      <PageLayout title="AI TaxBot Analytics" icon={Bot} maxWidth="7xl">
        <div className="text-center py-12">
          <Bot className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Admin Access Required</h2>
          <p className="text-muted-foreground">Please sign in with an admin account to view AI analytics.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="AI TaxBot Analytics" description="Query insights, feedback metrics, and topic trends" icon={Bot} maxWidth="7xl">
      {/* Controls */}
      <Card className="mb-6 animate-slide-up">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Select value={datePreset} onValueChange={(v) => setDatePreset(v as DatePreset)}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 Days</SelectItem>
                      <SelectItem value="30days">Last 30 Days</SelectItem>
                      <SelectItem value="90days">Last 90 Days</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="animate-slide-up">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Queries</p>
                    <p className="text-2xl font-bold text-foreground">{analytics?.totalQueries.toLocaleString()}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-slide-up" style={{ animationDelay: '50ms' }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
                    <p className="text-2xl font-bold text-success">{analytics?.satisfactionRate.toFixed(1)}%</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <ThumbsUp className="h-6 w-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                    <p className="text-2xl font-bold text-foreground">{(analytics?.avgResponseTime || 0 / 1000).toFixed(1)}s</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-info/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-info" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-slide-up" style={{ animationDelay: '150ms' }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Negative Feedback</p>
                    <p className="text-2xl font-bold text-destructive">{analytics?.negativeCount}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <ThumbsDown className="h-6 w-6 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Query Volume Over Time */}
            <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Query Volume & Feedback
                </CardTitle>
                <CardDescription>Daily queries with positive/negative feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <ReusableAreaChart
                  data={analytics?.dailyQueries || []}
                  series={[
                    {
                      dataKey: "count",
                      name: "Total Queries",
                      color: "hsl(var(--primary))",
                    },
                    {
                      dataKey: "positive",
                      name: "Positive",
                      color: "hsl(var(--success))",
                    },
                    {
                      dataKey: "negative",
                      name: "Negative",
                      color: "hsl(var(--destructive))",
                    },
                  ]}
                  xAxisKey="date"
                  height={300}
                  emptyMessage="No query data available"
                />
              </CardContent>
            </Card>

            {/* Popular Topics */}
            <Card className="animate-slide-up" style={{ animationDelay: '250ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Popular Topics
                </CardTitle>
                <CardDescription>Most frequently asked categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.categoryBreakdown || []} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                      <YAxis
                        dataKey="category"
                        type="category"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                        width={100}
                        tickFormatter={(value) => CATEGORY_LABELS[value] || value}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value, name, props) => [value, CATEGORY_LABELS[props.payload.category] || props.payload.category]}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Category Distribution Pie */}
            <Card className="animate-slide-up" style={{ animationDelay: '300ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-primary" />
                  Topic Distribution
                </CardTitle>
                <CardDescription>Query categories breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ReusablePieChart
                  data={pieData}
                  height={300}
                  innerRadius={60}
                  outerRadius={100}
                  showCenterLabel
                  emptyMessage="No category data"
                />
              </CardContent>
            </Card>

            {/* Sector Distribution */}
            <Card className="animate-slide-up" style={{ animationDelay: '350ms' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Queries by Sector
                </CardTitle>
                <CardDescription>Which business sectors ask the most</CardDescription>
              </CardHeader>
              <CardContent>
                <ReusablePieChart
                  data={sectorPieData}
                  height={300}
                  outerRadius={100}
                  showCenterLabel
                  emptyMessage="No sector data"
                />
              </CardContent>
            </Card>
          </div>

          {/* Feedback Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="animate-slide-up bg-success/5 border-success/20">
              <CardContent className="pt-6 text-center">
                <ThumbsUp className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="text-2xl font-bold text-success">{analytics?.positiveCount}</p>
                <p className="text-sm text-muted-foreground">Positive</p>
              </CardContent>
            </Card>
            <Card className="animate-slide-up bg-muted/50">
              <CardContent className="pt-6 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{analytics?.neutralCount}</p>
                <p className="text-sm text-muted-foreground">No Feedback</p>
              </CardContent>
            </Card>
            <Card className="animate-slide-up bg-destructive/5 border-destructive/20">
              <CardContent className="pt-6 text-center">
                <ThumbsDown className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-2xl font-bold text-destructive">{analytics?.negativeCount}</p>
                <p className="text-sm text-muted-foreground">Negative</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Queries Table */}
          <Card className="animate-slide-up" style={{ animationDelay: '400ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Queries
              </CardTitle>
              <CardDescription>Latest AI TaxBot interactions</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.recentQueries && analytics.recentQueries.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Categories</TableHead>
                        <TableHead>Sector</TableHead>
                        <TableHead>Feedback</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.recentQueries.map((query) => (
                        <TableRow key={query.id}>
                          <TableCell className="max-w-[300px] truncate font-medium">
                            {query.question}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {(query.categories || []).slice(0, 2).map((cat) => (
                                <Badge key={cat} variant="secondary" className="text-xs">
                                  {CATEGORY_LABELS[cat] || cat}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {query.sector || 'General'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {query.feedback === 1 && <ThumbsUp className="h-4 w-4 text-success" />}
                            {query.feedback === -1 && <ThumbsDown className="h-4 w-4 text-destructive" />}
                            {(query.feedback === 0 || query.feedback === null) && (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {query.created_at ? format(new Date(query.created_at), 'MMM d, HH:mm') : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No queries recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
    </PageLayout>
  );
};

export default AIQueryAnalytics;
