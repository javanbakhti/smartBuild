import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { PlusCircle, Users, Search } from 'lucide-react';

    const ManageMembersHeader = ({ unitNumber, onInviteClick, searchTerm, onSearchTermChange }) => {
      return (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white flex items-center">
              <Users className="mr-3 h-8 w-8 text-primary" /> My Members
            </h1>
            <p className="text-muted-foreground">Manage household members for your unit: {unitNumber || 'N/A'}.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search members..." 
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                className="pl-8 w-full dark:bg-slate-700 dark:text-white dark:border-slate-600"
              />
            </div>
            <Button onClick={onInviteClick} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="mr-2 h-4 w-4" /> Invite New Member
            </Button>
          </div>
        </div>
      );
    };

    export default ManageMembersHeader;