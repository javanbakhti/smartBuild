import React from 'react';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Button } from '@/components/ui/button';
    import { Badge } from '@/components/ui/badge';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
    import { MoreHorizontal, ArrowUpDown, UserPlus, Trash2, Edit, KeyRound, Send } from 'lucide-react';
    import { motion } from 'framer-motion';

    const MemberList = ({ members, sortConfig, requestSort, onEditMember, onDeleteMember, onResendInvitation, onResetPasscode, searchTerm }) => {
      
      const getSortIndicator = (key) => {
        if (sortConfig.key === key) {
          return sortConfig.direction === 'ascending' ? '▲' : '▼';
        }
        return null;
      };

      const getStatusBadge = (status) => {
        switch (status) {
          case 'active':
            return <Badge variant="success">Active</Badge>;
          case 'invited':
            return <Badge variant="outline" className="dark:border-blue-500 dark:text-blue-400">Invited</Badge>;
          case 'suspended':
            return <Badge variant="destructive">Suspended</Badge>;
          default:
            return <Badge variant="secondary">{status}</Badge>;
        }
      };

      const highlightText = (text, highlight) => {
        if (!highlight.trim()) {
          return text;
        }
        const regex = new RegExp(`(${highlight})`, 'gi');
        const parts = text.split(regex);
        return (
          <span>
            {parts.map((part, i) =>
              regex.test(part) ? (
                <span key={i} className="bg-yellow-300 dark:bg-yellow-500 dark:text-black rounded-sm px-0.5">
                  {part}
                </span>
              ) : (
                part
              )
            )}
          </span>
        );
      };

      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="overflow-x-auto bg-background dark:bg-slate-800 rounded-lg shadow"
        >
          <Table>
            <TableHeader>
              <TableRow className="dark:border-slate-700">
                <TableHead className="cursor-pointer dark:text-gray-300" onClick={() => requestSort('fullName')}>
                  Member <ArrowUpDown className="inline-block ml-1 h-4 w-4" /> {getSortIndicator('fullName')}
                </TableHead>
                <TableHead className="cursor-pointer hidden md:table-cell dark:text-gray-300" onClick={() => requestSort('relationship')}>
                  Relationship <ArrowUpDown className="inline-block ml-1 h-4 w-4" /> {getSortIndicator('relationship')}
                </TableHead>
                <TableHead className="cursor-pointer hidden lg:table-cell dark:text-gray-300" onClick={() => requestSort('dateInvited')}>
                  Date Invited <ArrowUpDown className="inline-block ml-1 h-4 w-4" /> {getSortIndicator('dateInvited')}
                </TableHead>
                <TableHead className="cursor-pointer dark:text-gray-300" onClick={() => requestSort('status')}>
                  Status <ArrowUpDown className="inline-block ml-1 h-4 w-4" /> {getSortIndicator('status')}
                </TableHead>
                <TableHead className="text-right dark:text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length > 0 ? (
                members.map((member) => (
                  <TableRow key={member.id} className="dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <TableCell>
                      <div className="font-medium dark:text-white">{highlightText(member.fullName, searchTerm)}</div>
                      <div className="text-sm text-muted-foreground dark:text-gray-400">{highlightText(member.email, searchTerm)}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell dark:text-gray-300">{member.relationship || 'N/A'}</TableCell>
                    <TableCell className="hidden lg:table-cell dark:text-gray-300">
                      {member.dateInvited ? new Date(member.dateInvited).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>{getStatusBadge(member.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="dark:bg-slate-800 dark:border-slate-700">
                          <DropdownMenuItem onClick={() => onEditMember(member)} className="dark:focus:bg-slate-700">
                            <Edit className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          {member.status === 'invited' && (
                            <DropdownMenuItem onClick={() => onResendInvitation(member)} className="dark:focus:bg-slate-700">
                              <Send className="mr-2 h-4 w-4" /> Resend Invitation
                            </DropdownMenuItem>
                          )}
                          {member.status === 'active' && (
                            <DropdownMenuItem onClick={() => onResetPasscode(member)} className="dark:focus:bg-slate-700">
                              <KeyRound className="mr-2 h-4 w-4" /> Reset Passcode
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => onDeleteMember(member.id)} className="text-red-600 dark:text-red-500 dark:focus:bg-red-900/50 dark:focus:text-red-400">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UserPlus className="w-10 h-10 text-gray-400" />
                      <span className="font-semibold">No members found.</span>
                      <span className="text-sm">Click "Invite New Member" to add someone to your unit.</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </motion.div>
      );
    };

    export default MemberList;