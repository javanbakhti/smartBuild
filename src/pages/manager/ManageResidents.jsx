import React, { useState, useMemo, useCallback } from 'react';
    import Layout from '@/components/Layout';
    import { Input } from '@/components/ui/input';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Search, Users, Filter, Download, Mail, KeyRound, UserX, UserCheck, Send, History, RefreshCcw, Users2, Trash2 } from 'lucide-react';
    import { motion } from 'framer-motion';
    import ResidentTable from '@/components/manager/ResidentTable';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Button } from '@/components/ui/button';
    import { useResidentManagement } from '@/hooks/useResidentManagement';
    import ResidentHeader from '@/components/manager/ResidentHeader';
    import { ResidentFormDialog, InvitationPreviewDialogComponent, MembersDialog } from '@/components/manager/ResidentDialogs';

    const ResidentFilters = ({ filters, onFilterChange, buildingUnits, onClearFilters }) => {
        const uniqueFloors = useMemo(() => {
            const floors = buildingUnits.map(u => u.floor).filter(Boolean);
            return [...new Set(floors)].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
        }, [buildingUnits]);

        return (
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-3 mb-4 p-4 border rounded-lg dark:border-slate-700 bg-card dark:bg-slate-800/30 shadow"
            >
                <Select value={filters.status} onValueChange={(value) => onFilterChange('status', value)}>
                    <SelectTrigger className="w-full md:w-[180px] dark:bg-slate-700 dark:text-white dark:border-slate-600">
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-700 dark:text-white">
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="invited">Invited</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="signed_up">Signed Up</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="removed">Removed</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filters.floor} onValueChange={(value) => onFilterChange('floor', value)}>
                    <SelectTrigger className="w-full md:w-[180px] dark:bg-slate-700 dark:text-white dark:border-slate-600">
                        <SelectValue placeholder="Filter by Floor" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-700 dark:text-white">
                        <SelectItem value="all">All Floors</SelectItem>
                        {uniqueFloors.map(floor => <SelectItem key={floor} value={floor.toString()}>{floor.toString()}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Input 
                    type="text" 
                    placeholder="Filter by Unit (e.g. 101, A*)" 
                    value={filters.unit} 
                    onChange={(e) => onFilterChange('unit', e.target.value)}
                    className="w-full md:w-[180px] dark:bg-slate-700 dark:text-white dark:border-slate-600"
                />
                <Button onClick={onClearFilters} variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">Clear Filters</Button>
            </motion.div>
        );
    };

    const BulkActionsToolbar = ({ selectedCount, onBulkInvite, onBulkAssignGroup, onBulkExportCSV, onBulkExportPDF, onBulkDeactivate, onBulkActivate, onBulkDelete }) => {
        if (selectedCount === 0) return null;
        return (
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 border rounded-lg dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 shadow flex flex-wrap items-center gap-2"
            >
                <span className="text-sm font-medium dark:text-gray-300">{selectedCount} resident(s) selected.</span>
                <Select>
                    <SelectTrigger asChild>
                         <Button variant="outline" size="sm" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-600">Bulk Actions <Users className="ml-2 h-4 w-4"/></Button>
                    </SelectTrigger>
                    <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                        <SelectItem value="invite" onSelect={onBulkInvite} className="dark:text-gray-300 dark:hover:bg-slate-700"><Mail className="mr-2 h-4 w-4"/> Send Invitations</SelectItem>
                        <SelectItem value="assignGroup" onSelect={onBulkAssignGroup} className="dark:text-gray-300 dark:hover:bg-slate-700"><Users2 className="mr-2 h-4 w-4"/> Assign to Group</SelectItem>
                        <SelectItem value="exportCSV" onSelect={onBulkExportCSV} className="dark:text-gray-300 dark:hover:bg-slate-700"><Download className="mr-2 h-4 w-4"/> Export to CSV</SelectItem>
                        <SelectItem value="exportPDF" onSelect={onBulkExportPDF} className="dark:text-gray-300 dark:hover:bg-slate-700"><Download className="mr-2 h-4 w-4"/> Export to PDF</SelectItem>
                        <SelectItem value="activate" onSelect={onBulkActivate} className="dark:text-green-400 dark:hover:bg-slate-700"><UserCheck className="mr-2 h-4 w-4"/> Activate Selected</SelectItem>
                        <SelectItem value="deactivate" onSelect={onBulkDeactivate} className="dark:text-yellow-400 dark:hover:bg-slate-700"><UserX className="mr-2 h-4 w-4"/> Deactivate Selected</SelectItem>
                        <SelectItem value="delete" onSelect={onBulkDelete} className="text-red-500 dark:text-red-400 dark:hover:bg-red-900/50 focus:text-red-600 dark:focus:text-red-400"><Trash2 className="mr-2 h-4 w-4"/> Delete Selected</SelectItem>
                    </SelectContent>
                </Select>
            </motion.div>
        );
    };

   const ManageResidents = () => {
 const [loggedInManager] = useState(() => JSON.parse(localStorage.getItem("manager")) || null);

  const {
    residents, buildingUnits, buildingDetails,
    isFormDialogOpen, setIsFormDialogOpen,
    editingResident, 
    viewingMembersForResident,
    isViewMembersDialogOpen, setIsViewMembersDialogOpen,
    isInvitationPreviewOpen, setIsInvitationPreviewOpen,
    residentFormData, 
    selectedResidents, setSelectedResidents,
    isManager,
    isSubmitting,
    resetForm, handleInputChange, handleUnitSelection, handlePreviewInvitation,
    handleSubmitResident, handleEditResident, handleDeleteResident, handleResendInvitation,
    handleResetPasscode, handleSendReminder, handleToggleDeactivate, handleViewAccessHistory,
    handleViewMembers, availableUnits, handleSelectResident,
    handleBulkInvite, handleBulkAssignGroup, handleBulkExportCSV, handleBulkExportPDF,
    handleBulkDeactivate, handleBulkActivate, handleBulkDelete,
    handleActualSendInvitation
  } = useResidentManagement(loggedInManager);


      const [searchTerm, setSearchTerm] = useState('');
      const [sortConfig, setSortConfig] = useState({ key: 'fullName', direction: 'ascending' });
      const [filters, setFilters] = useState({ status: 'all', floor: 'all', unit: '' });
      const [showFilters, setShowFilters] = useState(false);

      const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
        }
        setSortConfig({ key, direction });
      };
      
      const filteredResidents = useMemo(() => {
        return residents
          .filter(resident => {
            const searchMatch = Object.values(resident).some(value =>
              String(value).toLowerCase().includes(searchTerm.toLowerCase())
            );
            const statusMatch = filters.status === 'all' || resident.status === filters.status;
            const floorMatch = filters.floor === 'all' || String(resident.floorNumber) === filters.floor;
            const unitMatch = filters.unit === '' || String(resident.unitNumber).toLowerCase().includes(filters.unit.toLowerCase());
            return searchMatch && statusMatch && floorMatch && unitMatch;
          })
          .sort((a, b) => {
            if (!sortConfig.key) return 0;
            const valA = String(a[sortConfig.key] || '');
            const valB = String(b[sortConfig.key] || '');
            if (sortConfig.key === 'unitNumber' || sortConfig.key === 'floorNumber') {
                const numA = parseInt(valA.match(/\d+/)?.[0] || '0', 10);
                const numB = parseInt(valB.match(/\d+/)?.[0] || '0', 10);
                if (numA !== numB) {
                    return sortConfig.direction === 'ascending' ? numA - numB : numB - numA;
                }
            }
            if (valA.toLowerCase() < valB.toLowerCase()) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (valA.toLowerCase() > valB.toLowerCase()) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
          });
      }, [residents, searchTerm, filters, sortConfig]);

      const handleSelectAllResidents = useCallback(() => {
        if (selectedResidents.length === filteredResidents.length) {
          setSelectedResidents([]);
        } else {
          setSelectedResidents(filteredResidents.map(r => r.id));
        }
      }, [selectedResidents.length, filteredResidents, setSelectedResidents]);

      const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
      };
      const handleClearFilters = () => setFilters({ status: 'all', floor: 'all', unit: '' });

      return (
        <Layout role={loggedInManager?.role}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 p-4 md:p-6"
          >
            <ResidentHeader 
              onInviteClick={() => { resetForm(); setIsFormDialogOpen(true); }}
              onToggleFilters={() => setShowFilters(!showFilters)}
              showFilters={showFilters}
              isManager={isManager}
            />
            
            {showFilters && <ResidentFilters filters={filters} onFilterChange={handleFilterChange} buildingUnits={buildingUnits} onClearFilters={handleClearFilters} />}

            <BulkActionsToolbar 
                selectedCount={selectedResidents.length}
                onBulkInvite={handleBulkInvite}
                onBulkAssignGroup={handleBulkAssignGroup}
                onBulkExportCSV={() => handleBulkExportCSV(filteredResidents)}
                onBulkExportPDF={handleBulkExportPDF}
                onBulkDeactivate={handleBulkDeactivate}
                onBulkActivate={handleBulkActivate}
                onBulkDelete={handleBulkDelete}
            />

            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                  <CardTitle className="dark:text-white">Resident List ({filteredResidents.length})</CardTitle>
                  <div className="relative w-full md:w-auto md:min-w-[300px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="search" 
                      placeholder="Search by name, email, unit..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-full dark:bg-slate-700 dark:text-white dark:border-slate-600"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResidentTable 
                  residents={filteredResidents}
                  onEdit={isManager ? handleEditResident : null}
                  onDelete={isManager ? handleDeleteResident : null}
                  onResendInvitation={isManager ? handleResendInvitation : null}
                  onViewMembers={handleViewMembers}
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                  canManage={isManager}
                  selectedResidents={selectedResidents}
                  onSelectResident={handleSelectResident}
                  onSelectAllResidents={handleSelectAllResidents}
                  onResetPasscode={isManager ? handleResetPasscode : null}
                  onSendReminder={isManager ? handleSendReminder : null}
                  onToggleDeactivate={isManager ? handleToggleDeactivate : null}
                  onViewAccessHistory={handleViewAccessHistory}
                />
              </CardContent>
            </Card>

            {isManager && (
              <ResidentFormDialog
                isOpen={isFormDialogOpen}
                onOpenChange={setIsFormDialogOpen}
                residentData={residentFormData}
                onInputChange={handleInputChange}
                onSubmit={handleSubmitResident}
                onUnitSelection={handleUnitSelection}
                isEditing={!!editingResident}
                availableUnits={availableUnits}
                allUnits={buildingUnits}
                onPreviewInvitation={handlePreviewInvitation}
                resetForm={resetForm}
                isSubmitting={isSubmitting}
              />
            )}
            {viewingMembersForResident && (
              <MembersDialog
                isOpen={isViewMembersDialogOpen}
                onOpenChange={setIsViewMembersDialogOpen}
                resident={viewingMembersForResident}
              />
            )}
            <InvitationPreviewDialogComponent 
                isOpen={isInvitationPreviewOpen}
                onOpenChange={setIsInvitationPreviewOpen}
                residentData={residentFormData}
                buildingName={buildingDetails?.name || "Your Building"}
                onSendInvitation={handleActualSendInvitation}
                isSubmitting={isSubmitting}
            />
          </motion.div>
        </Layout>
      );
    };

    export default ManageResidents;