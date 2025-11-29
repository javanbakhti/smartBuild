import React, { useState, useEffect } from 'react';
    import Layout from '@/components/Layout';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Checkbox } from '@/components/ui/checkbox';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
    import { ShieldCheck, Search, RotateCcw, Download, History } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import Breadcrumbs from '@/components/manager/system/backup/Breadcrumbs';
    import { format } from 'date-fns';

    const DataRecoveryManagementPage = () => {
      const { toast } = useToast();
      const [recoverableItems, setRecoverableItems] = useState([]);
      const [selectedItems, setSelectedItems] = useState({});
      const [isScanning, setIsScanning] = useState(false);
      const [recoveryLog, setRecoveryLog] = useState([]);

      const breadcrumbItems = [
        { name: 'Settings', link: '/manager/settings/general' },
        { name: 'System', link: '/manager/settings/system/updates' },
        { name: 'Backup & Restore', link: '/manager/settings/system/backup-restore' },
        { name: 'Data Recovery' }
      ];

      useEffect(() => {
        // Load recovery log from localStorage
        const storedLog = JSON.parse(localStorage.getItem('dataRecoveryLog')) || [];
        setRecoveryLog(storedLog);
      }, []);

      const saveRecoveryLog = (updatedLog) => {
        localStorage.setItem('dataRecoveryLog', JSON.stringify(updatedLog));
        setRecoveryLog(updatedLog);
      };

      const handleScan = () => {
        setIsScanning(true);
        // Simulate scanning process
        setTimeout(() => {
          const mockData = [
            { id: 'user-123', name: 'John Doe (Deleted User)', type: 'User Profile', dateDeleted: new Date(Date.now() - 86400000 * 2).toISOString() },
            { id: 'config-abc', name: 'Kiosk Settings (Old Version)', type: 'Configuration', dateDeleted: new Date(Date.now() - 86400000 * 5).toISOString() },
            { id: 'unit-404', name: 'Unit A101 (Removed)', type: 'Unit Data', dateDeleted: new Date(Date.now() - 86400000 * 1).toISOString() },
          ];
          setRecoverableItems(mockData);
          setIsScanning(false);
          toast({ title: 'Scan Complete', description: `${mockData.length} recoverable items found.` });
        }, 2000);
      };

      const handleSelectItem = (itemId, checked) => {
        setSelectedItems(prev => ({ ...prev, [itemId]: checked }));
      };

      const handleRestoreSelected = () => {
        const itemsToRestore = recoverableItems.filter(item => selectedItems[item.id]);
        if (itemsToRestore.length === 0) {
          toast({ title: 'No Items Selected', description: 'Please select items to restore.', variant: 'destructive' });
          return;
        }

        // Simulate restoration
        const newLogEntries = itemsToRestore.map(item => ({
          id: `log-${Date.now()}-${item.id}`,
          itemName: item.name,
          itemType: item.type,
          action: 'Restored',
          date: new Date().toISOString(),
          details: `Restored item ID: ${item.id}`
        }));
        
        saveRecoveryLog([...newLogEntries, ...recoveryLog]);
        setRecoverableItems(prev => prev.filter(item => !selectedItems[item.id]));
        setSelectedItems({});
        toast({ title: 'Items Restored', description: `${itemsToRestore.length} items have been successfully restored.` });
      };
      
      const handleDownloadReport = () => {
        if (recoveryLog.length === 0) {
          toast({ title: 'No Data', description: 'Recovery log is empty.', variant: 'destructive' });
          return;
        }
        const csvHeader = "Item Name,Item Type,Action,Date,Details\n";
        const csvRows = recoveryLog.map(log => 
          `"${log.itemName}","${log.itemType}","${log.action}","${format(new Date(log.date), 'yyyy-MM-dd HH:mm:ss')}","${log.details}"`
        ).join("\n");
        const csvContent = csvHeader + csvRows;
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", "recovery_report.csv");
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        toast({ title: 'Report Downloaded', description: 'Recovery report CSV has been downloaded.' });
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
                <ShieldCheck className="mr-3 h-8 w-8 text-primary" /> Data Recovery Tools
              </h1>
              <p className="mt-2 text-muted-foreground">
                Scan your system for recoverable entries. You can restore deleted user profiles, configurations, or export a recovery log.
              </p>
            </div>

            <Card className="mb-6 dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white">Scan for Recoverable Data</CardTitle>
                <CardDescription>Initiate a system scan to find items that can be recovered.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleScan} disabled={isScanning} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Search className="mr-2 h-4 w-4" /> {isScanning ? 'Scanning...' : 'Scan for Recoverable Data'}
                </Button>
                {isScanning && <p className="text-sm text-muted-foreground mt-2 text-center">Scanning system, please wait...</p>}
              </CardContent>
            </Card>

            {recoverableItems.length > 0 && (
              <Card className="mb-6 dark:bg-slate-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="dark:text-white">Recoverable Items</CardTitle>
                  <CardDescription>Select items from the list below to restore.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="dark:border-slate-700">
                        <TableHead className="w-[50px] dark:text-gray-300"><Checkbox 
                          checked={Object.values(selectedItems).some(val => val) && Object.values(selectedItems).length === recoverableItems.length}
                          onCheckedChange={(checked) => {
                            const newSelected = {};
                            if (checked) {
                              recoverableItems.forEach(item => newSelected[item.id] = true);
                            }
                            setSelectedItems(newSelected);
                          }}
                        /></TableHead>
                        <TableHead className="dark:text-gray-300">Item Name</TableHead>
                        <TableHead className="dark:text-gray-300">Type</TableHead>
                        <TableHead className="dark:text-gray-300">Date Deleted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recoverableItems.map((item) => (
                        <TableRow key={item.id} className="dark:border-slate-700 hover:bg-muted/50 dark:hover:bg-slate-700/50">
                          <TableCell><Checkbox checked={!!selectedItems[item.id]} onCheckedChange={(checked) => handleSelectItem(item.id, checked)} /></TableCell>
                          <TableCell className="font-medium dark:text-white">{item.name}</TableCell>
                          <TableCell className="dark:text-gray-300">{item.type}</TableCell>
                          <TableCell className="dark:text-gray-300">{format(new Date(item.dateDeleted), 'PPpp')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 flex justify-end">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button disabled={Object.values(selectedItems).filter(Boolean).length === 0} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          <RotateCcw className="mr-2 h-4 w-4" /> Restore Selected ({Object.values(selectedItems).filter(Boolean).length})
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="dark:bg-slate-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="dark:text-white">Confirm Restore</AlertDialogTitle>
                          <AlertDialogDescription className="dark:text-gray-300">
                            Are you sure you want to restore the selected {Object.values(selectedItems).filter(Boolean).length} item(s)?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleRestoreSelected} className="bg-primary hover:bg-primary/90">Restore</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="dark:text-white flex items-center"><History className="mr-2 h-5 w-5"/>Recovery History Log</CardTitle>
                  <CardDescription>Read-only log of data recovery actions.</CardDescription>
                </div>
                <Button variant="outline" onClick={handleDownloadReport} disabled={recoveryLog.length === 0} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">
                  <Download className="mr-2 h-4 w-4" /> Download Report
                </Button>
              </CardHeader>
              <CardContent>
                {recoveryLog.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="dark:border-slate-700">
                        <TableHead className="dark:text-gray-300">Item Name</TableHead>
                        <TableHead className="dark:text-gray-300">Type</TableHead>
                        <TableHead className="dark:text-gray-300">Action</TableHead>
                        <TableHead className="dark:text-gray-300">Date</TableHead>
                        <TableHead className="dark:text-gray-300">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recoveryLog.map((logEntry) => (
                        <TableRow key={logEntry.id} className="dark:border-slate-700 hover:bg-muted/50 dark:hover:bg-slate-700/50">
                          <TableCell className="font-medium dark:text-white">{logEntry.itemName}</TableCell>
                          <TableCell className="dark:text-gray-300">{logEntry.itemType}</TableCell>
                          <TableCell className="dark:text-gray-300">{logEntry.action}</TableCell>
                          <TableCell className="dark:text-gray-300">{format(new Date(logEntry.date), 'PPpp')}</TableCell>
                          <TableCell className="dark:text-gray-300 text-xs">{logEntry.details}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No recovery actions logged yet.</p>
                )}
              </CardContent>
            </Card>

          </motion.div>
        </Layout>
      );
    };

    export default DataRecoveryManagementPage;