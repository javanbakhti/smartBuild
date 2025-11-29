import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { UserCog, PlusCircle, Search } from 'lucide-react';
    import { usePermissions } from '@/contexts/PermissionContext';

    const ManageAdminsHeader = ({ buildingUid, onInviteClick, searchTerm, onSearchTermChange }) => {
      const { hasPermission } = usePermissions();

      return (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white flex items-center">
              <UserCog className="mr-3 h-8 w-8 text-primary" /> Manage Building Admins
            </h1>
            <p className="text-muted-foreground">Invite and manage administrators for Building UID: {buildingUid}.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-auto md:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search by email..." 
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                className="pl-8 w-full dark:bg-slate-700 dark:text-white dark:border-slate-600"
              />
            </div>
            {hasPermission('manageAdmins', 'add') && (
              <Button onClick={onInviteClick} className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Invite New Admin
              </Button>
            )}
          </div>
        </div>
      );
    };

    export default ManageAdminsHeader;