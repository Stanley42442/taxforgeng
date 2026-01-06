import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { 
  Activity, 
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Globe
} from "lucide-react";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";

interface AuthEvent {
  id: string;
  event_type: string;
  ip_address: string | null;
  created_at: string;
  location?: {
    city?: string;
    country?: string;
  } | null;
}

interface SecurityAnalyticsProps {
  authEvents: AuthEvent[];
  loginHistory: AuthEvent[];
}

const CHART_COLORS = {
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  primary: '#8b5cf6',
  muted: '#6b7280'
};

export const SecurityAnalytics = ({ authEvents, loginHistory }: SecurityAnalyticsProps) => {
  // Login activity by day (last 14 days)
  const loginsByDay = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 13),
      end: new Date()
    });

    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const successLogins = authEvents.filter(e => {
        const eventDate = new Date(e.created_at);
        return (e.event_type === 'login' || e.event_type === 'login_success') &&
          eventDate >= dayStart && eventDate < dayEnd;
      }).length;

      const failedLogins = authEvents.filter(e => {
        const eventDate = new Date(e.created_at);
        return e.event_type === 'login_failed' &&
          eventDate >= dayStart && eventDate < dayEnd;
      }).length;

      return {
        date: format(day, 'MMM d'),
        fullDate: format(day, 'EEEE, MMM d'),
        successful: successLogins,
        failed: failedLogins,
        total: successLogins + failedLogins
      };
    });
  }, [authEvents]);

  // Events by type
  const eventsByType = useMemo(() => {
    const counts: Record<string, number> = {};
    
    authEvents.forEach(event => {
      counts[event.event_type] = (counts[event.event_type] || 0) + 1;
    });

    const typeLabels: Record<string, string> = {
      'login': 'Login',
      'login_success': 'Login Success',
      'login_failed': 'Failed Login',
      'logout': 'Logout',
      'password_change': 'Password Change',
      '2fa_enabled': '2FA Enabled',
      '2fa_disabled': '2FA Disabled',
      'signup': 'Signup',
      'backup_codes_generated': 'Backup Codes',
      'profile_updated': 'Profile Update'
    };

    return Object.entries(counts)
      .map(([type, count]) => ({
        name: typeLabels[type] || type,
        value: count,
        type
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [authEvents]);

  // Login by hour of day
  const loginsByHour = useMemo(() => {
    const hourCounts = Array(24).fill(0);
    
    loginHistory.forEach(event => {
      const hour = new Date(event.created_at).getHours();
      hourCounts[hour]++;
    });

    return hourCounts.map((count, hour) => ({
      hour: `${hour}:00`,
      displayHour: hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`,
      logins: count
    }));
  }, [loginHistory]);

  // Login by country
  const loginsByCountry = useMemo(() => {
    const countryCounts: Record<string, number> = {};
    
    loginHistory.forEach(event => {
      const country = event.location?.country || 'Unknown';
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });

    return Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [loginHistory]);

  // Security stats
  const securityStats = useMemo(() => {
    const totalLogins = authEvents.filter(e => 
      e.event_type === 'login' || e.event_type === 'login_success'
    ).length;
    
    const failedLogins = authEvents.filter(e => 
      e.event_type === 'login_failed'
    ).length;

    const securityEvents = authEvents.filter(e => 
      ['password_change', '2fa_enabled', '2fa_disabled', 'backup_codes_generated'].includes(e.event_type)
    ).length;

    const uniqueIPs = new Set(authEvents.map(e => e.ip_address).filter(Boolean)).size;

    return {
      totalLogins,
      failedLogins,
      successRate: totalLogins > 0 ? Math.round((totalLogins / (totalLogins + failedLogins)) * 100) : 100,
      securityEvents,
      uniqueIPs
    };
  }, [authEvents]);

  const pieColors = [CHART_COLORS.success, CHART_COLORS.info, CHART_COLORS.warning, CHART_COLORS.error, CHART_COLORS.primary, CHART_COLORS.muted];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Logins</p>
                <p className="text-2xl font-bold">{securityStats.totalLogins}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed Attempts</p>
                <p className="text-2xl font-bold text-destructive">{securityStats.failedLogins}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{securityStats.successRate}%</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unique IPs</p>
                <p className="text-2xl font-bold">{securityStats.uniqueIPs}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Login Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Login Activity (Last 14 Days)
          </CardTitle>
          <CardDescription>Successful and failed login attempts over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={loginsByDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="successful" 
                  stackId="1"
                  stroke={CHART_COLORS.success} 
                  fill={CHART_COLORS.success}
                  fillOpacity={0.6}
                  name="Successful"
                />
                <Area 
                  type="monotone" 
                  dataKey="failed" 
                  stackId="1"
                  stroke={CHART_COLORS.error} 
                  fill={CHART_COLORS.error}
                  fillOpacity={0.6}
                  name="Failed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Event Types
            </CardTitle>
            <CardDescription>Distribution of security events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eventsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {eventsByType.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {eventsByType.map((entry, index) => (
                <Badge 
                  key={entry.name} 
                  variant="outline"
                  className="text-xs"
                  style={{ borderColor: pieColors[index % pieColors.length] }}
                >
                  <span 
                    className="w-2 h-2 rounded-full mr-1" 
                    style={{ backgroundColor: pieColors[index % pieColors.length] }}
                  />
                  {entry.name}: {entry.value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Login by Hour */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Login Times
            </CardTitle>
            <CardDescription>When you typically log in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loginsByHour}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="displayHour" 
                    className="text-xs"
                    interval={2}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="logins" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Login by Country */}
      {loginsByCountry.length > 0 && loginsByCountry[0].country !== 'Unknown' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Login Locations
            </CardTitle>
            <CardDescription>Countries you've logged in from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loginsByCountry.map((item, index) => (
                <div key={item.country} className="flex items-center gap-3">
                  <div className="w-8 text-center text-sm text-muted-foreground">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.country}</span>
                      <span className="text-sm text-muted-foreground">{item.count} logins</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ 
                          width: `${(item.count / loginsByCountry[0].count) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
