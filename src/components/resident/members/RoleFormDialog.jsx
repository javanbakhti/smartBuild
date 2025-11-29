import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
    import { Info, Shield, User, Users, Contact, MessageSquare, BarChart2, Settings, HelpCircle } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';

    const initialPermissions = {
      visitorManagement: { view: false, add: false, 'edit/delete': false },
      memberManagement: { view: false, add: false, 'edit/delete': false },
      contacts: { view: false, 'add/edit/delete': false },
      messages: { view: false, 'create new/edit/delete': false },
      reports: { access: false },
      settings: { access: false },
      support: { access: false },
    };

    const permissionConfig = [
      { id: 'visitorManagement', label: 'Visitor Management', icon: User, tooltip: 'Allow this member to send visitor invitations.', actions: ['view', 'add', 'edit/delete'] },
      { id: 'memberManagement', label: 'Member Management', icon: Users, tooltip: 'Enable access to manage other members in the unit.', actions: ['view', 'add', 'edit/delete'] },
      { id: 'contacts', label: 'Contacts', icon: Contact, tooltip: 'Allow access to view and manage contacts.', actions: ['view', 'add/edit/delete'] },
      { id: 'messages', label: 'Messages', icon: MessageSquare, tooltip: 'Allow access to view and manage messages.', actions: ['view', 'create new/edit/delete'] },
      { id: 'reports', label: 'Reports', icon: BarChart2, tooltip: 'Allow access to view reports.', actions: ['access'] },
      { id: 'settings', label: 'Settings', icon: Settings, tooltip: 'Allow access to personal settings.', actions: ['access'] },
      { id: 'support', label: 'Support', icon: HelpCircle, tooltip: 'Allow access to the help and support section.', actions: ['access'] },
    ];

    const RoleFormDialog = ({ isOpen, onOpenChange, onSave, role }) => {
      const [roleName, setRoleName] = useState('');
      const [permissions, setPermissions] = useState(initialPermissions);
      const { toast } = useToast();

      useEffect(() => {
        if (role) {
          setRoleName(role.name);
          // Deep merge to ensure all permission keys exist
          const mergedPermissions = JSON.parse(JSON.stringify(initialPermissions));
          for (const category in role.permissions) {
            if (mergedPermissions[category]) {
              for (const action in role.permissions[category]) {
                if (action in mergedPermissions[category]) {
                  mergedPermissions[category][action] = role.permissions[category][action];
                }
              }
            }
          }
          setPermissions(mergedPermissions);
        } else {
          setRoleName('');
          setPermissions(initialPermissions);
        }
      }, [role, isOpen]);

      const handlePermissionChange = (category, action, checked) => {
        setPermissions(prev => ({
          ...prev,
          [category]: {
            ...prev[category],
            [action]: checked,
          },
        }));
      };

      const handleSubmit = () => {
        if (!roleName.trim()) {
          toast({
            title: 'Validation Error',
            description: 'Role name cannot be empty.',
            variant: 'destructive',
          });
          return;
        }
        onSave({ id: role?.id, name: roleName, permissions });
        onOpenChange(false);
      };

      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-2xl dark:bg-slate-800">
            <DialogHeader>
              <DialogTitle className="dark:text-white flex items-center"><Shield className="mr-2 h-5 w-5" />{role ? 'Edit Role' : 'Create New Role'}</DialogTitle>
              <DialogDescription>Define the name and permissions for this role.</DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[60vh] overflow-y-auto pr-4 space-y-6">
              <div>
                <Label htmlFor="roleName" className="dark:text-gray-300">Role Name</Label>
                <Input
                  id="roleName"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g., Family Admin, Teenager"
                  className="mt-1 dark:bg-slate-700 dark:text-white dark:border-slate-600"
                />
              </div>

              <div className="space-y-4">
                {permissionConfig.map(({ id, label, icon: Icon, tooltip, actions }) => (
                  <div key={id} className="p-4 border rounded-lg dark:border-slate-700">
                    <div className="flex items-center mb-3">
                      <Icon className="w-5 h-5 mr-3 text-primary" />
                      <h4 className="font-semibold dark:text-gray-200">{label}</h4>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-gray-400 cursor-pointer ml-2" />
                        </TooltipTrigger>
                        <TooltipContent className="dark:bg-slate-900 dark:text-gray-300 dark:border-slate-700">
                          <p>{tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {actions.map(action => (
                        <div key={action} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${id}-${action}`}
                            checked={permissions[id]?.[action] || false}
                            onCheckedChange={(checked) => handlePermissionChange(id, action, checked)}
                            className="dark:border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                          />
                          <Label htmlFor={`${id}-${action}`} className="capitalize dark:text-gray-300">
                            {action.replace(/([A-Z])/g, ' $1')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">Cancel</Button>
              <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">Save Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default RoleFormDialog;