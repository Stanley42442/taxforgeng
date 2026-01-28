/**
 * Error Dashboard - Admin page for monitoring error logs and web vitals
 * 
 * Features:
 * - Error logs table with filtering
 * - Web Vitals summary cards with rating distribution
 * - Trend charts for metrics over time
 * - CSV export for offline analysis
 * - Pagination for large datasets
 */

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, subHours } from "date-fns";
import { 
  AlertTriangle, 
  Download, 
  RefreshCw, 
  Activity, 
  Clock, 
  Zap, 
  LayoutGrid,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Navigate } from "react-router-dom";
import { ErrorDashboardSkeleton } from "@/components/ui/premium-skeleton";

type DateRange = "24h" | "7d" | "30d";
type MetricName = "LCP" | "FID" | "CLS" | "INP" | "FCP" | "TTFB" | "all";

interface ErrorLog {
  id: string;
  error_message: string;
  error_stack: string | null;
  component_stack: string | null;
  page_url: string | null;
  user_agent: string | null;
  user_id: string | null;
  created_at: string;
}

interface WebVital {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_rating: string;
  page_url: string | null;
  connection_type: string | null;
  created_at: string;
}

const getDateFilter = (range: DateRange): Date => {
  switch (range) {
    case "24h": return subHours(new Date(), 24);
    case "7d": return subDays(new Date(), 7);
    case "30d": return subDays(new Date(), 30);
    default: return subDays(new Date(), 7);
  }
};

const getRatingColor = (rating: string): string => {
  switch (rating) {
    case "good": return "text-success bg-success/20";
    case "needs-improvement": return "text-warning bg-warning/20";
    case "poor": return "text-destructive bg-destructive/20";
    default: return "text-muted-foreground bg-muted";
  }
};

const getMetricThresholds = (metric: string): { good: number; poor: number; unit: string } => {
  switch (metric) {
    case "LCP": return { good: 2500, poor: 4000, unit: "ms" };
    case "FID": return { good: 100, poor: 300, unit: "ms" };
    case "CLS": return { good: 100, poor: 250, unit: "" }; // Stored as value * 1000
    case "INP": return { good: 200, poor: 500, unit: "ms" };
    case "FCP": return { good: 1800, poor: 3000, unit: "ms" };
    case "TTFB": return { good: 800, poor: 1800, unit: "ms" };
    default: return { good: 0, poor: 0, unit: "ms" };
  }
};

const formatMetricValue = (metric: string, value: number): string => {
  if (metric === "CLS") {
    return (value / 1000).toFixed(3);
  }
  return `${Math.round(value)}ms`;
};

const ErrorDashboard = () => {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [dateRange, setDateRange] = useState<DateRange>("7d");
  const [selectedMetric, setSelectedMetric] = useState<MetricName>("all");
  const [errorPage, setErrorPage] = useState(0);
  const pageSize = 20;

  // Fetch error logs
  const { data: errorLogs, isLoading: errorsLoading, refetch: refetchErrors } = useQuery({
    queryKey: ["error-logs", dateRange, errorPage],
    queryFn: async () => {
      const dateFilter = getDateFilter(dateRange);
      const { data, error } = await supabase
        .from("error_logs")
        .select("*")
        .gte("created_at", dateFilter.toISOString())
        .order("created_at", { ascending: false })
        .range(errorPage * pageSize, (errorPage + 1) * pageSize - 1);
      
      if (error) throw error;
      return data as ErrorLog[];
    },
    enabled: isAdmin,
  });

  // Fetch error count for pagination
  const { data: errorCount } = useQuery({
    queryKey: ["error-logs-count", dateRange],
    queryFn: async () => {
      const dateFilter = getDateFilter(dateRange);
      const { count, error } = await supabase
        .from("error_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", dateFilter.toISOString());
      
      if (error) throw error;
      return count || 0;
    },
    enabled: isAdmin,
  });

  // Fetch web vitals
  const { data: webVitals, isLoading: vitalsLoading, refetch: refetchVitals } = useQuery({
    queryKey: ["web-vitals", dateRange, selectedMetric],
    queryFn: async () => {
      const dateFilter = getDateFilter(dateRange);
      let query = supabase
        .from("web_vitals")
        .select("*")
        .gte("created_at", dateFilter.toISOString())
        .order("created_at", { ascending: false })
        .limit(1000);
      
      if (selectedMetric !== "all") {
        query = query.eq("metric_name", selectedMetric);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as WebVital[];
    },
    enabled: isAdmin,
  });

  // Calculate vitals summary
  const vitalsSummary = useMemo(() => {
    if (!webVitals) return {};
    
    const metrics = ["LCP", "FID", "CLS", "INP", "FCP", "TTFB"];
    const summary: Record<string, { avg: number; good: number; needsImprovement: number; poor: number; total: number }> = {};
    
    for (const metric of metrics) {
      const metricData = webVitals.filter(v => v.metric_name === metric);
      if (metricData.length === 0) continue;
      
      summary[metric] = {
        avg: metricData.reduce((sum, v) => sum + v.metric_value, 0) / metricData.length,
        good: metricData.filter(v => v.metric_rating === "good").length,
        needsImprovement: metricData.filter(v => v.metric_rating === "needs-improvement").length,
        poor: metricData.filter(v => v.metric_rating === "poor").length,
        total: metricData.length,
      };
    }
    
    return summary;
  }, [webVitals]);

  // Calculate error frequency by day
  const errorFrequency = useMemo(() => {
    if (!errorLogs) return [];
    
    const frequency: Record<string, number> = {};
    for (const log of errorLogs) {
      const date = format(new Date(log.created_at), "MMM dd");
      frequency[date] = (frequency[date] || 0) + 1;
    }
    
    return Object.entries(frequency)
      .map(([date, count]) => ({ date, count }))
      .reverse();
  }, [errorLogs]);

  // Export to CSV
  const exportErrorsCSV = () => {
    if (!errorLogs) return;
    
    const headers = ["Timestamp", "Error Message", "Page URL", "User Agent"];
    const rows = errorLogs.map(log => [
      log.created_at,
      log.error_message.replace(/"/g, '""'),
      log.page_url || "",
      log.user_agent || "",
    ]);
    
    const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `error-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const exportVitalsCSV = () => {
    if (!webVitals) return;
    
    const headers = ["Timestamp", "Metric", "Value", "Rating", "Page URL", "Connection"];
    const rows = webVitals.map(v => [
      v.created_at,
      v.metric_name,
      v.metric_value,
      v.metric_rating,
      v.page_url || "",
      v.connection_type || "",
    ]);
    
    const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `web-vitals-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  if (adminLoading) {
    return <ErrorDashboardSkeleton />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const totalPages = Math.ceil((errorCount || 0) / pageSize);

  return (
    <PageLayout 
      title="Error Dashboard" 
      description="Monitor production errors and performance metrics"
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => { refetchErrors(); refetchVitals(); }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="vitals" className="space-y-6">
          <TabsList>
            <TabsTrigger value="vitals" className="gap-2">
              <Activity className="h-4 w-4" />
              Web Vitals
            </TabsTrigger>
            <TabsTrigger value="errors" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Error Logs
              {errorCount ? (
                <Badge variant="secondary" className="ml-1">{errorCount}</Badge>
              ) : null}
            </TabsTrigger>
          </TabsList>

          {/* Web Vitals Tab */}
          <TabsContent value="vitals" className="space-y-6">
            {/* Metric Filter */}
            <div className="flex gap-4 items-center">
              <Select value={selectedMetric} onValueChange={(v) => setSelectedMetric(v as MetricName)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Metrics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Metrics</SelectItem>
                  <SelectItem value="LCP">LCP (Largest Contentful Paint)</SelectItem>
                  <SelectItem value="FID">FID (First Input Delay)</SelectItem>
                  <SelectItem value="CLS">CLS (Cumulative Layout Shift)</SelectItem>
                  <SelectItem value="INP">INP (Interaction to Next Paint)</SelectItem>
                  <SelectItem value="FCP">FCP (First Contentful Paint)</SelectItem>
                  <SelectItem value="TTFB">TTFB (Time to First Byte)</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={exportVitalsCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(vitalsSummary).map(([metric, data]) => {
                const thresholds = getMetricThresholds(metric);
                const goodPercent = Math.round((data.good / data.total) * 100);
                const trend = goodPercent >= 75 ? "up" : goodPercent >= 50 ? "neutral" : "down";
                
                return (
                  <Card key={metric} className="relative overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        {metric === "LCP" && <Clock className="h-3 w-3" />}
                        {metric === "INP" && <Zap className="h-3 w-3" />}
                        {metric === "CLS" && <LayoutGrid className="h-3 w-3" />}
                        {metric}
                      </CardDescription>
                      <CardTitle className="text-lg">
                        {formatMetricValue(metric, data.avg)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-1 text-xs">
                        {trend === "up" && <TrendingUp className="h-3 w-3 text-success" />}
                        {trend === "down" && <TrendingDown className="h-3 w-3 text-destructive" />}
                        {trend === "neutral" && <Minus className="h-3 w-3 text-warning" />}
                        <span className={trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-warning"}>
                          {goodPercent}% good
                        </span>
                      </div>
                      <div className="mt-2 flex gap-1">
                        <div 
                          className="h-1.5 rounded-full bg-success" 
                          style={{ width: `${(data.good / data.total) * 100}%` }} 
                        />
                        <div 
                          className="h-1.5 rounded-full bg-warning" 
                          style={{ width: `${(data.needsImprovement / data.total) * 100}%` }} 
                        />
                        <div 
                          className="h-1.5 rounded-full bg-destructive" 
                          style={{ width: `${(data.poor / data.total) * 100}%` }} 
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {data.total} samples
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Vitals Loading State */}
            {vitalsLoading && (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Empty State */}
            {!vitalsLoading && Object.keys(vitalsSummary).length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No web vitals data for this period</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Metrics are collected from production users only
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Error Logs Tab */}
          <TabsContent value="errors" className="space-y-6">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={exportErrorsCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Error Frequency Chart */}
            {errorFrequency.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Error Frequency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={errorFrequency}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "8px"
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Logs Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Errors</CardTitle>
                <CardDescription>
                  {errorCount || 0} errors in selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {errorsLoading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : errorLogs && errorLogs.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[150px]">Timestamp</TableHead>
                            <TableHead>Error Message</TableHead>
                            <TableHead className="w-[120px]">Page</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {errorLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                {format(new Date(log.created_at), "MMM dd, HH:mm")}
                              </TableCell>
                              <TableCell>
                                <p className="text-sm font-mono truncate max-w-[400px]" title={log.error_message}>
                                  {log.error_message}
                                </p>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {log.page_url || "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={errorPage === 0}
                          onClick={() => setErrorPage(p => p - 1)}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground py-2">
                          Page {errorPage + 1} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={errorPage >= totalPages - 1}
                          onClick={() => setErrorPage(p => p + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No errors recorded</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      That's a good thing! 🎉
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default ErrorDashboard;
