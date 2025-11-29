import React from 'react';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Button } from '@/components/ui/button';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
    import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
    import { MoreHorizontal, Edit3, Trash2, QrCode, CheckCircle, XCircle, AlertCircle, CalendarDays, Clock, KeyRound, Mail, ArrowUpDown, Archive, Info, AlertTriangle as WarningIcon } from 'lucide-react';
    import { format, isPast } from 'date-fns';

    const SortableHeader = ({ children, columnKey, sortConfig, requestSort }) => {
      const isSorted = sortConfig && sortConfig.key === columnKey;
      const direction = isSorted ? sortConfig.direction : null;

      return (
        <TableHead onClick={() => requestSort(columnKey)} className="cursor-pointer dark:text-gray-300 hover:bg-muted/20 dark:hover:bg-slate-700/30 transition-colors">
          <div className="flex items-center">
            {children}
            {isSorted && <ArrowUpDown className={`ml-2 h-4 w-4 ${direction === 'ascending' ? 'text-primary' : 'text-primary'}`} />}
            {!isSorted && <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />}
          </div>
        </TableHead>
      );
    };

    const VisitorTable = ({ 
        visitors, 
        onEdit, 
        onDelete, 
        onStatusChange, 
        onGeneratePasscode, 
        onViewPasscode, 
        onResendPasscode, 
        sortConfig, 
        requestSort,
        onArchive,
        isArchiveTable = false,
        onUnarchive
    }) => {
      const getStatusIcon = (status) => {
        switch (status) {
          case 'expected': return <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />;
          case 'arrived': return <CheckCircle className="h-4 w-4 text-green-500 mr-2" />;
          case 'departed': return <XCircle className="h-4 w-4 text-gray-500 mr-2" />;
          case 'denied': return <XCircle className="h-4 w-4 text-red-500 mr-2" />;
          case 'expired': return <WarningIcon className="h-4 w-4 text-orange-500 mr-2" />;
          case 'archived': return <Archive className="h-4 w-4 text-slate-500 mr-2" />;
          default: return null;
        }
      };
      
      const getStatusTextClass = (status) => {
        switch (status) {
          case 'expected': return "text-yellow-600 dark:text-yellow-400";
          case 'arrived': return "text-green-600 dark:text-green-400";
          case 'departed': return "text-gray-600 dark:text-gray-400";
          case 'denied': return "text-red-600 dark:text-red-400";
          case 'expired': return "text-orange-600 dark:text-orange-400";
          case 'archived': return "text-slate-500 dark:text-slate-400";
          default: return "text-muted-foreground";
        }
      };

      const getExpirationDuration = (visitor) => {
        if (visitor.expirationType === 'relative' && visitor.expectedDateTime) {
          const days = parseInt(visitor.expirationDays, 10) || 0;
          const hours = parseInt(visitor.expirationHours, 10) || 0;
          if (days > 0 || hours > 0) {
            return `(${days}d, ${hours}h from expected)`;
          }
        }
        return '';
      };
      
      const isAccessInvalid = (visitor) => {
        const expiredByDate = visitor.passcodeExpiresAt && isPast(new Date(visitor.passcodeExpiresAt));
        const usageLimitReached = visitor.accessType === 'multiple' && visitor.usageLimit && (visitor.entryCount || 0) >= parseInt(visitor.usageLimit, 10);
        const statusInvalidForEntry = ['departed', 'denied', 'expired', 'archived'].includes(visitor.status);
        return { expiredByDate, usageLimitReached, statusInvalidForEntry };
      };


      if (!visitors || visitors.length === 0) {
        return (
          <div className="h-24 text-center flex items-center justify-center dark:text-gray-300">
            {isArchiveTable ? "No archived visitors." : "No active visitors found. Add a new visitor or check the archive."}
          </div>
        );
      }

      return (
        <TooltipProvider>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="dark:border-slate-700">
                <SortableHeader columnKey="name" sortConfig={sortConfig} requestSort={requestSort}>Visitor Name</SortableHeader>
                <SortableHeader columnKey="unitNumber" sortConfig={sortConfig} requestSort={requestSort}>Unit No.</SortableHeader>
                <SortableHeader columnKey="expectedDateTime" sortConfig={sortConfig} requestSort={requestSort}>Expected Date & Time</SortableHeader>
                <SortableHeader columnKey="passcodeExpiresAt" sortConfig={sortConfig} requestSort={requestSort}>Expires At</SortableHeader>
                <SortableHeader columnKey="status" sortConfig={sortConfig} requestSort={requestSort}>Status</SortableHeader>
                <TableHead className="dark:text-gray-300">Access</TableHead>
                <TableHead className="dark:text-gray-300">Company</TableHead>
                <TableHead className="dark:text-gray-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visitors.map((visitor) => {
                const { expiredByDate, usageLimitReached, statusInvalidForEntry } = isAccessInvalid(visitor);
                const overallAccessInvalid = expiredByDate || usageLimitReached || statusInvalidForEntry;
                
                let tooltipMessage = '';
                if (visitor.status === 'expired' || expiredByDate) tooltipMessage = 'Access expired by date.';
                else if (statusInvalidForEntry) tooltipMessage = `Status: ${visitor.status}. Access revoked.`;
                if (usageLimitReached) tooltipMessage = (tooltipMessage ? tooltipMessage + ' ' : '') + 'Usage limit reached.';


                return (
                <TableRow key={visitor.id} className="dark:border-slate-700 hover:bg-muted/50 dark:hover:bg-slate-700/50">
                  <TableCell className="font-medium dark:text-white">{visitor.name}</TableCell>
                  <TableCell className="dark:text-gray-300">{visitor.unitNumber}</TableCell>
                  <TableCell className="dark:text-gray-300">
                    {visitor.expectedDateTime ? (
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-1.5 text-muted-foreground" /> {format(new Date(visitor.expectedDateTime), 'MMM dd, yyyy')}
                        <Clock className="h-4 w-4 ml-3 mr-1.5 text-muted-foreground" /> {format(new Date(visitor.expectedDateTime), 'p')}
                      </div>
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell className="dark:text-gray-300">
                    {visitor.passcodeExpiresAt ? (
                        <>
                            {format(new Date(visitor.passcodeExpiresAt), 'MMM dd, yyyy p')}
                            <span className="text-xs text-muted-foreground ml-1">{getExpirationDuration(visitor)}</span>
                        </>
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <span className={`flex items-center font-medium ${getStatusTextClass(visitor.status)}`}>
                      {getStatusIcon(visitor.status)}
                      {visitor.status.charAt(0).toUpperCase() + visitor.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">
                    <div className="flex items-center">
                      {overallAccessInvalid && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <WarningIcon className="h-4 w-4 text-red-500 mr-1" />
                          </TooltipTrigger>
                          <TooltipContent className="dark:bg-slate-900 dark:text-white">
                            <p>{tooltipMessage || "Access is currently invalid."}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {visitor.accessType === 'multiple' ? (
                        <span className="text-blue-500">
                            Multiple Entry
                            {visitor.usageLimit ? ` (Max: ${visitor.usageLimit}, Used: ${visitor.entryCount || 0})` : ''}
                        </span>
                      ) : <span className="text-green-500">Single Entry</span>}
                      {visitor.passcode && ` (${visitor.passcode})`}
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-gray-300">{visitor.companyName || 'N/A'}</TableCell>
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
                        {!isArchiveTable && (
                           <DropdownMenuItem onClick={() => onEdit(visitor)} className="dark:text-gray-300 dark:hover:bg-slate-700">
                            <Edit3 className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        )}
                        {visitor.passcode && (
                          <DropdownMenuItem onClick={() => onViewPasscode(visitor)} className="dark:text-gray-300 dark:hover:bg-slate-700">
                              <QrCode className="mr-2 h-4 w-4" /> View Passcode
                          </DropdownMenuItem>
                        )}
                        {!isArchiveTable && !visitor.passcode && !overallAccessInvalid && (
                            <DropdownMenuItem onClick={() => onGeneratePasscode(visitor)} className="dark:text-blue-400 dark:hover:bg-slate-700">
                                <QrCode className="mr-2 h-4 w-4" /> Generate Passcode
                            </DropdownMenuItem>
                        )}
                        {!isArchiveTable && visitor.passcode && !overallAccessInvalid && (
                            <DropdownMenuItem onClick={() => onResendPasscode(visitor)} className="dark:text-gray-300 dark:hover:bg-slate-700">
                                <Mail className="mr-2 h-4 w-4" /> Resend Passcode Info
                            </DropdownMenuItem>
                        )}
                        
                        {!isArchiveTable && <DropdownMenuSeparator className="dark:bg-slate-700" />}
                        {!isArchiveTable && (
                            <>
                                <DropdownMenuItem onClick={() => onStatusChange(visitor.id, 'arrived')} disabled={visitor.status === 'arrived' || visitor.status === 'departed' || overallAccessInvalid} className="dark:text-green-400 dark:hover:bg-slate-700 disabled:opacity-50">
                                <CheckCircle className="mr-2 h-4 w-4" /> Mark Arrived
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onStatusChange(visitor.id, 'departed')} disabled={visitor.status === 'departed'} className="dark:text-gray-400 dark:hover:bg-slate-700 disabled:opacity-50">
                                <XCircle className="mr-2 h-4 w-4" /> Mark Departed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onStatusChange(visitor.id, 'denied')} disabled={visitor.status === 'denied' || overallAccessInvalid} className="dark:text-red-400 dark:hover:bg-slate-700 disabled:opacity-50">
                                <XCircle className="mr-2 h-4 w-4" /> Mark Denied
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="dark:bg-slate-700" />
                                <DropdownMenuItem onClick={() => onArchive(visitor.id)} className="dark:text-yellow-400 dark:hover:bg-slate-700">
                                  <Archive className="mr-2 h-4 w-4" /> Archive
                                </DropdownMenuItem>
                            </>
                        )}
                        {isArchiveTable && onUnarchive && (
                            <DropdownMenuItem onClick={() => onUnarchive(visitor.id)} className="dark:text-blue-400 dark:hover:bg-slate-700">
                                <Archive className="mr-2 h-4 w-4" /> Unarchive
                            </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem onClick={() => onDelete(visitor.id, isArchiveTable)} className="text-red-600 dark:text-red-500 dark:hover:bg-red-900/50 focus:bg-red-100 focus:text-red-700 dark:focus:bg-red-800 dark:focus:text-red-300">
                          <Trash2 className="mr-2 h-4 w-4" /> {isArchiveTable ? "Delete Permanently" : "Remove"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );})}
            </TableBody>
          </Table>
        </div>
        </TooltipProvider>
      );
    };

    export default VisitorTable;