import React from 'react';
    import { Card, CardContent } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Button } from '@/components/ui/button';
    import { Edit3, Trash2 } from 'lucide-react';
    import SortableHeader from '@/components/shared/SortableHeader';
    import { useSort } from '@/hooks/useSort';

    const UnitList = ({ units, onEditUnit, onDeleteUnit }) => {
      const { items: sortedUnits, requestSort, sortConfig } = useSort(units);

      return (
        <Card className="dark:bg-slate-800 shadow-lg">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-slate-700">
                    <TableHead className="dark:text-gray-300">
                      <SortableHeader columnKey="identifier" sortConfig={sortConfig} requestSort={requestSort}>
                        Unit Identifier
                      </SortableHeader>
                    </TableHead>
                    <TableHead className="dark:text-gray-300">
                      <SortableHeader columnKey="floor" sortConfig={sortConfig} requestSort={requestSort}>
                        Floor
                      </SortableHeader>
                    </TableHead>
                    <TableHead className="dark:text-gray-300">
                      <SortableHeader columnKey="label" sortConfig={sortConfig} requestSort={requestSort}>
                        Custom Label
                      </SortableHeader>
                    </TableHead>
                    <TableHead className="dark:text-gray-300">
                       <SortableHeader columnKey="isAssigned" sortConfig={sortConfig} requestSort={requestSort}>
                        Status
                      </SortableHeader>
                    </TableHead>
                    <TableHead className="dark:text-gray-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUnits.length > 0 ? sortedUnits.map((unit) => (
                    <TableRow key={unit.id} className="dark:border-slate-700 hover:bg-muted/50 dark:hover:bg-slate-700/50">
                      <TableCell className="font-medium dark:text-white">{unit.identifier}</TableCell>
                      <TableCell className="dark:text-gray-300">{unit.floor}</TableCell>
                      <TableCell className="dark:text-gray-300">{unit.label || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          unit.isAssigned ? 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100' 
                                          : 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100'
                        }`}>
                          {unit.isAssigned ? 'Assigned' : 'Available'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => onEditUnit(unit)} className="mr-2 dark:text-gray-300 dark:hover:bg-slate-700 h-8 w-8">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDeleteUnit(unit.id)} disabled={unit.isAssigned} className="text-red-500 hover:text-red-700 dark:hover:bg-red-900/50 h-8 w-8 disabled:opacity-50 disabled:cursor-not-allowed">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center dark:text-gray-300">
                        No units found or defined. Check Building Setup or add units manually.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      );
    };

    export default UnitList;