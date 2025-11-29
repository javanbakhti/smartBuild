import React, { useState, useEffect } from 'react';
    import Layout from '@/components/Layout';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Input } from '@/components/ui/input';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Button } from '@/components/ui/button';
    import { History, CheckCircle, AlertCircle, Search, Filter, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
    import { motion } from 'framer-motion';
    import BreadcrumbsUpdates from '@/components/manager/system/updates/BreadcrumbsUpdates';
    import { format } from 'date-fns';

    const ITEMS_PER_PAGE = 10;

    const UpdateHistoryLogPage = () => {
      const [allHistory, setAllHistory] = useState([]);
      const [filteredHistory, setFilteredHistory] = useState([]);
      const [searchTerm, setSearchTerm] = useState('');
      const [filterType, setFilterType] = useState('all');
      const [filterStatus, setFilterStatus] = useState('all');
      const [currentPage, setCurrentPage] = useState(1);

      const breadcrumbItems = [
        { name: 'Settings', link: '/manager/settings/general' },
        { name: 'System', link: '/manager/settings/system/updates' },
        { name: 'Updates Hub', link: '/manager/settings/system/updates' },
        { name: 'Update History' }
      ];
      
      useEffect(() => {
        const mockUpdateHistory = [
          { id: 1, version: "1.2.1", date: "2025-06-10 10:00 AM", status: "Success", type: "Software", notes: "Enhanced Backup & Restore section." },
          { id: 2, version: "1.2.0", date: "2025-05-20 10:00 AM", status: "Success", type: "Software", notes: "BMS & IoT, Support Menu added." },
          { id: 3, version: "1.1.0", date: "2025-05-15 02:30 PM", status: "Success", type: "Software", notes: "Messaging & Unit Groups implemented." },
          { id: 4, version: "Device FW 1.0.8", date: "2025-05-12 09:00 AM", status: "Success", type: "Firmware", notes: "Improved call stability for Lobby Intercom." },
          { id: 5, version: "1.0.5", date: "2025-05-10 11:00 AM", status: "Failed", type: "Software", notes: "Admin enhancements - Rollback initiated." },
          { id: 6, version: "Security Patch KB002", date: "2025-05-05 03:00 AM", status: "Success", type: "Security", notes: "Critical vulnerability addressed." },
        ];
        const storedHistory = JSON.parse(localStorage.getItem('updateHistory')) || [];
        const combinedHistory = [...storedHistory, ...mockUpdateHistory.filter(mh => !storedHistory.find(sh => sh.id === mh.id || sh.version === mh.version))];
        
        // Sort by date descending
        combinedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAllHistory(combinedHistory);
      }, []);


      useEffect(() => {
        let result = allHistory;
        if (searchTerm) {
          result = result.filter(item => 
            item.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.notes.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        if (filterType !== 'all') {
          result = result.filter(item => item.type.toLowerCase() === filterType.toLowerCase());
        }
        if (filterStatus !== 'all') {
          result = result.filter(item => item.status.toLowerCase() === filterStatus.toLowerCase());
        }
        setFilteredHistory(result);
        setCurrentPage(1); 
      }, [searchTerm, filterType, filterStatus, allHistory]);

      const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
      const paginatedHistory = filteredHistory.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

      const handlePageChange = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
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
                  <History className="mr-3 h-8 w-8 text-primary" /> Update History
                </h1>
                <p className="text-muted-foreground">View a log of all past system software and firmware updates.</p>
              </div>
            </div>

            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white">Past Updates Log</CardTitle>
                <CardDescription className="dark:text-gray-400">Chronological list of applied updates. Found {filteredHistory.length} entries.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border dark:border-slate-700 rounded-lg">
                  <Input 
                    placeholder="Search version or notes..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="md:col-span-1 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                    prependIcon={<Search className="h-4 w-4 text-muted-foreground" />}
                  />
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="md:col-span-1 dark:bg-slate-700 dark:text-white dark:border-slate-600">
                      <SelectValue placeholder="Filter by Type" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-800 dark:text-white">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Software">Software</SelectItem>
                      <SelectItem value="Firmware">Firmware</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="md:col-span-1 dark:bg-slate-700 dark:text-white dark:border-slate-600">
                      <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-800 dark:text-white">
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="Success">Success</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                      {paginatedHistory.length > 0 ? paginatedHistory.map((update) => (
                        <TableRow key={update.id} className="dark:border-slate-700 hover:bg-muted/50 dark:hover:bg-slate-700/50">
                          <TableCell className="font-medium dark:text-white">{update.version}</TableCell>
                          <TableCell className="dark:text-gray-300">{format(new Date(update.date), 'PPpp')}</TableCell>
                          <TableCell className="dark:text-gray-300">{update.type}</TableCell>
                          <TableCell>
                            <span className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                              update.status === "Success" 
                                ? "bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300" 
                                : "bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300"
                            }`}>
                              {update.status === "Success" ? <CheckCircle className="mr-1 h-3 w-3" /> : <AlertCircle className="mr-1 h-3 w-3" />}
                              {update.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground dark:text-gray-400 max-w-xs truncate" title={update.notes}>{update.notes}</TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center dark:text-gray-300">
                            No update history found matching your criteria.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-end space-x-2 py-4">
                    <Button variant="outline" size="sm" onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">
                      <ChevronsLeft className="h-4 w-4" /> First
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">
                      Last <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Layout>
      );
    };

    export default UpdateHistoryLogPage;