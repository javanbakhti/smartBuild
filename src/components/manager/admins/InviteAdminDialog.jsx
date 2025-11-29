import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


    const InviteAdminDialog = ({ isOpen, onOpenChange, email, onEmailChange, onSubmit, buildingUid, roles, selectedRole, onRoleChange }) => {
      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-md dark:bg-slate-800">
            <DialogHeader>
              <DialogTitle className="dark:text-white">Invite New Administrator</DialogTitle>
              <DialogDescription>
                Enter the email address and assign a role for the new admin. Building UID: {buildingUid}.
                They will receive an invitation link.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="inviteEmail" className="dark:text-gray-300">Admin's Email</Label>
                <Input 
                  id="inviteEmail" 
                  type="email" 
                  value={email} 
                  onChange={(e) => onEmailChange(e.target.value)} 
                  placeholder="admin@example.com" 
                  className="dark:bg-slate-700 dark:text-white dark:border-slate-600" 
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="adminRole" className="dark:text-gray-300">Admin Role</Label>
                <Select onValueChange={onRoleChange} value={selectedRole || ""}>
                  <SelectTrigger id="adminRole" className="w-full dark:bg-slate-700 dark:text-white dark:border-slate-600">
                    <SelectValue placeholder="Select a role..." />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:text-white dark:border-slate-600">
                    {roles.length > 0 ? roles.map(role => (
                      <SelectItem key={role.id} value={role.id.toString()} className="dark:hover:bg-slate-700">
                        {role.name}
                      </SelectItem>
                    )) : (
                      <SelectItem value="" disabled>No roles defined. Please create one first.</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={onSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Send Invitation
              </Button>
              <DialogClose asChild>
                <Button variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default InviteAdminDialog;