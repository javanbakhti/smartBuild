import React from 'react';
    import { Button } from '@/components/ui/button';
    import { PlusCircle, Filter, Users } from 'lucide-react';

    const ResidentHeader = ({ onInviteClick, onToggleFilters, showFilters, isManager }) => {
      return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white flex items-center">
              <Users className="mr-3 h-8 w-8 text-primary" /> Manage Residents
            </h1>
            <p className="text-muted-foreground">Invite, view, and manage residents in your building.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={onToggleFilters} variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">
              <Filter className="mr-2 h-4 w-4" /> {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
            {isManager && (
              <Button onClick={onInviteClick} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <PlusCircle className="mr-2 h-4 w-4" /> Invite New Resident
              </Button>
            )}
          </div>
        </div>
      );
    };

    export default ResidentHeader;