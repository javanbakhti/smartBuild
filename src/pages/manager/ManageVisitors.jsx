import React, { useMemo } from 'react';
    import Layout from '@/components/Layout';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import { UserPlus, Search, Archive as ArchiveIcon } from 'lucide-react';
    import { motion } from 'framer-motion';
    import VisitorTable from '@/components/manager/VisitorTable';
    import VisitorDialogs from '@/components/manager/visitors/VisitorDialogs';
    import { useVisitorManagement } from '@/hooks/useVisitorManagement';

    const ManageVisitors = () => {
      const {
        activeVisitors,
        archivedVisitors,
        searchTerm,
        setSearchTerm,
        isFormDialogOpen,
        setIsFormDialogOpen,
        editingVisitor,
        setEditingVisitor,
        formData,
        setFormData,
        isPasscodeDialogOpen,
        setIsPasscodeDialogOpen,
        generatedPasscodeInfo,
        sortConfig,
        unitOptions,
        handleInputChange,
        handleSubmit,
        handleEdit,
        handleDelete,
        handleStatusChange,
        handleGeneratePasscode,
        handleViewPasscode,
        handleResendPasscode,
        requestSort,
        openAddVisitorDialog,
        handleArchiveVisitor,
        handleUnarchiveVisitor,
        activeTab,
        setActiveTab
      } = useVisitorManagement();

      const sortVisitors = (visitorsToSort) => {
        let sortableItems = [...(visitorsToSort || [])];
        if (sortConfig.key !== null) {
          sortableItems.sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];

            if (sortConfig.key === 'expectedDateTime' || sortConfig.key === 'passcodeExpiresAt') {
              valA = valA ? new Date(valA).getTime() : 0;
              valB = valB ? new Date(valB).getTime() : 0;
            } else {
              valA = valA ? String(valA).toLowerCase() : '';
              valB = valB ? String(valB).toLowerCase() : '';
            }
            
            if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
          });
        }
        return sortableItems;
      };

      const filterVisitors = (visitorsToFilter) => {
        return (visitorsToFilter || []).filter(visitor =>
          Object.values(visitor).some(value => 
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      };

      const processedActiveVisitors = useMemo(() => filterVisitors(sortVisitors(activeVisitors)), [activeVisitors, sortConfig, searchTerm]);
      const processedArchivedVisitors = useMemo(() => filterVisitors(sortVisitors(archivedVisitors)), [archivedVisitors, sortConfig, searchTerm]);


      return (
        <Layout role="manager">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white">Manage Visitors</h1>
                <p className="text-muted-foreground">Track expected, active, and archived visitors.</p>
              </div>
              <Button onClick={openAddVisitorDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <UserPlus className="mr-2 h-4 w-4" /> Add New Visitor
              </Button>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
                <TabsList className="grid w-full md:w-auto grid-cols-2 md:inline-flex dark:bg-slate-700">
                  <TabsTrigger value="active" className="dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white">Active Visitors</TabsTrigger>
                  <TabsTrigger value="archived" className="dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white">Archived Visitors <ArchiveIcon className="ml-2 h-4 w-4"/></TabsTrigger>
                </TabsList>
                <div className="relative w-full md:w-1/3">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search visitors..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 w-full dark:bg-slate-700 dark:text-white dark:border-slate-600" />
                </div>
              </div>

              <TabsContent value="active">
                <Card className="dark:bg-slate-800 shadow-lg">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Active Visitor Log</CardTitle>
                    <CardDescription>Manage visitors who are expected, have arrived, or recently departed.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <VisitorTable 
                      visitors={processedActiveVisitors} 
                      onEdit={handleEdit} 
                      onDelete={handleDelete} 
                      onStatusChange={handleStatusChange}
                      onGeneratePasscode={handleGeneratePasscode}
                      onViewPasscode={handleViewPasscode}
                      onResendPasscode={handleResendPasscode}
                      sortConfig={sortConfig}
                      requestSort={requestSort}
                      onArchive={handleArchiveVisitor}
                      isArchiveTable={false}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="archived">
                <Card className="dark:bg-slate-800 shadow-lg">
                  <CardHeader>
                    <CardTitle className="dark:text-white">Archived Visitor Log</CardTitle>
                    <CardDescription>View visitors whose access has expired more than a week ago or were manually archived.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <VisitorTable 
                      visitors={processedArchivedVisitors} 
                      onDelete={handleDelete} 
                      sortConfig={sortConfig}
                      requestSort={requestSort}
                      isArchiveTable={true}
                      onUnarchive={handleUnarchiveVisitor}
                      onViewPasscode={handleViewPasscode}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>


            <VisitorDialogs
              isFormDialogOpen={isFormDialogOpen}
              setIsFormDialogOpen={setIsFormDialogOpen}
              editingVisitor={editingVisitor}
              setEditingVisitor={setEditingVisitor}
              formData={formData}
              setFormData={setFormData}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              unitOptions={unitOptions}
              isPasscodeDialogOpen={isPasscodeDialogOpen}
              setIsPasscodeDialogOpen={setIsPasscodeDialogOpen}
              generatedPasscodeInfo={generatedPasscodeInfo}
            />

          </motion.div>
        </Layout>
      );
    };

    export default ManageVisitors;