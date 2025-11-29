import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit3, Trash2 } from 'lucide-react';
import { usePermissions } from '@/contexts/PermissionContext';

const AdminRolesList = ({ roles, onEditRole, onDeleteRole }) => {
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('manageAdmins', 'edit');
  const canDelete = hasPermission('manageAdmins', 'delete');

  return (
    <Card className="dark:bg-slate-800 shadow-lg">
      <CardHeader>
        <CardTitle className="dark:text-white">Defined Roles</CardTitle>
        <CardDescription>Roles that can be assigned to administrators.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {roles.length > 0 ? roles.map(role => (
            <div key={role.id} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
              <span className="font-medium dark:text-gray-200">{role.name}</span>
              <div className="space-x-2">
                {canEdit && (
                  <Button variant="ghost" size="icon" onClick={() => onEditRole(role)} className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:bg-slate-600">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                )}
                {canDelete && (
                  <Button variant="ghost" size="icon" onClick={() => onDeleteRole(role.id)} className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:bg-slate-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )) : (
            <p className="text-center text-muted-foreground py-4">No roles defined yet. Create a role to get started.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminRolesList;