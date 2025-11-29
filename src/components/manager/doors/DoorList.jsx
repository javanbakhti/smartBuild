import React from 'react';
    import { Card, CardContent } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Button } from '@/components/ui/button';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
    import { Edit3, Trash2, MoreHorizontal, ShieldCheck, Users, BarChartHorizontalBig, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

    const DoorList = ({ doors, onEditDoor, onDeleteDoor, onStatusChange }) => {
      
      const getStatusIndicator = (status) => {
        switch (status) {
          case 'Open':
            return <CheckCircle className="h-4 w-4 text-green-500 mr-2" />;
          case 'Closed':
            return <XCircle className="h-4 w-4 text-red-500 mr-2" />;
          case 'Reported':
            return <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />;
          default:
            return null;
        }
      };

      const getStatusTextClass = (status) => {
        switch (status) {
          case 'Open': return "text-green-600 dark:text-green-400";
          case 'Closed': return "text-red-600 dark:text-red-400";
          case 'Reported': return "text-yellow-600 dark:text-yellow-400";
          default: return "text-muted-foreground";
        }
      };


      return (
        <Card className="dark:bg-slate-800 shadow-lg">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-slate-700">
                    <TableHead className="dark:text-gray-300">Door Name</TableHead>
                    <TableHead className="dark:text-gray-300">Location/Description</TableHead>
                    <TableHead className="dark:text-gray-300">Status</TableHead>
                    <TableHead className="dark:text-gray-300">Access (Simulated)</TableHead>
                    <TableHead className="dark:text-gray-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doors.length > 0 ? doors.map((door) => (
                    <TableRow key={door.id} className="dark:border-slate-700 hover:bg-muted/50 dark:hover:bg-slate-700/50">
                      <TableCell className="font-medium dark:text-white">{door.name}</TableCell>
                      <TableCell className="dark:text-gray-300">{door.location || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`flex items-center font-medium ${getStatusTextClass(door.status)}`}>
                          {getStatusIndicator(door.status)}
                          {door.status}
                        </span>
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        <span className="flex items-center text-sm">
                          <Users className="mr-1.5 h-4 w-4 text-blue-400" /> All Residents (Default)
                        </span>
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
                            <DropdownMenuItem onClick={() => onEditDoor(door)} className="dark:text-gray-300 dark:hover:bg-slate-700">
                              <Edit3 className="mr-2 h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                             <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="dark:text-gray-300 dark:hover:bg-slate-700 data-[state=open]:bg-slate-700">
                                    <ShieldCheck className="mr-2 h-4 w-4" /> Change Status
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="dark:bg-slate-800 dark:border-slate-700">
                                    <DropdownMenuItem onClick={() => onStatusChange(door.id, 'Open')} className="dark:text-green-400 dark:hover:bg-slate-700">Open</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onStatusChange(door.id, 'Closed')} className="dark:text-red-400 dark:hover:bg-slate-700">Closed</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onStatusChange(door.id, 'Reported')} className="dark:text-yellow-400 dark:hover:bg-slate-700">Reported</DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuItem disabled className="dark:text-gray-500 dark:hover:bg-slate-700 cursor-not-allowed">
                              <Users className="mr-2 h-4 w-4" /> Manage Access (Soon)
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled className="dark:text-gray-500 dark:hover:bg-slate-700 cursor-not-allowed">
                              <BarChartHorizontalBig className="mr-2 h-4 w-4" /> View Logs (Soon)
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="dark:bg-slate-700" />
                            <DropdownMenuItem onClick={() => onDeleteDoor(door.id)} className="text-red-600 dark:text-red-500 dark:hover:bg-red-900/50 focus:bg-red-100 focus:text-red-700 dark:focus:bg-red-800 dark:focus:text-red-300">
                              <Trash2 className="mr-2 h-4 w-4" /> Remove Door
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center dark:text-gray-300">
                        No doors found. Add a new door to get started.
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

    export default DoorList;