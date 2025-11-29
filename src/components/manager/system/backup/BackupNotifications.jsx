import React from 'react';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Switch } from '@/components/ui/switch';
    import { Label } from '@/components/ui/label';
    import { Input } from '@/components/ui/input';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Bell } from 'lucide-react';

    const BackupNotifications = ({ settings, setSettings }) => {
      const handleInputChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
      };

      return (
        <Card className="dark:bg-slate-800 shadow-lg">
          <CardHeader>
            <CardTitle className="dark:text-white flex items-center"><Bell className="mr-2 h-5 w-5"/>Notification Preferences</CardTitle>
            <CardDescription>Configure notifications for backup events.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notificationsEnabled" className="dark:text-gray-300">Enable Email Notifications</Label>
              <Switch id="notificationsEnabled" checked={settings.notificationsEnabled} onCheckedChange={value => handleInputChange('notificationsEnabled', value)} />
            </div>
            {settings.notificationsEnabled && (
              <>
                <div>
                  <Label htmlFor="notificationEmail" className="dark:text-gray-300">Email Address(es)</Label>
                  <Input id="notificationEmail" placeholder="e.g., admin@example.com, backup@example.com" value={settings.notificationEmail} onChange={e => handleInputChange('notificationEmail', e.target.value)} className="dark:bg-slate-700 dark:text-white dark:border-slate-600"/>
                  <p className="text-xs text-muted-foreground mt-1">Comma-separated for multiple addresses.</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="notifyOnSuccess" checked={settings.notifyOnSuccess} onCheckedChange={value => handleInputChange('notifyOnSuccess', value)} />
                  <Label htmlFor="notifyOnSuccess" className="dark:text-gray-300">Send notification on success</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="notifyOnFailure" checked={settings.notifyOnFailure} onCheckedChange={value => handleInputChange('notifyOnFailure', value)} />
                  <Label htmlFor="notifyOnFailure" className="dark:text-gray-300">Send notification on failure</Label>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      );
    };

    export default BackupNotifications;