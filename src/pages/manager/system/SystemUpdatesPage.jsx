import React, { useState, useEffect } from 'react';
    import Layout from '@/components/Layout';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Label } from '@/components/ui/label'; // Added import for Label
    import { RefreshCw, DownloadCloud, AlertTriangle, CheckCircle, Info } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { Progress } from "@/components/ui/progress";


    const SystemUpdatesPage = () => {
      const { toast } = useToast();
      const [currentVersion, setCurrentVersion] = useState("1.2.0"); // Mock current version
      const [latestVersion, setLatestVersion] = useState(null);
      const [checking, setChecking] = useState(false);
      const [downloading, setDownloading] = useState(false);
      const [downloadProgress, setDownloadProgress] = useState(0);
      const [updateMessage, setUpdateMessage] = useState("");

      const checkForUpdates = () => {
        setChecking(true);
        setUpdateMessage("");
        setLatestVersion(null);
        setTimeout(() => {
          // Simulate API call
          const availableVersions = ["1.2.0", "1.2.1", "1.3.0"];
          const newVersion = availableVersions[Math.floor(Math.random() * availableVersions.length)];
          
          if (newVersion > currentVersion) {
            setLatestVersion(newVersion);
            setUpdateMessage(`New version ${newVersion} is available!`);
          } else {
            setLatestVersion(currentVersion);
            setUpdateMessage("Your system is up to date.");
          }
          setChecking(false);
        }, 2000);
      };

      const applyUpdate = () => {
        if (!latestVersion || latestVersion <= currentVersion) {
          toast({ title: "No Update", description: "No new update to apply or already up to date.", variant: "default" });
          return;
        }
        setDownloading(true);
        setDownloadProgress(0);
        setUpdateMessage(`Downloading version ${latestVersion}...`);

        // Simulate download progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setDownloadProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            setDownloading(false);
            setCurrentVersion(latestVersion); // Update current version
            setLatestVersion(null); // Reset latest version check
            setUpdateMessage(`System successfully updated to version ${latestVersion}! Restart may be required (simulated).`);
            toast({ title: "Update Successful", description: `System updated to ${latestVersion}.` });
          }
        }, 300);
      };
      
      useEffect(() => {
        checkForUpdates(); // Initial check on page load
      }, []);


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
                  <RefreshCw className="mr-3 h-8 w-8 text-primary" /> System Updates
                </h1>
                <p className="text-muted-foreground">Manage software and firmware updates for your intercom system.</p>
              </div>
            </div>

            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white">Software Update Status</CardTitle>
                <CardDescription className="dark:text-gray-400">Current System Version: <span className="font-semibold text-primary">{currentVersion}</span></CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Button onClick={checkForUpdates} disabled={checking || downloading} className="w-full sm:w-auto">
                    <RefreshCw className={`mr-2 h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
                    {checking ? 'Checking...' : 'Check for Updates'}
                  </Button>
                  {latestVersion && latestVersion > currentVersion && !downloading && (
                    <Button onClick={applyUpdate} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                      <DownloadCloud className="mr-2 h-4 w-4" /> Apply Update to {latestVersion}
                    </Button>
                  )}
                </div>

                {updateMessage && (
                  <div className={`p-3 rounded-md flex items-center space-x-2 text-sm ${
                    latestVersion && latestVersion > currentVersion ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300' :
                    latestVersion === currentVersion && latestVersion !== null ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300' :
                    'bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300'
                  }`}>
                    {latestVersion && latestVersion > currentVersion ? <Info className="h-5 w-5" /> : latestVersion === currentVersion && latestVersion !== null ? <CheckCircle className="h-5 w-5" /> : <Info className="h-5 w-5" />}
                    <span>{updateMessage}</span>
                  </div>
                )}

                {downloading && (
                  <div className="space-y-2">
                    <Label className="dark:text-gray-300">Downloading Update: {downloadProgress}%</Label>
                    <Progress value={downloadProgress} className="w-full [&>div]:bg-primary" />
                  </div>
                )}
                
                <div className="pt-4 border-t dark:border-slate-700">
                    <h4 className="font-semibold mb-2 dark:text-gray-200">Update Policy</h4>
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                        Automatic updates may be applied during off-peak hours for critical security patches. Major feature updates will require manual initiation. 
                        Always ensure your system configuration is backed up before applying major updates. (This is a mock interface).
                    </p>
                </div>
              </CardContent>
            </Card>
             <Card className="dark:bg-slate-800 shadow-lg">
                <CardHeader>
                    <CardTitle className="dark:text-white">Firmware Updates (Device Specific)</CardTitle>
                    <CardDescription className="dark:text-gray-400">Firmware updates for connected devices (intercoms, keypads) are typically managed automatically or via their specific configuration pages.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground dark:text-gray-300">
                        No device-specific firmware actions available here. Please check individual device settings if applicable. (This is a mock interface).
                    </p>
                </CardContent>
            </Card>
          </motion.div>
        </Layout>
      );
    };

    export default SystemUpdatesPage;