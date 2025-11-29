import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ADMIN_PERMISSIONS } from './permissions';

const AdminRoleForm = ({ isOpen, onOpenChange, onSaveRole, editingRole }) => {
  const [roleName, setRoleName] = useState('');
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    if (editingRole) {
      setRoleName(editingRole.name);
      setPermissions(editingRole.permissions || {});
    } else {
      setRoleName('');
      setPermissions({});
    }
  }, [editingRole, isOpen]);

  const handlePermissionChange = (category, action) => {
    setPermissions(prev => {
      const newPermissions = { ...prev };
      if (!newPermissions[category]) {
        newPermissions[category] = {};
      }
      newPermissions[category][action] = !newPermissions[category][action];
      
      // If 'view' is unchecked, uncheck all others in the same category
      if (action === 'view' && !newPermissions[category][action]) {
        Object.keys(newPermissions[category]).forEach(act => {
          if (act !== 'view') {
            newPermissions[category][act] = false;
          }
        });
      }
      
      // If any other action is checked, ensure 'view' is also checked
      if (action !== 'view' && newPermissions[category][action]) {
        newPermissions[category]['view'] = true;
      }

      return newPermissions;
    });
  };
  
  const handleCategoryPermissionChange = (category, actions, isChecked) => {
    setPermissions(prev => {
      const newPermissions = { ...prev };
      if (!newPermissions[category]) {
        newPermissions[category] = {};
      }
      actions.forEach(action => {
        newPermissions[category][action] = isChecked;
      });
      return newPermissions;
    });
  };

  const handleSubmit = () => {
    if (onSaveRole({ ...editingRole, name: roleName, permissions })) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl dark:bg-slate-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">{editingRole ? 'Edit Admin Role' : 'Create New Admin Role'}</DialogTitle>
          <DialogDescription>
            Define the role name and select the specific permissions for this role.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="roleName" className="dark:text-gray-300">Role Name</Label>
            <Input
              id="roleName"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g., Front Desk, Maintenance Staff"
              className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
            />
          </div>
          <div className="space-y-2">
            <Label className="dark:text-gray-300">Permissions</Label>
            <ScrollArea className="h-72 w-full rounded-md border p-4 dark:border-slate-700">
              <div className="space-y-4">
                {Object.entries(ADMIN_PERMISSIONS).map(([category, details]) => {
                  const categoryPermissions = permissions[category] || {};
                  const allCategoryActions = Object.keys(details.actions);
                  const isAllChecked = allCategoryActions.every(action => categoryPermissions[action]);

                  return (
                    <div key={category} className="space-y-2 pb-2 border-b last:border-b-0 dark:border-slate-700">
                      <div className="flex items-center space-x-2">
                         <Checkbox
                          id={`select-all-${category}`}
                          checked={isAllChecked}
                          onCheckedChange={(checked) => handleCategoryPermissionChange(category, allCategoryActions, checked)}
                        />
                        <Label htmlFor={`select-all-${category}`} className="font-semibold text-base dark:text-white">{details.label}</Label>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pl-6">
                        {allCategoryActions.map(action => (
                          <div key={action} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${category}-${action}`}
                              checked={!!categoryPermissions[action]}
                              onCheckedChange={() => handlePermissionChange(category, action)}
                            />
                            <Label htmlFor={`${category}-${action}`} className="font-normal dark:text-gray-300">
                              {details.actions[action]}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {editingRole ? 'Save Changes' : 'Create Role'}
          </Button>
          <DialogClose asChild>
            <Button variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminRoleForm;