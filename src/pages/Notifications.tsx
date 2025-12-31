import { useState, useEffect } from "react";
import { NavMenu } from "@/components/NavMenu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  BellRing, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Smartphone,
  Monitor,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { requestNotificationPermission } from "@/hooks/useReminderNotifications";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Notifications = () => {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(true);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    } else {
      setNotificationPermission('unsupported');
    }

    // Load preferences from localStorage
    const savedSound = localStorage.getItem('notification-sound-enabled');
    const savedBrowser = localStorage.getItem('notification-browser-enabled');
    if (savedSound !== null) setSoundEnabled(savedSound === 'true');
    if (savedBrowser !== null) setBrowserNotificationsEnabled(savedBrowser === 'true');
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
    // Play test sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = frequency;
        oscillator.type = "sine";
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
      const now = audioContext.currentTime;
      playTone(880, now, 0.15);
      playTone(1108.73, now + 0.15, 0.2);
      playTone(1318.51, now + 0.3, 0.25);
    } catch (error) {
      console.error("Error playing test sound:", error);
    }

    // Show test browser notification
    if (notificationPermission === 'granted') {
      new Notification("TaxForge NG - Test", {
        body: "This is a test notification. Your notifications are working!",
        icon: "/favicon.ico",
      });
    }

    toast.success("Test notification sent!");
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

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col overflow-x-hidden">
      <NavMenu />
      
      <div className="container mx-auto px-4 py-6 pb-8 flex-1 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            <Bell className="inline-block w-8 h-8 mr-2 text-primary" />
            Notification Settings
          </h1>
          <p className="text-muted-foreground">
            Configure how you receive reminders and alerts
          </p>
        </div>

        <div className="space-y-6">
          {/* Permission Status Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BellRing className="w-5 h-5" />
                    Browser Permissions
                  </CardTitle>
                  <CardDescription>
                    Allow notifications from your browser
                  </CardDescription>
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
                      Your browser has blocked notifications for this site. To enable notifications:
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <Monitor className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                          <strong>Desktop:</strong> Click the lock/info icon in the address bar → Find "Notifications" → Change to "Allow"
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Smartphone className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                          <strong>Mobile:</strong> Go to browser settings → Site settings → Notifications → Allow for this site
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
                    <p className="text-sm text-muted-foreground">
                      Get notified when reminders are due
                    </p>
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
                  <p className="text-sm">
                    Browser notifications are enabled. You'll receive alerts when reminders are due.
                  </p>
                </div>
              )}

              {notificationPermission === 'unsupported' && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Not Supported</AlertTitle>
                  <AlertDescription>
                    Your browser doesn't support push notifications. Try using Chrome, Firefox, or Edge for the best experience.
                  </AlertDescription>
                </Alert>
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
              <CardDescription>
                Customize your notification experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound-notifications" className="text-base">Sound Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Play a sound when reminders become due
                  </p>
                </div>
                <Switch
                  id="sound-notifications"
                  checked={soundEnabled}
                  onCheckedChange={handleSoundToggle}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="browser-notifications" className="text-base">Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show browser notification popups
                  </p>
                </div>
                <Switch
                  id="browser-notifications"
                  checked={browserNotificationsEnabled}
                  onCheckedChange={handleBrowserToggle}
                  disabled={notificationPermission !== 'granted'}
                />
              </div>

              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={testNotification}
                  disabled={notificationPermission === 'unsupported'}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Test Notification
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Send a test notification to verify your settings are working
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                How Notifications Work
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                TaxForge NG checks for due reminders every minute while the app is open. When a reminder becomes due:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>A sound will play (if enabled)</li>
                <li>A toast notification will appear in the app</li>
                <li>A browser notification will be shown (if enabled)</li>
              </ul>
              <p className="pt-2">
                <strong>Note:</strong> Email reminders are sent separately via our backend system, regardless of these settings.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
