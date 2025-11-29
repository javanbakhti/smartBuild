import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Search } from 'lucide-react';

const ManageDoorsHeader = ({ onAddDoorClick, searchTerm, onSearchTermChange }) => {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white">Manage Doors</h1>
          <p className="text-muted-foreground">Configure and manage building access points.</p>
        </div>
        <Button onClick={onAddDoorClick} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Door
        </Button>
      </div>
      <CardHeader className="p-0 pt-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
          <CardTitle className="dark:text-white text-xl">Door List</CardTitle>
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search by name or location..." 
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="pl-8 w-full dark:bg-slate-700 dark:text-white dark:border-slate-600"
            />
          </div>
        </div>
      </CardHeader>
    </>
  );
};

export default ManageDoorsHeader;