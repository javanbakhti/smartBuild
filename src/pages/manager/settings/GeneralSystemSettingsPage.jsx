import React, { useState, useEffect, useCallback } from 'react';
    import Layout from '@/components/Layout';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';
    import { Switch } from '@/components/ui/switch';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Save, Mail, Building, Bell, UserCircle, Send, Sparkles } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';

    const initialSettings = {
      systemName: 'Smart Intercom System',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      alternativeContactEmail: '',
      appNotificationsEnabled: false,
      emailNotificationsEnabled: false,
      defaultAlertEmail: '',
      alertTypes: {
        doorActivity: false,
        motionDetected: false,
        systemErrors: true, 
        backupFailures: true,
      },
      newsletter: {
        updates: false,
        promotions: false,
      },
    };

    const alertTypeOptions = [
      { id: 'doorActivity', label: 'Door Activity Alerts' },
      { id: 'motionDetected', label: 'Motion Detected Alerts' },
      { id: 'systemErrors', label: 'System Errors & Critical Issues' },
      { id: 'backupFailures', label: 'Backup Failures' },
    ];

    const GeneralSystemSettingsPage = () => {
      const { toast } = useToast();
      const [settings, setSettings] = useState(initialSettings);
      const [contactMessage, setContactMessage] = useState('');
      const [loading, setLoading] = useState(true);

      const loadSettings = useCallback(() => {
        const storedSettings = JSON.parse(localStorage.getItem('generalSystemSettings')) || {};
        
        const user = JSON.parse(localStorage.getItem('user'));
        const appNotificationsEnabled = user?.notificationConsent === null ? false : user?.notificationConsent || false;
        const newsletterSettings = user?.newsletter || initialSettings.newsletter;

        setSettings(prev => ({
          ...initialSettings, 
          ...prev,
          ...storedSettings,
          appNotificationsEnabled, 
          systemName: storedSettings.systemName || initialSettings.systemName, 
          alertTypes: {
            ...initialSettings.alertTypes,
            ...(storedSettings.alertTypes || {}),
          },
          newsletter: {
            ...initialSettings.newsletter,
            ...newsletterSettings,
          },
        }));
        setLoading(false);
      }, []);

      useEffect(() => {
        loadSettings();
      }, [loadSettings]);

      const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
      };
      
      const handleNewsletterChange = (typeId, checked) => {
        setSettings(prev => ({
          ...prev,
          newsletter: {
            ...prev.newsletter,
            [typeId]: checked,
          },
        }));
      };

      const handleAlertsTypeChange = (typeId, checked) => {
        setSettings(prev => ({
          ...prev,
          alertTypes: {
            ...prev.alertTypes,
            [typeId]: checked,
          },
        }));
      };

      const handleSaveSystemSettings = () => {
        if (!settings.contactName || !settings.contactEmail) {
          toast({
            title: 'Missing Information',
            description: 'System Owner Contact Name and Primary Email are required.',
            variant: 'destructive',
          });
          return;
        }

        localStorage.setItem('generalSystemSettings', JSON.stringify(settings));
        
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            const updatedUser = { 
              ...user, 
              notificationConsent: settings.appNotificationsEnabled,
              newsletter: settings.newsletter,
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            const users = JSON.parse(localStorage.getItem('users')) || [];
            const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
        }

        toast({
          title: 'System Settings Saved',
          description: 'General system settings and notification preferences have been updated.',
        });
      };

      const handleSendTestNotification = () => {
        if (!settings.emailNotificationsEnabled || !settings.defaultAlertEmail) {
          toast({
            title: 'Cannot Send Test',
            description: 'Please enable email notifications and provide a default recipient email address.',
            variant: 'destructive',
          });
          return;
        }
        toast({
          title: 'Test Notification Sent (Simulated)',
          description: `A test notification would be sent to ${settings.defaultAlertEmail}.`,
        });
      };
      
      const handleSendContactForm = (e) => {
        e.preventDefault();
        if (!settings.contactName || !settings.contactEmail) {
          toast({
            title: 'Error',
            description: 'Please fill in your name and email for the contact form.',
            variant: 'destructive',
          });
          return;
        }
        console.log("Contact Form Submission (Simulated):", { 
            contactName: settings.contactName, 
            contactEmail: settings.contactEmail, 
            contactPhone: settings.contactPhone, 
            alternativeContactEmail: settings.alternativeContactEmail,
            message: contactMessage,
            newsletterPreferences: settings.newsletter,
        });
        toast({
          title: 'Message Sent (Simulated)',
          description: 'Your message to IPFy.ca has been sent. We will get back to you shortly.',
        });
        setContactMessage(''); 
      };
      
      if (loading) {
        return <Layout role="manager"><div className="p-8 text-center">Loading general settings...</div></Layout>;
      }

      return (
        <Layout role="manager">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 max-w-3xl mx-auto"
          >
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white">General System Settings</h1>
              <p className="text-muted-foreground">Manage overall system configurations and contact information.</p>
            </div>

            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center"><Building className="mr-2 h-5 w-5 text-blue-500"/>System Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground dark:text-gray-300">System Name (Building Name)</Label>
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-100 p-2 rounded-md bg-muted dark:bg-slate-700/50">
                    {settings.systemName || "Not Set"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">System name is typically set during initial building setup and displayed here for reference.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-800 shadow-lg">
                <CardHeader>
                    <CardTitle className="dark:text-white flex items-center"><Bell className="mr-2 h-5 w-5 text-yellow-500"/>Notification Preferences</CardTitle>
                    <CardDescription>Manage how you receive notifications from the system.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="appNotificationsEnabled"
                            checked={settings.appNotificationsEnabled}
                            onCheckedChange={(value) => handleSettingChange('appNotificationsEnabled', value)}
                            aria-label="Toggle app notifications"
                        />
                        <Label htmlFor="appNotificationsEnabled" className="text-muted-foreground dark:text-gray-300">
                            App Notifications Enabled
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="emailNotificationsEnabled"
                            checked={settings.emailNotificationsEnabled}
                            onCheckedChange={(value) => handleSettingChange('emailNotificationsEnabled', value)}
                            aria-label="Toggle email notifications"
                        />
                        <Label htmlFor="emailNotificationsEnabled" className="text-muted-foreground dark:text-gray-300">
                            Email Notifications Enabled
                        </Label>
                    </div>

                    {settings.emailNotificationsEnabled && (
                      <div className="pl-2 space-y-4 border-l-2 border-primary/50 dark:border-purple-500/50 ml-2">
                        <div>
                          <Label htmlFor="defaultAlertEmail" className="text-muted-foreground dark:text-gray-300">Default Recipient Email for Alerts</Label>
                          <Input 
                            id="defaultAlertEmail" 
                            type="email"
                            value={settings.defaultAlertEmail} 
                            onChange={(e) => handleSettingChange('defaultAlertEmail', e.target.value)} 
                            placeholder="alerts@example.com"
                            className="bg-background dark:bg-slate-700 border-input dark:border-slate-600"
                          />
                        </div>
                        <div>
                          <Label className="text-muted-foreground dark:text-gray-300 mb-2 block">Select Alert Types for Email:</Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                            {alertTypeOptions.map(alert => (
                              <div key={alert.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={alert.id}
                                  checked={settings.alertTypes[alert.id] || false}
                                  onCheckedChange={(checked) => handleAlertsTypeChange(alert.id, !!checked)}
                                />
                                <Label htmlFor={alert.id} className="font-normal text-muted-foreground dark:text-gray-300">{alert.label}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Button onClick={handleSendTestNotification} variant="outline" size="sm" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">
                          <Send className="mr-2 h-4 w-4" /> Send Test Notification
                        </Button>
                      </div>
                    )}
                </CardContent>
            </Card>

            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center"><UserCircle className="mr-2 h-5 w-5 text-green-500"/>System Owner Contact (for IPFy.ca)</CardTitle>
                <CardDescription>This information is for IPFy.ca to contact the system owner if needed. It can also be used to pre-fill support requests.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendContactForm} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactName" className="text-muted-foreground dark:text-gray-300">Contact Person Name <span className="text-red-500">*</span></Label>
                      <Input id="contactName" value={settings.contactName} onChange={(e) => handleSettingChange('contactName', e.target.value)} placeholder="Your Name" required className="bg-background dark:bg-slate-700 border-input dark:border-slate-600"/>
                    </div>
                    <div>
                      <Label htmlFor="contactEmail" className="text-muted-foreground dark:text-gray-300">Contact Email <span className="text-red-500">*</span></Label>
                      <Input id="contactEmail" type="email" value={settings.contactEmail} onChange={(e) => handleSettingChange('contactEmail', e.target.value)} placeholder="your.email@example.com" required className="bg-background dark:bg-slate-700 border-input dark:border-slate-600"/>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactPhone" className="text-muted-foreground dark:text-gray-300">Contact Phone (Optional)</Label>
                      <Input id="contactPhone" type="tel" value={settings.contactPhone} onChange={(e) => handleSettingChange('contactPhone', e.target.value)} placeholder="+1-555-123-4567" className="bg-background dark:bg-slate-700 border-input dark:border-slate-600"/>
                    </div>
                    <div>
                      <Label htmlFor="alternativeContactEmail" className="text-muted-foreground dark:text-gray-300">Alternative Contact Email (Optional)</Label>
                      <Input id="alternativeContactEmail" type="email" value={settings.alternativeContactEmail} onChange={(e) => handleSettingChange('alternativeContactEmail', e.target.value)} placeholder="alt.email@example.com" className="bg-background dark:bg-slate-700 border-input dark:border-slate-600"/>
                    </div>
                  </div>
                  
                  <div className="pt-4 space-y-4">
                     <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        <Label className="text-lg font-semibold dark:text-white">Newsletter Subscriptions</Label>
                     </div>
                     <div className="pl-7 space-y-4">
                        <div className="flex items-start space-x-2">
                           <Checkbox id="receiveUpdates" checked={settings.newsletter?.updates || false} onCheckedChange={(checked) => handleNewsletterChange('updates', !!checked)} />
                           <div className="grid gap-1.5 leading-none">
                              <Label htmlFor="receiveUpdates" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-300">Receive Updates</Label>
                              <p className="text-xs text-muted-foreground dark:text-gray-400">Get notified about system news, product changes, and announcements.</p>
                           </div>
                        </div>
                        <div className="flex items-start space-x-2">
                           <Checkbox id="receivePromotions" checked={settings.newsletter?.promotions || false} onCheckedChange={(checked) => handleNewsletterChange('promotions', !!checked)} />
                           <div className="grid gap-1.5 leading-none">
                              <Label htmlFor="receivePromotions" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-300">Receive Promotions</Label>
                              <p className="text-xs text-muted-foreground dark:text-gray-400">Get special offers, deals, and marketing content.</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div>
                    <Label htmlFor="contactMessage" className="text-muted-foreground dark:text-gray-300">Message to IPFy.ca (Optional)</Label>
                    <Textarea 
                      id="contactMessage" 
                      value={contactMessage} 
                      onChange={(e) => setContactMessage(e.target.value)} 
                      placeholder="Enter any specific notes or message for IPFy.ca here..."
                      className="bg-background dark:bg-slate-700 border-input dark:border-slate-600"
                    />
                  </div>
                  <Button type="submit" className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                    <Mail className="mr-2 h-4 w-4" /> Send Message to IPFy.ca (Simulated)
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveSystemSettings} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Save className="mr-2 h-5 w-5" /> Save General Settings
              </Button>
            </div>
          </motion.div>
        </Layout>
      );
    };

    export default GeneralSystemSettingsPage;