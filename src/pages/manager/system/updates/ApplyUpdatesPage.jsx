import React, { useState, useEffect } from 'react';
    import Layout from '@/components/Layout';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Label } from '@/components/ui/label';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
    import { DownloadCloud, Shield, AlertTriangle, ListChecks } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { Progress } from "@/components/ui/progress";
    import BreadcrumbsUpdates from '@/components/manager/system/updates/BreadcrumbsUpdates';

    const ApplyUpdatesPage = () => {
      const { toast } = useToast();
      const [availableUpdates, setAvailableUpdates] = useState([]);
      const [selectedUpdates, setSelectedUpdates] = useState({});
      const [isUpdating, setIsUpdating] = useState(false);
      const [updateProgress, setUpdateProgress] = useState(0);
      const [currentUpdateStep, setCurrentUpdateStep] = useState("");
      const [backupBeforeUpdate, setBackupBeforeUpdate] = useState(true);

      const breadcrumbItems = [
        { name: 'Settings', link: '/manager/settings/general' },
        { name: 'System', link: '/manager/settings/system/updates' },
        { name: 'Updates Hub', link: '/manager/settings/system/updates' },
        { name: 'Apply Updates' }
      ];

      useEffect(() => {
        // Load available updates (e.g., from localStorage set by CheckForUpdatesPage or a mock)
        const storedUpdate = JSON.parse(localStorage.getItem('availableUpdate'));
        const mockFirmwareUpdates = [
          { id: 'fw-main-panel-1.0.9', version: 'FW 1.0.9', type: 'Firmware', description: 'Main Panel: Stability improvements and new API hooks.', size: '5.2MB', criticality: 'Medium' },
          { id: 'fw-door-unit-2.3.1', version: 'FW 2.3.1', type: 'Firmware', description: 'Door Unit XA: Enhanced sensor readings.', size: '1.8MB', criticality: 'Low' },
        ];
        let updatesToShow = [];
        if (storedUpdate) {
            updatesToShow.push({ id: `sw-${storedUpdate.version}`, ...storedUpdate, size: 'Approx. 25MB', criticality: 'High' });
        }
        updatesToShow = updatesToShow.concat(mockFirmwareUpdates);
        setAvailableUpdates(updatesToShow);

        // Pre-select all critical/high updates
        const preSelected = {};
        updatesToShow.forEach(upd => {
            if (upd.criticality === 'High' || upd.criticality === 'Critical') {
                preSelected[upd.id] = true;
            }
        });
        setSelectedUpdates(preSelected);

      }, []);

      const handleSelectUpdate = (updateId, checked) => {
        setSelectedUpdates(prev => ({ ...prev, [updateId]: checked }));
      };

      const handleSelectAllUpdates = (checked) => {
        const newSelected = {};
        if (checked) {
          availableUpdates.forEach(update => newSelected[update.id] = true);
        }
        setSelectedUpdates(newSelected);
      };

      const numSelectedUpdates = Object.values(selectedUpdates).filter(Boolean).length;

      const startUpdateProcess = () => {
        if (numSelectedUpdates === 0) {
          toast({ title: 'No Updates Selected', description: 'Please select at least one update to apply.', variant: 'destructive' });
          return;
        }

        setIsUpdating(true);
        setUpdateProgress(0);
        
        if (backupBeforeUpdate) {
          setCurrentUpdateStep("Backing up system (simulated)...");
          // Simulate backup
          setTimeout(() => {
            toast({ title: "Backup Complete (Simulated)", description: "System backup created before update." });
            proceedWithUpdates();
          }, 2000);
        } else {
          proceedWithUpdates();
        }
      };

      const proceedWithUpdates = () => {
        const updatesToApply = availableUpdates.filter(upd => selectedUpdates[upd.id]);
        let currentUpdateIndex = 0;
        let overallProgress = 0;

        const applyNextUpdate = () => {
          if (currentUpdateIndex >= updatesToApply.length) {
            setIsUpdating(false);
            toast({ title: "All Updates Applied", description: "Selected updates have been successfully applied." });
            setCurrentUpdateStep("All updates completed!");
            setUpdateProgress(100);
            // Clear applied updates from available list (or mark as applied)
            const remainingUpdates = availableUpdates.filter(upd => !selectedUpdates[upd.id]);
            setAvailableUpdates(remainingUpdates);
            setSelectedUpdates({});
            localStorage.removeItem('availableUpdate'); // Clear software update specifically
            
            const history = JSON.parse(localStorage.getItem('updateHistory')) || [];
            updatesToApply.forEach(upd => {
                history.unshift({
                    id: upd.id + Date.now(),
                    version: upd.version,
                    date: new Date().toISOString(),
                    status: "Success",
                    type: upd.type,
                    notes: `Successfully applied ${upd.description.substring(0, 50)}...`
                });
            });
            localStorage.setItem('updateHistory', JSON.stringify(history));
            return;
          }

          const update = updatesToApply[currentUpdateIndex];
          setCurrentUpdateStep(`Applying: ${update.version} (${update.type})...`);
          
          // Simulate individual update progress
          let singleUpdateProgress = 0;
          const progressInterval = setInterval(() => {
            singleUpdateProgress += 20; // Each update takes 5 steps (20% each)
            overallProgress = ((currentUpdateIndex / updatesToApply.length) * 100) + (singleUpdateProgress / updatesToApply.length);
            setUpdateProgress(Math.min(100, Math.round(overallProgress)));

            if (singleUpdateProgress >= 100) {
              clearInterval(progressInterval);
              currentUpdateIndex++;
              applyNextUpdate();
            }
          }, 500); // 0.5s per 20% step of an individual update
        };
        applyNextUpdate();
      };

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
                  <DownloadCloud className="mr-3 h-8 w-8 text-primary" /> Apply System Updates
                </h1>
                <p className="text-muted-foreground">Select and apply available updates to your system.</p>
              </div>
            </div>

            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white">Available Updates</CardTitle>
                <CardDescription className="dark:text-gray-400">Select the updates you want to install.</CardDescription>
              </CardHeader>
              <CardContent>
                {availableUpdates.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 p-2 border-b dark:border-slate-700">
                      <Checkbox
                        id="selectAllUpdates"
                        checked={numSelectedUpdates === availableUpdates.length && availableUpdates.length > 0}
                        onCheckedChange={handleSelectAllUpdates}
                        disabled={isUpdating}
                      />
                      <Label htmlFor="selectAllUpdates" className="font-semibold dark:text-gray-300">Select All ({numSelectedUpdates}/{availableUpdates.length})</Label>
                    </div>
                    <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                    {availableUpdates.map(update => (
                      <Card key={update.id} className={`p-4 dark:bg-slate-700/50 ${selectedUpdates[update.id] ? 'border-primary dark:border-purple-500' : 'dark:border-slate-600'}`}>
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id={update.id}
                            checked={!!selectedUpdates[update.id]}
                            onCheckedChange={(checked) => handleSelectUpdate(update.id, checked)}
                            className="mt-1"
                            disabled={isUpdating}
                          />
                          <div className="flex-1">
                            <Label htmlFor={update.id} className="font-semibold text-base dark:text-white">{update.version} <span className="text-xs font-normal text-muted-foreground">({update.type})</span></Label>
                            <p className="text-sm text-muted-foreground dark:text-gray-400">{update.description}</p>
                            <p className="text-xs text-muted-foreground dark:text-gray-500">Size: {update.size} | Criticality: {update.criticality}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No updates currently available. Check again later or use the "Check for Updates" page.</p>
                )}
              </CardContent>
            </Card>

            {availableUpdates.length > 0 && (
              <Card className="dark:bg-slate-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="dark:text-white">Update Process</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="backupReminder" 
                      checked={backupBeforeUpdate} 
                      onCheckedChange={setBackupBeforeUpdate}
                      disabled={isUpdating}
                    />
                    <Label htmlFor="backupReminder" className="dark:text-gray-300">Perform system backup before updating (Recommended)</Label>
                  </div>
                  
                  {isUpdating && (
                    <div className="space-y-2">
                      <Label className="dark:text-gray-300">{currentUpdateStep}</Label>
                      <Progress value={updateProgress} className="w-full [&>div]:bg-primary" />
                      <p className="text-sm text-muted-foreground text-center">{updateProgress}% Complete</p>
                    </div>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white" disabled={isUpdating || numSelectedUpdates === 0}>
                        <ListChecks className="mr-2 h-4 w-4" /> Apply {numSelectedUpdates} Selected Update(s)
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="dark:bg-slate-800">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-white">Confirm Update Process</AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-gray-300">
                          You are about to apply {numSelectedUpdates} update(s). 
                          {backupBeforeUpdate && " A system backup will be performed first (simulated). "}
                          The system may restart during this process. Ensure no critical operations are ongoing.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700" disabled={isUpdating}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={startUpdateProcess} className="bg-green-600 hover:bg-green-700" disabled={isUpdating}>
                          Confirm and Start Updates
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-700">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mr-2 flex-shrink-0" />
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Ensure the system has a stable power supply and network connection during the update process. Interruptions might lead to system instability.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </Layout>
      );
    };

    export default ApplyUpdatesPage;