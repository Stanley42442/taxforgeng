import { useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  Inbox
} from "lucide-react";
import { toast } from "sonner";
import { requestNotificationPermission } from "@/hooks/useReminderNotifications";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { 
  getNotifications, 
  addNotification, 
  playNotificationSound,
  showBrowserNotification,
  type AppNotification 
} from "@/lib/notifications";

const Notifications = () => {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const loadNotifications = () => {
    const stored = getNotifications();
    console.log('[Notifications] Loaded notifications:', stored.length);
    setNotifications(stored);
  };

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    } else {
      setNotificationPermission('unsupported');
    }

    const savedSound = localStorage.getItem('notification-sound-enabled');
    const savedBrowser = localStorage.getItem('notification-browser-enabled');
    if (savedSound !== null) setSoundEnabled(savedSound === 'true');
    if (savedBrowser !== null) setBrowserNotificationsEnabled(savedBrowser === 'true');

    loadNotifications();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app-notifications') {
        loadNotifications();
      }
    };

    const handleNotificationAdded = () => {
      loadNotifications();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('notification-added', handleNotificationAdded);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('notification-added', handleNotificationAdded);
    };
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationPermission('granted');
      toast.success('Push notifications enabled!');
    } else {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'denied') {
        toast.error('Notifications blocked by browser. Please enable in browser settings.');
      }
    }
  };

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('notification-sound-enabled', String(enabled));
    toast.success(enabled ? 'Sound notifications enabled' : 'Sound notifications disabled');
  };

  const handleBrowserToggle = (enabled: boolean) => {
    setBrowserNotificationsEnabled(enabled);
    localStorage.setItem('notification-browser-enabled', String(enabled));
    toast.success(enabled ? 'Browser notifications enabled' : 'Browser notifications disabled');
  };

  const testNotification = () => {
    playNotificationSound();

    if (notificationPermission === 'granted') {
      showBrowserNotification(
        "TaxForge NG - Test",
        "This is a test notification. Your notifications are working!"
      );
    }

    addNotification(
      "Test Notification",
      "This is a test notification to verify your settings are working.",
      'info'
    );
    
    loadNotifications();
    toast.success("Test notification sent!");
  };

  const markAsRead = (id: string) => {
    const stored = getNotifications();
    const updated = stored.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    localStorage.setItem('app-notifications', JSON.stringify(updated));
    setNotifications(updated);
    window.dispatchEvent(new CustomEvent('notification-added'));
  };

  const markAllAsRead = () => {
    const stored = getNotifications();
    const updated = stored.map(n => ({ ...n, read: true }));
    localStorage.setItem('app-notifications', JSON.stringify(updated));
    setNotifications(updated);
    window.dispatchEvent(new CustomEvent('notification-added'));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    const stored = getNotifications();
    const updated = stored.filter(n => n.id !== id);
    localStorage.setItem('app-notifications', JSON.stringify(updated));
    setNotifications(updated);
    window.dispatchEvent(new CustomEvent('notification-added'));
    toast.success('Notification deleted');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('app-notifications');
    window.dispatchEvent(new CustomEvent('notification-added'));
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <PageLayout 
      title="Notifications" 
      description="View your notifications and manage settings" 
      icon={Bell} 
      maxWidth="2xl"
      headerActions={
        unreadCount > 0 ? (
          <Badge variant="destructive" className="text-sm">
            {unreadCount} unread
          </Badge>
        ) : undefined
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
                  <Button variant="outline" size="sm" onClick={markAllAsRead}>
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={clearAllNotifications}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear all
                </Button>
              </div>
            </div>
          )}

          {notifications.length === 0 ? (
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
                                onClick={() => deleteNotification(notification.id)}
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
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Sound Notifications</p>
                    <p className="text-xs text-muted-foreground">Play a sound when notifications arrive</p>
                  </div>
                </div>
                <Switch checked={soundEnabled} onCheckedChange={handleSoundToggle} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <BellRing className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Browser Notifications</p>
                    <p className="text-xs text-muted-foreground">Show desktop notifications</p>
                  </div>
                </div>
                <Switch 
                  checked={browserNotificationsEnabled} 
                  onCheckedChange={handleBrowserToggle}
                  disabled={notificationPermission !== 'granted'}
                />
              </div>

              <div className="pt-4">
                <Button variant="outline" onClick={testNotification} className="w-full">
                  <Bell className="w-4 h-4 mr-2" />
                  Test Notifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default Notifications;
