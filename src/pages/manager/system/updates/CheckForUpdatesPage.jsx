import React, { useState, useEffect, useCallback } from 'react';
    import Layout from '@/components/Layout';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Label } from '@/components/ui/label';
    import { Input } from '@/components/ui/input';
    import { RefreshCw, DownloadCloud, Info, CheckCircle, Settings2 } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { Progress } from "@/components/ui/progress";
    import BreadcrumbsUpdates from '@/components/manager/system/updates/BreadcrumbsUpdates';
    import { Link } from 'react-router-dom';
    import { format, addDays } from 'date-fns';

    const CheckForUpdatesPage = () => {
      const { toast } = useToast();
      const [currentVersion, setCurrentVersion] = useState("1.2.1");
      const [currentFirmwareVersion, setCurrentFirmwareVersion] = useState("FW 1.0.8");
      const [latestVersion, setLatestVersion] = useState(null);
      const [checking, setChecking] = useState(false);
      const [downloading, setDownloading] = useState(false);
      const [downloadProgress, setDownloadProgress] = useState(0);
      const [updateMessage, setUpdateMessage] = useState("");
      const [lastChecked, setLastChecked] = useState(null);
      const [autoCheckDays, setAutoCheckDays] = useState(7); // Default to 7 days

      const breadcrumbItems = [
        { name: 'Settings', link: '/manager/settings/general' },
        { name: 'System', link: '/manager/settings/system/updates' },
        { name: 'Updates Hub', link: '/manager/settings/system/updates' },
        { name: 'Check for Updates' }
      ];

      const loadUpdateSettings = useCallback(() => {
        const settings = JSON.parse(localStorage.getItem('updateSettings')) || {};
        setAutoCheckDays(settings.autoCheckInterval || 7);
        const lc = localStorage.getItem('lastUpdateCheckTime');
        if (lc) setLastChecked(new Date(lc));
      }, []);

      useEffect(() => {
        loadUpdateSettings();
      }, [loadUpdateSettings]);

      const saveLastCheckedTime = () => {
        const now = new Date();
        localStorage.setItem('lastUpdateCheckTime', now.toISOString());
        setLastChecked(now);
      };
      
      const saveAutoCheckDays = (days) => {
        const currentSettings = JSON.parse(localStorage.getItem('updateSettings')) || {};
        const newSettings = { ...currentSettings, autoCheckInterval: days };
        localStorage.setItem('updateSettings', JSON.stringify(newSettings));
        setAutoCheckDays(days);
        toast({title: "Auto-check interval saved."});
      };


      const checkForUpdates = () => {
        setChecking(true);
        setUpdateMessage("");
        setLatestVersion(null);
        saveLastCheckedTime();

        setTimeout(() => {
          const availableVersions = ["1.2.1", "1.2.2", "1.3.0"]; // Mock available versions
          const newVersion = availableVersions[Math.floor(Math.random() * availableVersions.length)];
          
          if (newVersion > currentVersion) {
            setLatestVersion(newVersion);
            setUpdateMessage(`New version ${newVersion} is available!`);
            // Store available update for ApplyUpdatesPage
            localStorage.setItem('availableUpdate', JSON.stringify({ version: newVersion, type: 'Software', description: `Includes new features and bug fixes for version ${newVersion}.` }));
          } else {
            setLatestVersion(currentVersion);
            setUpdateMessage("Your system software is up to date.");
            localStorage.removeItem('availableUpdate');
          }
          setChecking(false);
        }, 2000);
      };

      // This function is for the "Apply Update" button on this page
      // The actual ApplyUpdatesPage will handle more complex scenarios
      const handleApplyUpdate = () => {
        if (!latestVersion || latestVersion <= currentVersion) {
          toast({ title: "No Update", description: "No new update to apply or already up to date.", variant: "default" });
          return;
        }
        setDownloading(true);
        setDownloadProgress(0);
        setUpdateMessage(`Downloading version ${latestVersion}...`);

        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setDownloadProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            setDownloading(false);
            
            const updatedHistory = JSON.parse(localStorage.getItem('updateHistory')) || [];
            updatedHistory.unshift({ 
                id: Date.now(), 
                version: latestVersion, 
                date: new Date().toISOString(), 
                status: "Success", 
                type: "Software", 
                notes: `Successfully updated to version ${latestVersion}.` 
            });
            localStorage.setItem('updateHistory', JSON.stringify(updatedHistory));
            
            setCurrentVersion(latestVersion); 
            setLatestVersion(null); 
            localStorage.removeItem('availableUpdate');
            setUpdateMessage(`System successfully updated to version ${latestVersion}!`);
            toast({ title: "Update Successful", description: `System updated to ${latestVersion}.` });
          }
        }, 300);
      };
      
      useEffect(() => {
        // Automatic check on load if configured
        const settings = JSON.parse(localStorage.getItem('updateSettings')) || {};
        if (settings.autoUpdateEnabled && lastChecked) {
            const nextCheckDate = addDays(new Date(lastChecked), autoCheckDays);
            if (new Date() >= nextCheckDate) {
                checkForUpdates();
            }
        } else if (!lastChecked) { // First time load
            checkForUpdates();
        }
      }, [lastChecked, autoCheckDays]);


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
                  <RefreshCw className="mr-3 h-8 w-8 text-primary" /> Check for Updates
                </h1>
                <p className="text-muted-foreground">Check for the latest software and firmware updates.</p>
              </div>
              <Button asChild variant="outline">
                <Link to="/manager/settings/system/updates/settings">
                  <Settings2 className="mr-2 h-4 w-4" /> Update Settings
                </Link>
              </Button>
            </div>

            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white">System Version Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm dark:text-gray-300">Current Software Version: <span className="font-semibold text-primary">{currentVersion}</span></p>
                <p className="text-sm dark:text-gray-300">Current Firmware Version: <span className="font-semibold text-primary">{currentFirmwareVersion}</span> (Main Panel)</p>
                <p className="text-sm text-muted-foreground">
                  Last Checked: {lastChecked ? format(new Date(lastChecked), 'PPpp') : 'Not checked yet'}
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white">Update Check</CardTitle>
                <CardDescription className="dark:text-gray-400">Manually check for updates or configure auto-check.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Button onClick={checkForUpdates} disabled={checking || downloading} className="w-full sm:w-auto">
                    <RefreshCw className={`mr-2 h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
                    {checking ? 'Checking...' : 'Check Now'}
                  </Button>
                  {latestVersion && latestVersion > currentVersion && !downloading && (
                    <Button onClick={handleApplyUpdate} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                      <DownloadCloud className="mr-2 h-4 w-4" /> Apply Update to {latestVersion}
                    </Button>
                  )}
                </div>

                {updateMessage && (
                  <div className={`p-3 rounded-md flex items-center space-x-2 text-sm ${
                    latestVersion && latestVersion > currentVersion ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300' :
                    latestVersion === currentVersion && latestVersion !== null && !checking ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300' :
                    checking ? 'bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300' :
                    'bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300'
                  }`}>
                    {latestVersion && latestVersion > currentVersion ? <Info className="h-5 w-5" /> : 
                     latestVersion === currentVersion && latestVersion !== null && !checking ? <CheckCircle className="h-5 w-5" /> : 
                     <Info className="h-5 w-5" />}
                    <span>{updateMessage}</span>
                  </div>
                )}

                {downloading && (
                  <div className="space-y-2">
                    <Label className="dark:text-gray-300">Downloading Update: {downloadProgress}%</Label>
                    <Progress value={downloadProgress} className="w-full [&>div]:bg-primary" />
                  </div>
                )}
                
                <div className="pt-4 border-t dark:border-slate-700 space-y-2">
                    <Label htmlFor="autoCheckDays" className="dark:text-gray-300">Auto-check for updates every (days):</Label>
                    <div className="flex items-center gap-2">
                        <Input 
                            id="autoCheckDays"
                            type="number" 
                            min="1" 
                            value={autoCheckDays} 
                            onChange={(e) => setAutoCheckDays(parseInt(e.target.value) || 1)} 
                            className="w-24 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                        />
                        <Button variant="outline" onClick={() => saveAutoCheckDays(autoCheckDays)}>Save Interval</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Configure more auto-update settings in <Link to="/manager/settings/system/updates/settings" className="text-primary hover:underline">Update Settings</Link>.
                    </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Layout>
      );
    };

    export default CheckForUpdatesPage;