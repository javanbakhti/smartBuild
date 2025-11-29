import React from 'react';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Button } from '@/components/ui/button';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
    import { MoreHorizontal, Edit3, Trash2, CalendarClock, Eye } from 'lucide-react';
    import { useSort } from '@/hooks/useSort';
    import SortableHeader from '@/components/shared/SortableHeader';

    const CommonAreaTable = ({ commonAreas, onEditArea, onDeleteArea, onViewSchedule }) => {
      const { items: sortedAreas, requestSort, sortConfig } = useSort(commonAreas);
      
      const getAccessTypeText = (accessType) => {
        switch (accessType) {
          case 'private': return 'Private Use Only';
          case 'shared': return 'Shared Use';
          case 'both': return 'Both (Private & Shared)';
          default: return 'Not Set';
        }
      };

      return (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="dark:border-slate-700">
                <TableHead className="dark:text-gray-300">
                  <SortableHeader columnKey="name" sortConfig={sortConfig} requestSort={requestSort}>
                    Area Name
                  </SortableHeader>
                </TableHead>
                <TableHead className="dark:text-gray-300">
                  <SortableHeader columnKey="floorLocation" sortConfig={sortConfig} requestSort={requestSort}>
                    Floor/Location
                  </SortableHeader>
                </TableHead>
                <TableHead className="dark:text-gray-300">
                  <SortableHeader columnKey="accessType" sortConfig={sortConfig} requestSort={requestSort}>
                    Access Type
                  </SortableHeader>
                </TableHead>
                <TableHead className="dark:text-gray-300">
                  <SortableHeader columnKey="assignedDevice" sortConfig={sortConfig} requestSort={requestSort}>
                    Assigned Device
                  </SortableHeader>
                </TableHead>
                <TableHead className="dark:text-gray-300">Schedule Summary</TableHead>
                <TableHead className="dark:text-gray-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAreas.length > 0 ? sortedAreas.map((area) => (
                <TableRow key={area.id} className="dark:border-slate-700 hover:bg-muted/50 dark:hover:bg-slate-700/50">
                  <TableCell className="font-medium dark:text-white">{area.name}</TableCell>
                  <TableCell className="dark:text-gray-300">{area.floorLocation || 'N/A'}</TableCell>
                  <TableCell className="dark:text-gray-300">{getAccessTypeText(area.accessType)}</TableCell>
                  <TableCell className="dark:text-gray-300">{area.assignedDevice || <span className="italic text-muted-foreground">None</span>}</TableCell>
                  <TableCell className="dark:text-gray-300 text-sm">
                    {/* Placeholder for schedule summary */}
                    <span className="italic text-muted-foreground">Details coming soon</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 dark:text-gray-300 dark:hover:bg-slate-700">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="dark:bg-slate-800 dark:border-slate-700">
                        <DropdownMenuLabel className="dark:text-gray-300">Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEditArea(area)} className="dark:text-gray-300 dark:hover:bg-slate-700">
                          <Edit3 className="mr-2 h-4 w-4" /> Edit Area
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onViewSchedule(area.id)} className="dark:text-gray-300 dark:hover:bg-slate-700">
                          <Eye className="mr-2 h-4 w-4" /> View Schedule
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled className="dark:text-gray-500 dark:hover:bg-slate-700 cursor-not-allowed">
                          <CalendarClock className="mr-2 h-4 w-4" /> Manage Bookings (Soon)
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="dark:bg-slate-700" />
                        <DropdownMenuItem onClick={() => onDeleteArea(area.id)} className="text-red-600 dark:text-red-500 dark:hover:bg-red-900/50 focus:text-red-600 dark:focus:text-red-400">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Area
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center dark:text-gray-300">
                    No common areas defined yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      );
    };

    export default CommonAreaTable;