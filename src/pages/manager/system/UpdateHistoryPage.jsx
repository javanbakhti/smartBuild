import React from 'react';
    import Layout from '@/components/Layout';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { History, CheckCircle, AlertCircle } from 'lucide-react';
    import { motion } from 'framer-motion';

    const mockUpdateHistory = [
      { id: 1, version: "1.2.0", date: "2025-05-20 10:00 AM", status: "Success", type: "Software", notes: "BMS & IoT, Support Menu added." },
      { id: 2, version: "1.1.0", date: "2025-05-15 02:30 PM", status: "Success", type: "Software", notes: "Messaging & Unit Groups implemented." },
      { id: 3, version: "Device FW 1.0.8", date: "2025-05-12 09:00 AM", status: "Success", type: "Firmware (Lobby Intercom)", notes: "Improved call stability." },
      { id: 4, version: "1.0.5", date: "2025-05-10 11:00 AM", status: "Success", type: "Software", notes: "Admin enhancements and bug fixes." },
      { id: 5, version: "Security Patch KB002", date: "2025-05-05 03:00 AM", status: "Success", type: "Security", notes: "Critical vulnerability addressed." },
    ];

    const UpdateHistoryPage = () => {
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
                  <History className="mr-3 h-8 w-8 text-primary" /> Update History
                </h1>
                <p className="text-muted-foreground">View a log of all past system software and firmware updates.</p>
              </div>
            </div>

            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white">Past Updates Log</CardTitle>
                <CardDescription className="dark:text-gray-400">Chronological list of applied updates.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="dark:border-slate-700">
                        <TableHead className="dark:text-gray-300">Version / Patch</TableHead>
                        <TableHead className="dark:text-gray-300">Date Applied</TableHead>
                        <TableHead className="dark:text-gray-300">Type</TableHead>
                        <TableHead className="dark:text-gray-300">Status</TableHead>
                        <TableHead className="dark:text-gray-300">Notes / Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockUpdateHistory.length > 0 ? mockUpdateHistory.map((update) => (
                        <TableRow key={update.id} className="dark:border-slate-700 hover:bg-muted/50 dark:hover:bg-slate-700/50">
                          <TableCell className="font-medium dark:text-white">{update.version}</TableCell>
                          <TableCell className="dark:text-gray-300">{update.date}</TableCell>
                          <TableCell className="dark:text-gray-300">{update.type}</TableCell>
                          <TableCell>
                            <span className={`flex items-center text-xs font-semibold ${
                              update.status === "Success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            }`}>
                              {update.status === "Success" ? <CheckCircle className="mr-1 h-4 w-4" /> : <AlertCircle className="mr-1 h-4 w-4" />}
                              {update.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground dark:text-gray-400">{update.notes}</TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center dark:text-gray-300">
                            No update history found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Layout>
      );
    };

    export default UpdateHistoryPage;