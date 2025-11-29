import React, { useState } from 'react';
    import Layout from '@/components/Layout';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { DatabaseBackup, UploadCloud, DownloadCloud, AlertTriangle, History, Shield } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Progress } from "@/components/ui/progress";

    const mockBackups = [
      { id: 'backup_20250520_100000', date: "2025-05-20 10:00 AM", size: "15.2 MB", type: "Full System" },
      { id: 'backup_20250515_083000', date: "2025-05-15 08:30 AM", size: "14.8 MB", type: "Full System" },
      { id: 'backup_20250510_140000', date: "2025-05-10 02:00 PM", size: "5.1 MB", type: "User Data Only" },
    ];

    const DataRecoveryPage = () => {
      const { toast } = useToast();
      const [isBackingUp, setIsBackingUp] = useState(false);
      const [backupProgress, setBackupProgress] = useState(0);
      const [isRestoring, setIsRestoring] = useState(false);
      const [restoreProgress, setRestoreProgress] = useState(0);
      const [selectedFile, setSelectedFile] = useState(null);

      const handleCreateBackup = () => {
        setIsBackingUp(true);
        setBackupProgress(0);
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setBackupProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            setIsBackingUp(false);
            toast({ title: "Backup Created (Simulated)", description: "System configuration has been backed up successfully." });
            // Add to mockBackups or trigger a list refresh in a real app
          }
        }, 200);
      };

      const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
          setSelectedFile(event.target.files[0]);
        } else {
          setSelectedFile(null);
        }
      };

      const handleRestoreBackup = () => {
        if (!selectedFile && !mockBackups[0]) { // Example: restore latest from list if no file selected
            toast({ title: "No Backup Selected", description: "Please select a backup file to restore or ensure a backup exists.", variant: "destructive" });
            return;
        }
        if (!window.confirm("Restoring from a backup will overwrite current settings. Are you sure you want to proceed? This action cannot be undone.")) {
            return;
        }

        setIsRestoring(true);
        setRestoreProgress(0);
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setRestoreProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            setIsRestoring(false);
            setSelectedFile(null); // Clear selected file
            toast({ title: "Restore Complete (Simulated)", description: `System restored from ${selectedFile ? selectedFile.name : mockBackups[0].id}. A system restart may be required.` });
          }
        }, 300);
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
                  <DatabaseBackup className="mr-3 h-8 w-8 text-primary" /> Backup & Restore
                </h1>
                <p className="text-muted-foreground">Manage system configuration backups and data recovery options.</p>
              </div>
            </div>

            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white">Create Backup</CardTitle>
                <CardDescription className="dark:text-gray-400">Backup your current system configuration and user data.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleCreateBackup} disabled={isBackingUp || isRestoring} className="w-full sm:w-auto">
                  <UploadCloud className={`mr-2 h-4 w-4 ${isBackingUp ? 'animate-ping' : ''}`} />
                  {isBackingUp ? `Backing Up... ${backupProgress}%` : 'Create New Backup'}
                </Button>
                {isBackingUp && <Progress value={backupProgress} className="w-full [&>div]:bg-primary" />}
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-md flex items-start space-x-2 text-sm">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-700 dark:text-yellow-300">
                    <strong>Important:</strong> Store backups in a secure, external location. Regular backups are recommended, especially before system updates or major changes. (This is a mock interface).
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white">Restore from Backup</CardTitle>
                <CardDescription className="dark:text-gray-400">Restore system settings from a previously created backup file.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="backupFile" className="dark:text-gray-300">Select Backup File (.bak - simulated)</Label>
                    <Input id="backupFile" type="file" onChange={handleFileChange} accept=".bak" className="dark:bg-slate-700 dark:text-white dark:border-slate-600 file:text-primary file:font-medium file:mr-2" disabled={isRestoring || isBackingUp}/>
                    {selectedFile && <p className="text-xs text-muted-foreground">Selected: {selectedFile.name}</p>}
                </div>
                <Button onClick={handleRestoreBackup} disabled={isRestoring || isBackingUp || (!selectedFile && mockBackups.length === 0)} className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white">
                  <DownloadCloud className={`mr-2 h-4 w-4 ${isRestoring ? 'animate-ping' : ''}`} />
                  {isRestoring ? `Restoring... ${restoreProgress}%` : 'Restore Selected Backup'}
                </Button>
                {isRestoring && <Progress value={restoreProgress} className="w-full [&>div]:bg-orange-500" />}
                 <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md flex items-start space-x-2 text-sm">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-700 dark:text-red-300">
                    <strong>Warning:</strong> Restoring will overwrite all current configurations and potentially user data with the content from the backup file. This action cannot be undone.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="dark:bg-slate-800 shadow-lg">
                <CardHeader>
                    <CardTitle className="dark:text-white flex items-center"><History className="mr-2 h-5 w-5"/>Available Backups (Simulated)</CardTitle>
                    <CardDescription className="dark:text-gray-400">List of recently created backups.</CardDescription>
                </CardHeader>
                <CardContent>
                    {mockBackups.length > 0 ? (
                        <ul className="space-y-2 text-sm">
                            {mockBackups.map(backup => (
                                <li key={backup.id} className="flex justify-between items-center p-2 rounded hover:bg-muted/50 dark:hover:bg-slate-700/50">
                                    <span className="dark:text-gray-300"><Shield className="inline mr-2 h-4 w-4 text-green-500"/>{backup.id} ({backup.type}) - {backup.size}</span>
                                    <span className="text-xs text-muted-foreground">{backup.date}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">No backups found.</p>
                    )}
                </CardContent>
            </Card>

          </motion.div>
        </Layout>
      );
    };

    export default DataRecoveryPage;