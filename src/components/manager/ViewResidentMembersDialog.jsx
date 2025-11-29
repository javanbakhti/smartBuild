import React, { useState, useEffect } from 'react';
    import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Users, Mail, ShieldAlert } from 'lucide-react';
    import { Button } from '@/components/ui/button';

    const ViewResidentMembersDialog = ({ isOpen, onOpenChange, resident }) => {
      const [members, setMembers] = useState([]);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        if (isOpen && resident && resident.id) {
          setLoading(true);
          const storedMembers = JSON.parse(localStorage.getItem(`residentMembers_${resident.id}`)) || [];
          setMembers(storedMembers);
          setLoading(false);
        }
      }, [isOpen, resident]);

      if (!resident) return null;

      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-lg dark:bg-slate-800">
            <DialogHeader>
              <DialogTitle className="dark:text-white flex items-center">
                <Users className="mr-2 h-5 w-5 text-primary" /> Members of {resident.fullName}'s Unit ({resident.unitNumber})
              </DialogTitle>
              <DialogDescription>
                List of members associated with this resident's unit.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-2 mt-4">
              {loading ? (
                <p className="text-center text-muted-foreground">Loading members...</p>
              ) : members.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="dark:border-slate-700">
                      <TableHead className="dark:text-gray-300">Full Name</TableHead>
                      <TableHead className="dark:text-gray-300">Email</TableHead>
                      <TableHead className="dark:text-gray-300">Relationship</TableHead>
                      <TableHead className="dark:text-gray-300">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id} className="dark:border-slate-700">
                        <TableCell className="font-medium dark:text-white">{member.fullName}</TableCell>
                        <TableCell className="dark:text-gray-300">{member.email}</TableCell>
                        <TableCell className="dark:text-gray-300">{member.relationship || 'N/A'}</TableCell>
                        <TableCell className="dark:text-gray-300">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            member.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100'
                          }`}>
                            {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShieldAlert className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
                  No members found for this resident.
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <DialogClose asChild>
                <Button variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">Close</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      );
    };

    export default ViewResidentMembersDialog;