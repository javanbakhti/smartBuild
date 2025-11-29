import React from 'react';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Button } from '@/components/ui/button';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
    import { Checkbox } from '@/components/ui/checkbox';
    import { MoreHorizontal, Edit3, Trash2, Mail, KeyRound, FileImage as ImageIcon, EyeOff as EyeOffIcon, ArrowUpDown, Users as MembersIcon, History, RefreshCcw, UserX, UserCheck, Send } from 'lucide-react';
    import { Badge } from '@/components/ui/badge'; // Assuming you have a Badge component

    const SortableHeader = ({ children, columnKey, sortConfig, requestSort }) => {
      const isSorted = sortConfig && sortConfig.key === columnKey;
      const direction = isSorted ? sortConfig.direction : null;

      return (
        <TableHead onClick={() => requestSort(columnKey)} className="cursor-pointer dark:text-gray-300 hover:bg-muted/20 dark:hover:bg-slate-700/30 transition-colors min-w-[120px]">
          <div className="flex items-center">
            {children}
            {isSorted && <ArrowUpDown className={`ml-2 h-4 w-4 ${direction === 'ascending' ? 'text-primary' : 'text-primary'}`} />}
            {!isSorted && <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />}
          </div>
        </TableHead>
      );
    };

    const getStatusBadgeVariant = (status) => {
      switch (status) {
        case 'active':
        case 'signed_up':
          return 'success'; // Green
        case 'invited':
          return 'warning'; // Yellow
        case 'inactive':
          return 'secondary'; // Gray/Black
        case 'removed':
          return 'destructive'; // Red
        default:
          return 'outline';
      }
    };


    const ResidentTable = ({ 
        residents, 
        onEdit, 
        onDelete, 
        onResendInvitation, 
        onViewMembers, 
        sortConfig, 
        requestSort, 
        canManage,
        selectedResidents,
        onSelectResident,
        onSelectAllResidents,
        onResetPasscode,
        onSendReminder,
        onToggleDeactivate,
        onViewAccessHistory
    }) => {

      const allSelected = residents.length > 0 && selectedResidents.length === residents.length;
      const someSelected = selectedResidents.length > 0 && selectedResidents.length < residents.length;

      if (!residents || residents.length === 0) {
        return (
          <div className="h-24 text-center flex items-center justify-center dark:text-gray-300">
            No residents found. Apply filters or add a new resident.
          </div>
        );
      }

      return (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="dark:border-slate-700">
                <TableHead className="w-[50px] dark:text-gray-300">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected.toString()}
                    onCheckedChange={onSelectAllResidents}
                    aria-label="Select all residents"
                    className="dark:border-slate-500 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </TableHead>
                <SortableHeader columnKey="fullName" sortConfig={sortConfig} requestSort={requestSort}>Full Name</SortableHeader>
                <SortableHeader columnKey="email" sortConfig={sortConfig} requestSort={requestSort}>Email</SortableHeader>
                <SortableHeader columnKey="unitNumber" sortConfig={sortConfig} requestSort={requestSort}>Unit</SortableHeader>
                <SortableHeader columnKey="floorNumber" sortConfig={sortConfig} requestSort={requestSort}>Floor</SortableHeader>
                <TableHead className="min-w-[150px] dark:text-gray-300">Kiosk Display</TableHead>
                <SortableHeader columnKey="status" sortConfig={sortConfig} requestSort={requestSort}>Status</SortableHeader>
                <TableHead className="text-right min-w-[100px] dark:text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {residents.map((resident) => (
                <TableRow 
                    key={resident.id} 
                    className="dark:border-slate-700 hover:bg-muted/50 dark:hover:bg-slate-700/50"
                    data-state={selectedResidents.includes(resident.id) ? 'selected' : ''}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedResidents.includes(resident.id)}
                      onCheckedChange={() => onSelectResident(resident.id)}
                      aria-label={`Select resident ${resident.fullName}`}
                      className="dark:border-slate-500 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </TableCell>
                  <TableCell className="font-medium dark:text-white">{resident.fullName}</TableCell>
                  <TableCell className="dark:text-gray-300">{resident.email}</TableCell>
                  <TableCell className="dark:text-gray-300">{resident.unitNumber}</TableCell>
                  <TableCell className="dark:text-gray-300">{resident.floorNumber}</TableCell>
                  <TableCell className="dark:text-gray-300">
                    {resident.photoUrl && <ImageIcon className="h-4 w-4 inline mr-1 text-blue-400" />}
                    {resident.kioskDisplayName || resident.fullName}
                    {resident.passcode && <KeyRound className="h-4 w-4 inline ml-1 text-green-400" />}
                    {resident.dndSettings?.enabled && <EyeOffIcon className="h-4 w-4 inline ml-1 text-yellow-400" title={`DND: ${resident.dndSettings.nonWorkHourAction}`} />}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(resident.status)} className="capitalize">
                      {resident.status.replace('_', ' ')}
                    </Badge>
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
                        {canManage && (
                          <DropdownMenuItem onClick={() => onEdit(resident)} className="dark:text-gray-300 dark:hover:bg-slate-700">
                            <Edit3 className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onViewMembers(resident)} className="dark:text-gray-300 dark:hover:bg-slate-700">
                          <MembersIcon className="mr-2 h-4 w-4" /> View Members
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => onViewAccessHistory(resident.id)} className="dark:text-gray-300 dark:hover:bg-slate-700">
                            <History className="mr-2 h-4 w-4" /> View Access History
                        </DropdownMenuItem>
                        {canManage && (
                          <>
                            <DropdownMenuSeparator className="dark:bg-slate-700" />
                            {resident.status === 'invited' && (
                              <DropdownMenuItem onClick={() => onResendInvitation(resident)} className="dark:text-gray-300 dark:hover:bg-slate-700">
                                <Mail className="mr-2 h-4 w-4" /> Resend Invitation
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onResetPasscode(resident.id)} className="dark:text-gray-300 dark:hover:bg-slate-700">
                                <RefreshCcw className="mr-2 h-4 w-4" /> Reset Passcode
                            </DropdownMenuItem>
                            {resident.status === 'active' && (
                                <DropdownMenuItem onClick={() => onToggleDeactivate(resident.id, true)} className="dark:text-yellow-400 dark:hover:bg-slate-700">
                                    <UserX className="mr-2 h-4 w-4" /> Deactivate Temporarily
                                </DropdownMenuItem>
                            )}
                            {resident.status === 'inactive' && (
                                <DropdownMenuItem onClick={() => onToggleDeactivate(resident.id, false)} className="dark:text-green-400 dark:hover:bg-slate-700">
                                    <UserCheck className="mr-2 h-4 w-4" /> Activate Account
                                </DropdownMenuItem>
                            )}
                             {resident.status === 'invited' && (
                                <DropdownMenuItem onClick={() => onSendReminder(resident.id)} className="dark:text-blue-400 dark:hover:bg-slate-700">
                                    <Send className="mr-2 h-4 w-4" /> Send Reminder
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="dark:bg-slate-700" />
                            <DropdownMenuItem onClick={() => onDelete(resident.id)} className="text-red-600 dark:text-red-500 dark:hover:bg-red-900/50 focus:bg-red-100 focus:text-red-700 dark:focus:bg-red-800 dark:focus:text-red-300">
                              <Trash2 className="mr-2 h-4 w-4" /> Remove Resident
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    };

    export default ResidentTable;