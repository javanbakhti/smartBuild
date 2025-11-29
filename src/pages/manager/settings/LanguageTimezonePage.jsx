import React, { useState, useEffect } from 'react';
    import Layout from '@/components/Layout';
    import { Button } from '@/components/ui/button';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Globe, Clock, Save } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';

    const availableLanguages = [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español (Spanish)' },
      { code: 'fr', name: 'Français (French)' },
      // Add more languages as needed
    ];

    const timezones = [
      "Etc/GMT+12", "Pacific/Midway", "Pacific/Honolulu", "America/Anchorage", 
      "America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York",
      "America/Caracas", "America/Halifax", "America/Sao_Paulo", "Atlantic/Azores",
      "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
      "Asia/Dubai", "Asia/Kolkata", "Asia/Bangkok", "Asia/Shanghai", "Asia/Tokyo",
      "Australia/Sydney", "Pacific/Auckland", "Etc/GMT-14"
    ].map(tz => ({ value: tz, label: tz.replace(/_/g, ' ') }));


    const LanguageTimezonePage = () => {
      const { toast } = useToast();
      const [settings, setSettings] = useState({
        managerLanguage: 'en',
        residentLanguage: 'en',
        kioskLanguage: 'en',
        timezone: 'America/New_York',
      });

      useEffect(() => {
        const storedSettings = JSON.parse(localStorage.getItem('languageTimezoneSettings'));
        if (storedSettings) {
          setSettings(storedSettings);
        }
      }, []);

      const handleSelectChange = (name, value) => {
        setSettings(prev => ({ ...prev, [name]: value }));
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('languageTimezoneSettings', JSON.stringify(settings));
        toast({
          title: 'Settings Saved',
          description: 'Language and time zone configurations have been updated.',
        });
        // Here you might want to trigger a context update or page reload for language changes to take effect immediately
        // For now, it's just saved. A real multi-language app would need more robust state management.
      };

      return (
        <Layout role="manager">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white flex items-center">
                  <Globe className="mr-3 h-8 w-8 text-primary" /> Language & Time Zone
                </h1>
                <p className="text-muted-foreground">Configure localization settings for the system.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <Card className="dark:bg-slate-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="dark:text-white">Language Settings</CardTitle>
                  <CardDescription>Set default languages for different parts of the system.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="managerLanguage" className="dark:text-gray-300">Manager Dashboard Language</Label>
                    <Select value={settings.managerLanguage} onValueChange={(value) => handleSelectChange('managerLanguage', value)}>
                      <SelectTrigger id="managerLanguage" className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                        <SelectValue placeholder="Select language..." />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:text-white dark:border-slate-600">
                        {availableLanguages.map(lang => <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="residentLanguage" className="dark:text-gray-300">Resident Portal Language</Label>
                    <Select value={settings.residentLanguage} onValueChange={(value) => handleSelectChange('residentLanguage', value)}>
                      <SelectTrigger id="residentLanguage" className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                        <SelectValue placeholder="Select language..." />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:text-white dark:border-slate-600">
                        {availableLanguages.map(lang => <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="kioskLanguage" className="dark:text-gray-300">Kiosk Interface Language</Label>
                    <Select value={settings.kioskLanguage} onValueChange={(value) => handleSelectChange('kioskLanguage', value)}>
                      <SelectTrigger id="kioskLanguage" className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                        <SelectValue placeholder="Select language..." />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:text-white dark:border-slate-600">
                        {availableLanguages.map(lang => <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-slate-800 shadow-lg mt-6">
                <CardHeader>
                  <CardTitle className="dark:text-white flex items-center"><Clock className="mr-2 h-5 w-5 text-blue-500"/>Time Zone Setting</CardTitle>
                  <CardDescription>Set the primary time zone for the system (for logs, schedules, etc.).</CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="timezone" className="dark:text-gray-300">System Time Zone</Label>
                    <Select value={settings.timezone} onValueChange={(value) => handleSelectChange('timezone', value)}>
                      <SelectTrigger id="timezone" className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                        <SelectValue placeholder="Select timezone..." />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:text-white dark:border-slate-600 max-h-60">
                        {timezones.map(tz => <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">Current system time (based on selection): {new Date().toLocaleTimeString('en-US', { timeZone: settings.timezone, hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}</p>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end mt-6">
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Save className="mr-2 h-4 w-4" /> Save Localization Settings
                </Button>
              </div>
            </form>
          </motion.div>
        </Layout>
      );
    };

    export default LanguageTimezonePage;