import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Label } from '@/components/ui/label';
    import { Switch } from '@/components/ui/switch';
    import { Bell } from 'lucide-react';

    const NotificationPreferences = ({ notificationConsent, setNotificationConsent }) => {
      return (
        <Card className="dark:bg-slate-800 shadow-lg">
          <CardHeader>
            <CardTitle className="dark:text-white flex items-center">
              <Bell className="mr-2 h-5 w-5 text-yellow-500" /> Notification Preferences
            </CardTitle>
            <CardDescription>Manage how you receive notifications from the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="notificationConsent"
                checked={notificationConsent}
                onCheckedChange={setNotificationConsent}
                aria-label="Toggle app notifications"
              />
              <Label htmlFor="notificationConsent" className="text-muted-foreground dark:text-gray-300">
                {notificationConsent ? "App Notifications Enabled" : "App Notifications Disabled"}
              </Label>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This controls general app notifications. Specific alert types might have finer controls elsewhere.
            </p>
          </CardContent>
        </Card>
      );
    };

    export default NotificationPreferences;