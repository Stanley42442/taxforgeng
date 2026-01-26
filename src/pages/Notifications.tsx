import { useState, useEffect, useCallback } from "react";
import logger from "@/lib/logger";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  BellRing, 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Smartphone,
  Monitor,
  Info,
  Clock,
  Trash2,
  AlertTriangle,
  Settings,
  Inbox,
  RefreshCw,
  Wifi,
  WifiOff
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { 
  addNotification, 
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification as deleteNotificationFromDb,
  clearAllNotifications as clearAllNotificationsFromDb,
  type AppNotification 
} from "@/lib/notifications";
import {
  initializePWA,
  isPWA,
  isMobileDevice,
  requestPWANotificationPermission,
  showPWANotification,
  playMobileNotificationSound,
  vibrateDevice
} from "@/lib/pwaNotifications";
import { useSyncedNotifications } from "@/hooks/useSyncedNotifications";

const Notifications = () => {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPwaMode] = useState(() => isPWA());
  const [isMobile] = useState(() => isMobileDevice());

  const { notifications, loading, isConnected, unreadCount, refresh } = useSyncedNotifications();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    vibrateDevice([50]);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Notifications refreshed');
    }, 300);
  }, [refresh]);

  useEffect(() => {
    // Initialize PWA features
    initializePWA();

    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    } else {
      setNotificationPermission('unsupported');
    }

    try {
      const savedSound = localStorage.getItem('notification-sound-enabled');
      const savedBrowser = localStorage.getItem('notification-browser-enabled');
      if (savedSound !== null) setSoundEnabled(savedSound === 'true');
      if (savedBrowser !== null) setBrowserNotificationsEnabled(savedBrowser === 'true');
    } catch {
      // Use defaults if localStorage unavailable
    }
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestPWANotificationPermission();
    if (granted) {
      setNotificationPermission('granted');
      vibrateDevice([100, 50, 100]);
      toast.success('Push notifications enabled!');
    } else {
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
        if (Notification.permission === 'denied') {
          toast.error('Notifications blocked by browser. Please enable in browser settings.');
        }
      }
    }
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    try {
      localStorage.setItem('notification-sound-enabled', String(enabled));
    } catch {
      // Silent fail
    }
    if (enabled) vibrateDevice([50]);
    toast.success(enabled ? 'Sound notifications enabled' : 'Sound notifications disabled');
  };

  const handleBrowserToggle = (enabled: boolean) => {
    setBrowserNotificationsEnabled(enabled);
    try {
      localStorage.setItem('notification-browser-enabled', String(enabled));
    } catch {
      // Silent fail
    }
    toast.success(enabled ? 'Browser notifications enabled' : 'Browser notifications disabled');
  };

  const testNotification = async () => {
    logger.debug('[Notifications] Testing notification...', { isPwaMode, isMobile });
    
    // Play sound (with mobile-compatible audio context)
    await playMobileNotificationSound();
    
    // Vibrate on mobile
    vibrateDevice([200, 100, 200]);

    // Show browser/PWA notification
    if (notificationPermission === 'granted') {
      await showPWANotification(
        "TaxForge NG - Test",
        "This is a test notification. Your notifications are working!",
        { url: '/notifications', vibrate: true }
      );
    }

    // Add to notifications (now synced across devices)
    await addNotification(
      "Test Notification",
      "This is a test notification to verify your settings are working.",
      'info'
    );
    
    toast.success("Test notification sent!");
  };

  const markAsRead = async (id: string) => {
    await markNotificationRead(id);
    await refresh();
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsRead();
    await refresh();
    toast.success('All notifications marked as read');
  };

  const handleDeleteNotification = async (id: string) => {
    await deleteNotificationFromDb(id);
    await refresh();
    toast.success('Notification deleted');
  };

  const handleClearAllNotifications = async () => {
    await clearAllNotificationsFromDb();
    await refresh();
    toast.success('All notifications cleared');
  };

  const getPermissionStatusBadge = () => {
    switch (notificationPermission) {
      case 'granted':
        return (
          <Badge className="bg-success/20 text-success border-success/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Allowed
          </Badge>
        );
      case 'denied':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Blocked
          </Badge>
        );
      case 'unsupported':
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            Not Supported
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="w-3 h-3 mr-1" />
            Not Set
          </Badge>
        );
    }
  };

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'reminder':
        return <Bell className="w-5 h-5 text-primary" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      default:
        return <Info className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <PageLayout 
      title="Notifications" 
      description="View your notifications and manage settings" 
      icon={Bell} 
      maxWidth="2xl"
      headerActions={
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="outline" className="gap-1 text-success border-success/30">
              <Wifi className="w-3 h-3" />
              <span className="hidden sm:inline">Synced</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <WifiOff className="w-3 h-3" />
              <span className="hidden sm:inline">Offline</span>
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              {unreadCount} unread
            </Badge>
          )}
        </div>
      }
    >
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Inbox className="w-4 h-4" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          {notifications.length > 0 && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleClearAllNotifications}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear all
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <RefreshCw className="w-8 h-8 mx-auto text-muted-foreground mb-4 animate-spin" />
                <p className="text-muted-foreground">Loading notifications...</p>
              </CardContent>
            </Card>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Inbox className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
                <p className="text-muted-foreground mb-4">
                  You're all caught up! Notifications will appear here when reminders are due.
                </p>
                <Button variant="outline" onClick={testNotification}>
                  <Bell className="w-4 h-4 mr-2" />
                  Send Test Notification
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3 pr-4">
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`transition-colors ${!notification.read ? 'bg-primary/5 border-primary/20' : ''}`}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.title}
                              </p>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {notification.message}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(notification.timestamp), "PPp")}
                            </p>
                            <div className="flex gap-1">
                              {!notification.read && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 text-xs"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  Mark read
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-xs text-destructive hover:text-destructive"
                                onClick={() => handleDeleteNotification(notification.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          {/* Sync Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isConnected ? <Wifi className="w-5 h-5 text-success" /> : <WifiOff className="w-5 h-5" />}
                Cross-Device Sync
              </CardTitle>
              <CardDescription>
                Notifications are synced across all your devices in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`flex items-center gap-3 p-4 rounded-lg ${isConnected ? 'bg-success/10' : 'bg-muted/50'}`}>
                {isConnected ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <p className="text-sm">Real-time sync is active. Notifications will appear on all your devices.</p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-muted-foreground" />
                    <p className="text-sm">Connecting to sync service...</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Permission Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BellRing className="w-5 h-5" />
                    Browser Permissions
                  </CardTitle>
                  <CardDescription>Allow notifications from your browser</CardDescription>
                </div>
                {getPermissionStatusBadge()}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationPermission === 'denied' && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Notifications Blocked</AlertTitle>
                  <AlertDescription>
                    <p className="mb-3">
                      Your browser has blocked notifications. To enable:
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <Monitor className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                          <strong>Desktop:</strong> Click the lock icon in the address bar → Notifications → Allow
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Smartphone className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                          <strong>Mobile:</strong> Go to browser settings → Site settings → Notifications
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {notificationPermission === 'default' && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">Enable push notifications</p>
                    <p className="text-sm text-muted-foreground">Get notified when reminders are due</p>
                  </div>
                  <Button onClick={handleEnableNotifications}>
                    <BellRing className="w-4 h-4 mr-2" />
                    Enable Notifications
                  </Button>
                </div>
              )}

              {notificationPermission === 'granted' && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <p className="text-sm">Browser notifications are enabled.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Customize how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">Sound Notifications</p>
                  <p className="text-sm text-muted-foreground">Play a sound when you receive notifications</p>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={handleSoundToggle}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium">Browser Notifications</p>
                  <p className="text-sm text-muted-foreground">Show browser popup notifications</p>
                </div>
                <Switch
                  checked={browserNotificationsEnabled}
                  onCheckedChange={handleBrowserToggle}
                  disabled={notificationPermission !== 'granted'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Device Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isMobile ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                Device Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {isPwaMode && (
                  <Badge variant="secondary">
                    <Smartphone className="w-3 h-3 mr-1" />
                    PWA Mode
                  </Badge>
                )}
                {isMobile && (
                  <Badge variant="secondary">
                    <Smartphone className="w-3 h-3 mr-1" />
                    Mobile Device
                  </Badge>
                )}
                {!isPwaMode && !isMobile && (
                  <Badge variant="secondary">
                    <Monitor className="w-3 h-3 mr-1" />
                    Desktop Browser
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Test Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Test Notifications</CardTitle>
              <CardDescription>Send a test notification to verify your settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={testNotification} className="w-full sm:w-auto">
                <Bell className="w-4 h-4 mr-2" />
                Send Test Notification
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default Notifications;
