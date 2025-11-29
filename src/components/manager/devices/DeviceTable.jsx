import React, { useMemo } from 'react';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Button } from '@/components/ui/button';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
    import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
    import { MoreHorizontal, Edit3, Trash2, ArrowUpDown } from 'lucide-react';
    import { DEVICE_MODELS } from './deviceUtils';
    import { useWindowSize } from '@/hooks/useWindowSize';
    import { cn } from '@/lib/utils';

    const DeviceTable = ({ devices, doors, searchTerm, sortConfig, requestSort, onEditDevice, onDeleteDevice }) => {
      const { width } = useWindowSize();
      const isDesktop = width >= 1024;

      const SortableHeader = ({ children, columnKey, className }) => {
        const isSorted = sortConfig.key === columnKey;
        return (
          <TableHead onClick={() => requestSort(columnKey)} className={cn("cursor-pointer dark:text-gray-300 hover:bg-muted/20 dark:hover:bg-slate-700/30 transition-colors", className)}>
             <div className="flex items-center">
              {children}
              {isSorted && <ArrowUpDown className={`ml-2 h-4 w-4 ${sortConfig.direction === 'ascending' ? 'text-primary' : 'text-primary'}`} />}
              {!isSorted && <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />}
            </div>
          </TableHead>
        );
      };

      const sortedDevices = useMemo(() => {
        let sortableItems = [...devices];
        if (sortConfig.key) {
          sortableItems.sort((a, b) => {
            const valA = a[sortConfig.key] || '';
            const valB = b[sortConfig.key] || '';
            if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
          });
        }
        return sortableItems;
      }, [devices, sortConfig]);

      const filteredDevices = sortedDevices.filter(d => {
        const modelName = DEVICE_MODELS.find(m => m.id === d.modelId)?.name || '';
        const searchTermLower = searchTerm.toLowerCase();
        
        return (
          (d.serialNumber && d.serialNumber.toLowerCase().includes(searchTermLower)) ||
          (d.macAddress && d.macAddress.toLowerCase().includes(searchTermLower)) ||
          (modelName && modelName.toLowerCase().includes(searchTermLower))
        );
      });

      const getRelaySummary = (device, model) => {
        if (!model || model.relays === 0) {
          return <span className="text-muted-foreground italic text-xs">No relays</span>;
        }

        const assignments = Array.from({ length: model.relays }).map((_, idx) => {
          const relayKey = `relay_${idx + 1}`;
          const doorId = device.relayAssignments?.[relayKey];
          const door = doors.find(d => d.id.toString() === doorId);
          return `R${idx + 1} → ${door ? door.name : 'None'}`;
        });

        const summary = assignments.join(' · ');

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="truncate max-w-xs cursor-default">
                {summary}
              </div>
            </TooltipTrigger>
            <TooltipContent className="dark:bg-slate-800 dark:border-slate-700">
              <div className="flex flex-col gap-1 text-xs">
                {assignments.map((line, i) => <span key={i}>{line}</span>)}
              </div>
            </TooltipContent>
          </Tooltip>
        );
      };

      return (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="dark:border-slate-700">
                <SortableHeader columnKey="modelId">Model</SortableHeader>
                <SortableHeader columnKey="serialNumber">Serial Number / MAC</SortableHeader>
                <TableHead className="dark:text-gray-300">Relay Assignment</TableHead>
                {!isDesktop && <TableHead className="dark:text-gray-300 text-right">Actions</TableHead>}
                {isDesktop && <TableHead className="dark:text-gray-300 text-right w-[180px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.length > 0 ? filteredDevices.map((device, index) => {
                const model = DEVICE_MODELS.find(m => m.id === device.modelId);
                return (
                  <TableRow 
                    key={device.id} 
                    className="dark:border-slate-700 hover:bg-muted/50 dark:hover:bg-slate-700/50 cursor-pointer"
                    onDoubleClick={() => onEditDevice(device)}
                  >
                    <TableCell className="font-medium dark:text-white">{model?.name || 'Unknown Model'}</TableCell>
                    <TableCell className="dark:text-gray-300">
                      <div className="flex flex-col">
                        <span className="font-semibold">{device.serialNumber || 'N/A'}</span>
                        <span className="text-xs text-muted-foreground">{device.macAddress || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="dark:text-gray-300 text-sm">
                      {getRelaySummary(device, model)}
                    </TableCell>
                    <TableCell className="text-right">
                      {isDesktop ? (
                        <div className="flex justify-end items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEditDevice(device); }} className="dark:text-gray-300 dark:hover:bg-slate-700">
                            <Edit3 className="mr-2 h-4 w-4" /> Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDeleteDevice(device.id); }} className="text-red-600 dark:text-red-500 dark:hover:bg-red-900/50 hover:text-red-600 focus:bg-red-100 dark:focus:bg-red-800 dark:focus:text-red-300">
                            <Trash2 className="mr-2 h-4 w-4" /> Remove
                          </Button>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" id={index === 0 ? 'device-actions-dropdown-trigger' : undefined} className="h-8 w-8 p-0 dark:text-gray-300 dark:hover:bg-slate-700">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="dark:bg-slate-800 dark:border-slate-700">
                            <DropdownMenuLabel className="dark:text-gray-300">Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onEditDevice(device)} className="dark:text-gray-300 dark:hover:bg-slate-700">
                              <Edit3 className="mr-2 h-4 w-4" /> Edit Device
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDeleteDevice(device.id)} className="text-red-600 dark:text-red-500 dark:hover:bg-red-900/50 focus:bg-red-100 focus:text-red-700 dark:focus:bg-red-800 dark:focus:text-red-300">
                              <Trash2 className="mr-2 h-4 w-4" /> Remove Device
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={isDesktop ? 4 : 4} className="h-24 text-center dark:text-gray-300">
                    No devices configured yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      );
    };

    export default DeviceTable;