import React, { useMemo } from 'react';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Button } from '@/components/ui/button';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
    import { MoreHorizontal, Mail, Trash2, ArrowUpDown } from 'lucide-react';
    import { usePermissions } from '@/contexts/PermissionContext';

    const AdminList = ({ admins, adminRoles, searchTerm, sortConfig, requestSort, onDeleteAdmin, onResendInvitation }) => {
      const { hasPermission } = usePermissions();
      
      const sortedAdmins = useMemo(() => {
        let sortableAdmins = [...admins];
        if (sortConfig.key) {
          sortableAdmins.sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            if (sortConfig.key === 'roleId') {
              aValue = adminRoles.find(r => r.id === a.roleId)?.name || 'N/A';
              bValue = adminRoles.find(r => r.id === b.roleId)?.name || 'N/A';
            }

            if (aValue < bValue) {
              return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
              return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
          });
        }
        return sortableAdmins;
      }, [admins, sortConfig, adminRoles]);

      const handleRequestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
        }
        requestSort({ key, direction });
      };
      
      const SortableHeader = ({ children, columnKey }) => {
        const isSorted = sortConfig && sortConfig.key === columnKey;
        const direction = isSorted ? sortConfig.direction : null;

        return (
          <TableHead onClick={() => handleRequestSort(columnKey)} className="cursor-pointer dark:text-gray-300 hover:bg-muted/20 dark:hover:bg-slate-700/30 transition-colors">
            <div className="flex items-center">
              {children}
              {isSorted && <ArrowUpDown className={`ml-2 h-4 w-4 ${direction === 'ascending' ? 'text-primary' : 'text-primary'}`} />}
              {!isSorted && <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />}
            </div>
          </TableHead>
        );
      };

      const filteredAdmins = sortedAdmins.filter(admin =>
        admin.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return (
        <Card className="dark:bg-slate-800 shadow-lg">
          <CardHeader>
            <CardTitle className="dark:text-white">Admin List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-slate-700">
                    <SortableHeader columnKey="email">Email</SortableHeader>
                    <SortableHeader columnKey="roleId">Role</SortableHeader>
                    <SortableHeader columnKey="status">Status</SortableHeader>
                    <SortableHeader columnKey="dateInvited">Date Invited</SortableHeader>
                    <TableHead className="dark:text-gray-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.length > 0 ? filteredAdmins.map((admin) => (
                    <TableRow key={admin.id} className="dark:border-slate-700 hover:bg-muted/50 dark:hover:bg-slate-700/50">
                      <TableCell className="font-medium dark:text-white">{admin.email}</TableCell>
                      <TableCell className="dark:text-gray-300">
                        {adminRoles.find(r => r.id === admin.roleId)?.name || 'Default Admin'}
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          admin.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100'
                        }`}>
                          {admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="dark:text-gray-300">
                        {new Date(admin.dateInvited).toLocaleDateString()}
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
                            {admin.status === 'invited' && hasPermission('manageAdmins', 'add') && (
                              <DropdownMenuItem onClick={() => onResendInvitation(admin)} className="dark:text-gray-300 dark:hover:bg-slate-700">
                                <Mail className="mr-2 h-4 w-4" /> Resend Invitation
                              </DropdownMenuItem>
                            )}
                            {hasPermission('manageAdmins', 'delete') && <DropdownMenuSeparator className="dark:bg-slate-700" />}
                            {hasPermission('manageAdmins', 'delete') && (
                              <DropdownMenuItem onClick={() => onDeleteAdmin(admin.id)} className="text-red-600 dark:text-red-500 dark:hover:bg-red-900/50 focus:bg-red-100 focus:text-red-700 dark:focus:bg-red-800 dark:focus:text-red-300">
                                <Trash2 className="mr-2 h-4 w-4" /> Remove Admin
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center dark:text-gray-300">
                        No administrators found. Invite one to get started.
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

    export default AdminList;