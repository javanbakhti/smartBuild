import React, { useState, useEffect, useCallback } from 'react';
    import Layout from '@/components/Layout';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Switch } from '@/components/ui/switch';
    import { Label } from '@/components/ui/label';
    import { Input } from '@/components/ui/input';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Settings2 as UpdateSettingsIcon, CalendarClock, Bell, Save, HardDrive } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import BreadcrumbsUpdates from '@/components/manager/system/updates/BreadcrumbsUpdates';

    const initialDeviceFirmwareSettings = [
      { id: 'main-panel', name: 'Main Lobby Panel', enabled: true },
      { id: 'door-unit-A1', name: 'Door Unit A101', enabled: true },
      { id: 'keypad-garage', name: 'Garage Keypad', enabled: false },
    ];

    const UpdateSettingsPage = () => {
      const { toast } = useToast();
      const [settings, setSettings] = useState({
        autoUpdateEnabled: false,
        autoUpdateScheduleType: 'daily', // daily, weekly
        autoUpdateTime: '03:00',
        autoUpdateDayOfWeek: 'Sunday', // if weekly
        autoCheckInterval: 7, // This is the "Auto-check every X days" from CheckForUpdatesPage
        firmwareUpdates: initialDeviceFirmwareSettings,
        notificationsEnabled: false,
        notificationEmail: '',
        notifyOnSuccess: true,
        notifyOnFailure: true,
      });

      const breadcrumbItems = [
        { name: 'Settings', link: '/manager/settings/general' },
        { name: 'System', link: '/manager/settings/system/updates' },
        { name: 'Updates Hub', link: '/manager/settings/system/updates' },
        { name: 'Update Settings' }
      ];

      const loadSettings = useCallback(() => {
        const storedSettings = JSON.parse(localStorage.getItem('updateSettings'));
        if (storedSettings) {
          setSettings(prev => ({ ...prev, ...storedSettings }));
        } else {
          // If no settings stored, save initial settings
          localStorage.setItem('updateSettings', JSON.stringify(settings));
        }
      }, []);

      useEffect(() => {
        loadSettings();
      }, [loadSettings]);

      const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
      };

      const handleFirmwareSettingChange = (deviceId, enabled) => {
        setSettings(prev => ({
          ...prev,
          firmwareUpdates: prev.firmwareUpdates.map(device =>
            device.id === deviceId ? { ...device, enabled } : device
          ),
        }));
      };

      const handleSaveSettings = () => {
        localStorage.setItem('updateSettings', JSON.stringify(settings));
        toast({ title: 'Settings Saved', description: 'Update settings have been successfully saved.' });
      };

      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      return (
        <Layout role="manager">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <BreadcrumbsUpdates items={breadcrumbItems} />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white flex items-center">
                  <UpdateSettingsIcon className="mr-3 h-8 w-8 text-primary" /> Update Settings
                </h1>
                <p className="text-muted-foreground">Configure automatic updates, schedules, and notifications.</p>
              </div>
            </div>

            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center"><CalendarClock className="mr-2 h-5 w-5"/>Automatic Update Configuration</CardTitle>
                <CardDescription className="dark:text-gray-400">Manage how and when updates are automatically applied.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border dark:border-slate-700 rounded-lg">
                  <Label htmlFor="autoUpdateEnabled" className="text-base dark:text-gray-200">Enable Automatic Updates</Label>
                  <Switch 
                    id="autoUpdateEnabled" 
                    checked={settings.autoUpdateEnabled} 
                    onCheckedChange={(value) => handleSettingChange('autoUpdateEnabled', value)}
                  />
                </div>

                {settings.autoUpdateEnabled && (
                  <div className="space-y-4 p-4 border dark:border-slate-700 rounded-lg">
                    <div>
                      <Label htmlFor="autoUpdateScheduleType" className="dark:text-gray-300">Update Schedule</Label>
                      <Select 
                        value={settings.autoUpdateScheduleType} 
                        onValueChange={(value) => handleSettingChange('autoUpdateScheduleType', value)}
                      >
                        <SelectTrigger id="autoUpdateScheduleType" className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                          <SelectValue placeholder="Select schedule type" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-800 dark:text-white dark:border-slate-600">
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {settings.autoUpdateScheduleType === 'weekly' && (
                      <div>
                        <Label htmlFor="autoUpdateDayOfWeek" className="dark:text-gray-300">Day of Week</Label>
                        <Select 
                          value={settings.autoUpdateDayOfWeek} 
                          onValueChange={(value) => handleSettingChange('autoUpdateDayOfWeek', value)}
                        >
                          <SelectTrigger id="autoUpdateDayOfWeek" className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-slate-800 dark:text-white dark:border-slate-600">
                            {daysOfWeek.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="autoUpdateTime" className="dark:text-gray-300">Time to Run Updates (e.g., 03:00 for 3 AM)</Label>
                      <Input 
                        id="autoUpdateTime" 
                        type="time" 
                        value={settings.autoUpdateTime} 
                        onChange={(e) => handleSettingChange('autoUpdateTime', e.target.value)}
                        className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                      />
                    </div>
                     <p className="text-xs text-muted-foreground">Note: Auto-check interval (currently {settings.autoCheckInterval} days) for discovering updates is set on the "Check for Updates" page.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center"><HardDrive className="mr-2 h-5 w-5"/>Per-Device Firmware Updates</CardTitle>
                <CardDescription className="dark:text-gray-400">Enable or disable automatic firmware updates for specific devices. (Mock settings)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {settings.firmwareUpdates.map(device => (
                  <div key={device.id} className="flex items-center justify-between p-3 border dark:border-slate-700 rounded-md">
                    <Label htmlFor={`fw-${device.id}`} className="dark:text-gray-300">{device.name}</Label>
                    <Switch 
                      id={`fw-${device.id}`}
                      checked={device.enabled}
                      onCheckedChange={(value) => handleFirmwareSettingChange(device.id, value)} 
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center"><Bell className="mr-2 h-5 w-5"/>Notification Settings</CardTitle>
                <CardDescription className="dark:text-gray-400">Configure email notifications for update events.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border dark:border-slate-700 rounded-lg">
                  <Label htmlFor="notificationsEnabled" className="text-base dark:text-gray-200">Enable Email Notifications</Label>
                  <Switch 
                    id="notificationsEnabledUpdate" 
                    checked={settings.notificationsEnabled} 
                    onCheckedChange={(value) => handleSettingChange('notificationsEnabled', value)}
                  />
                </div>

                {settings.notificationsEnabled && (
                  <div className="space-y-4 p-4 border dark:border-slate-700 rounded-lg">
                    <div>
                      <Label htmlFor="notificationEmailUpdate" className="dark:text-gray-300">Recipient Email Address(es)</Label>
                      <Input 
                        id="notificationEmailUpdate" 
                        type="email" 
                        placeholder="admin@example.com, support@example.com"
                        value={settings.notificationEmail} 
                        onChange={(e) => handleSettingChange('notificationEmail', e.target.value)}
                        className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Comma-separated for multiple addresses.</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="notifyOnSuccessUpdate" 
                        checked={settings.notifyOnSuccess} 
                        onCheckedChange={(value) => handleSettingChange('notifyOnSuccess', value)}
                      />
                      <Label htmlFor="notifyOnSuccessUpdate" className="dark:text-gray-300 font-normal">Send notification on update success</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="notifyOnFailureUpdate" 
                        checked={settings.notifyOnFailure} 
                        onCheckedChange={(value) => handleSettingChange('notifyOnFailure', value)}
                      />
                      <Label htmlFor="notifyOnFailureUpdate" className="dark:text-gray-300 font-normal">Send notification on update failure</Label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end mt-8">
              <Button onClick={handleSaveSettings} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Save className="mr-2 h-4 w-4" /> Save All Update Settings
              </Button>
            </div>

          </motion.div>
        </Layout>
      );
    };

    export default UpdateSettingsPage;