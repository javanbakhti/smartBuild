import React, { useState, useEffect, useRef } from 'react';
    import Layout from '@/components/Layout';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { DownloadCloud, Upload, AlertTriangle, History, Download, Trash2, RotateCcw, ShieldAlert } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import Breadcrumbs from '@/components/manager/system/backup/Breadcrumbs';
    import { Progress } from '@/components/ui/progress';
    import { format } from 'date-fns';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';


    const RestoreBackupPage = () => {
      const { toast } = useToast();
      const [selectedFile, setSelectedFile] = useState(null);
      const [fileName, setFileName] = useState('');
      const [isRestoring, setIsRestoring] = useState(false);
      const [restoreProgress, setRestoreProgress] = useState(0);
      const fileInputRef = useRef(null);
      const [availableBackups, setAvailableBackups] = useState([]);
      const [backupToRestore, setBackupToRestore] = useState(null);
      const [passphrase, setPassphrase] = useState('');
      const [isPassphraseModalOpen, setIsPassphraseModalOpen] = useState(false);


      const breadcrumbItems = [
        { name: 'Settings', link: '/manager/settings/general' },
        { name: 'System', link: '/manager/settings/system/updates' },
        { name: 'Backup & Restore', link: '/manager/settings/system/backup-restore' },
        { name: 'Restore from Backup' }
      ];

      useEffect(() => {
        const storedBackups = JSON.parse(localStorage.getItem('systemBackups')) || [];
        setAvailableBackups(storedBackups);
      }, []);

      const saveBackupsToLocalStorage = (updatedBackups) => {
        localStorage.setItem('systemBackups', JSON.stringify(updatedBackups));
        setAvailableBackups(updatedBackups);
      };

      const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
          if (file.name.endsWith('.json') || file.name.endsWith('.bak')) {
            setSelectedFile(file);
            setFileName(file.name);
          } else {
            toast({
              title: 'Invalid File Type',
              description: 'Please select a .json or .bak backup file.',
              variant: 'destructive',
            });
            setSelectedFile(null);
            setFileName('');
            if(fileInputRef.current) fileInputRef.current.value = "";
          }
        }
      };

      const startRestoreProcess = (backupName) => {
        setIsRestoring(true);
        setRestoreProgress(0);
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setRestoreProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            setIsRestoring(false);
            toast({ title: 'Restore Complete', description: `${backupName} has been successfully restored.` });
            setSelectedFile(null);
            setFileName('');
            if(fileInputRef.current) fileInputRef.current.value = "";
            setBackupToRestore(null);
            setPassphrase('');
            setIsPassphraseModalOpen(false);
          }
        }, 300);
      };
      
      const handleConfirmRestoreFromFile = () => {
        if (!selectedFile) {
          toast({ title: 'No File Selected', description: 'Please select a backup file to restore.', variant: 'destructive' });
          return;
        }
        // For file uploads, we assume it might be encrypted and could add a checkbox "This backup is encrypted"
        // For simplicity now, directly start restore or prompt if a global encryption setting implies it.
        // This example assumes uploaded backups might need a passphrase if any backup was made with encryption.
        const backupSettings = JSON.parse(localStorage.getItem('backupSettingsV2')) || {};
        if (backupSettings.encryptionEnabled) { // A simplified check
            setBackupToRestore({name: fileName, encrypted: true, isFile: true});
            setIsPassphraseModalOpen(true);
        } else {
            startRestoreProcess(fileName);
        }
      };

      const handleRestoreFromList = (backup) => {
        setBackupToRestore(backup);
        if (backup.encrypted) {
          setIsPassphraseModalOpen(true);
        } else {
          // Directly show confirmation dialog for non-encrypted backups
          // This AlertDialogTrigger would be on the "Restore" button in the table
          // For now, we'll trigger the process after this function if not encrypted
           startRestoreProcess(backup.name); // Or trigger confirmation dialog first
        }
      };
      
      const handlePassphraseSubmit = () => {
        // Here, you would typically verify the passphrase. For simulation:
        if (passphrase === "correct-passphrase" || !backupToRestore.encrypted) { // Simplified check
          toast({ title: "Passphrase Accepted", description: "Starting restore process..." });
          startRestoreProcess(backupToRestore.name);
        } else if (backupToRestore.encrypted && passphrase !== "correct-passphrase") {
           toast({ title: "Incorrect Passphrase", description: "The passphrase entered is incorrect.", variant: "destructive" });
        } else {
           startRestoreProcess(backupToRestore.name); // If not encrypted
        }
      };


      const handleDeleteBackup = (backupId) => {
        const updatedBackups = availableBackups.filter(b => b.id !== backupId);
        saveBackupsToLocalStorage(updatedBackups);
        toast({ title: 'Backup Deleted', description: 'The selected backup has been deleted.', variant: 'destructive' });
      };

      const handleDownloadBackup = (backup) => {
        toast({ title: 'Download Started', description: `Downloading ${backup.name}... (Simulated)` });
        const mockContent = JSON.stringify({ backupData: backup, systemConfig: { version: "1.0.0" } });
        const blob = new Blob([mockContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${backup.name}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };


      return (
        <Layout role="manager">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8"
          >
            <Breadcrumbs items={breadcrumbItems} />
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white flex items-center">
                <DownloadCloud className="mr-3 h-8 w-8 text-primary" /> Restore Your System
              </h1>
              <p className="mt-2 text-muted-foreground">
                Upload or select a previously saved backup. This action will overwrite current data, so please proceed with caution.
              </p>
            </div>

            {/* Available Backups Section */}
            <Card className="mb-8 dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white">Available Backups</CardTitle>
                <CardDescription>Manage and restore from your previously created system backups.</CardDescription>
              </CardHeader>
              <CardContent>
                {availableBackups.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="dark:border-slate-700">
                        <TableHead className="dark:text-gray-300">Name</TableHead>
                        <TableHead className="dark:text-gray-300">Date/Time</TableHead>
                        <TableHead className="dark:text-gray-300">Type</TableHead>
                        <TableHead className="dark:text-gray-300">Size</TableHead>
                        <TableHead className="dark:text-gray-300">Encrypted</TableHead>
                        <TableHead className="text-right dark:text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableBackups.map((backup) => (
                        <TableRow key={backup.id} className="dark:border-slate-700 hover:bg-muted/50 dark:hover:bg-slate-700/50">
                          <TableCell className="font-medium dark:text-white">{backup.name}</TableCell>
                          <TableCell className="dark:text-gray-300">{format(new Date(backup.date), 'PPpp')}</TableCell>
                          <TableCell className="dark:text-gray-300">{backup.type}</TableCell>
                          <TableCell className="dark:text-gray-300">{backup.size}</TableCell>
                          <TableCell className="dark:text-gray-300">{backup.encrypted ? <ShieldAlert className="h-4 w-4 text-amber-500"/> : '-'}</TableCell>
                          <TableCell className="text-right space-x-1">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-primary dark:text-purple-400 dark:hover:bg-purple-700/50">
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="dark:bg-slate-800">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="dark:text-white">Confirm Restore</AlertDialogTitle>
                                        <AlertDialogDescription className="dark:text-gray-300">
                                            Restoring from "{backup.name}" will overwrite current data. Are you sure?
                                            {backup.encrypted && " This backup is encrypted and will require a passphrase."}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleRestoreFromList(backup)} className="bg-primary hover:bg-primary/90">Confirm & Restore</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button variant="ghost" size="icon" onClick={() => handleDownloadBackup(backup)} className="dark:text-gray-300 dark:hover:bg-slate-700">
                              <Download className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive dark:text-red-500 dark:hover:bg-red-900/50">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="dark:bg-slate-800">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="dark:text-white">Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription className="dark:text-gray-300">
                                    This action cannot be undone. This will permanently delete the backup file "{backup.name}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteBackup(backup.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No backups available. Create one in Backup Configuration.</p>
                )}
              </CardContent>
            </Card>


            {/* Upload Backup File Section */}
            <Card className="max-w-2xl mx-auto dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white">Upload Backup File</CardTitle>
                <CardDescription>Select a .bak or .json backup file from your computer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="backupFile" className="sr-only">Backup File</Label>
                  <Input 
                    id="backupFile" 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange} 
                    accept=".json,.bak" 
                    className="dark:bg-slate-700 dark:text-white dark:border-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary dark:file:bg-purple-700/20 dark:file:text-purple-300 hover:file:bg-primary/20"
                  />
                  {fileName && <p className="text-sm text-muted-foreground mt-2">Selected file: {fileName}</p>}
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-md border border-red-200 dark:border-red-700">
                  <div className="flex items-start">
                    <AlertTriangle className="h-6 w-6 text-red-500 dark:text-red-400 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-red-700 dark:text-red-300">Warning: Data Overwrite</h4>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Restoring will overwrite existing data. Make sure you’ve downloaded the current state before continuing if needed. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                
                {isRestoring && (
                  <div className="space-y-2">
                    <Label className="dark:text-gray-300">Restore Progress:</Label>
                    <Progress value={restoreProgress} className="w-full" />
                    <p className="text-sm text-muted-foreground text-center">{restoreProgress}% Complete</p>
                  </div>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={!selectedFile || isRestoring}>
                      <Upload className="mr-2 h-4 w-4" /> {isRestoring ? 'Restoring...' : 'Start Restore from File'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="dark:bg-slate-800">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="dark:text-white">Confirm Restore Operation</AlertDialogTitle>
                      <AlertDialogDescription className="dark:text-gray-300">
                        Are you absolutely sure you want to restore the system from the backup file "{fileName}"? This will overwrite all current system configurations and data. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleConfirmRestoreFromFile} className="bg-destructive hover:bg-destructive/90">Confirm Restore</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
            
            <Dialog open={isPassphraseModalOpen} onOpenChange={setIsPassphraseModalOpen}>
                <DialogContent className="dark:bg-slate-800">
                    <DialogHeader>
                        <DialogTitle className="dark:text-white">Enter Passphrase</DialogTitle>
                        <DialogDescription className="dark:text-gray-300">
                            The backup "{backupToRestore?.name}" is encrypted. Please enter the passphrase to restore.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="passphraseInput" className="dark:text-gray-300">Passphrase</Label>
                        <Input 
                            id="passphraseInput" 
                            type="password" 
                            value={passphrase} 
                            onChange={(e) => setPassphrase(e.target.value)}
                            className="dark:bg-slate-700 dark:text-white dark:border-slate-600 mt-1"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {setIsPassphraseModalOpen(false); setPassphrase(''); setBackupToRestore(null);}} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">Cancel</Button>
                        <Button onClick={handlePassphraseSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">Submit & Restore</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card className="max-w-2xl mx-auto mt-8 dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center"><History className="mr-2 h-5 w-5"/>Restore History (Placeholder)</CardTitle>
                <CardDescription>This section will show a log of past restore attempts.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-4">Restore history will be available in a future update.</p>
              </CardContent>
            </Card>

          </motion.div>
        </Layout>
      );
    };

    export default RestoreBackupPage;