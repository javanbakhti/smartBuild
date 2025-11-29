import React, { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { PlusCircle, Edit, Trash2, ShieldCheck } from 'lucide-react';
    import RoleFormDialog from './RoleFormDialog';
    import {
      AlertDialog,
      AlertDialogAction,
      AlertDialogCancel,
      AlertDialogContent,
      AlertDialogDescription,
      AlertDialogFooter,
      AlertDialogHeader,
      AlertDialogTitle,
      AlertDialogTrigger,
    } from "@/components/ui/alert-dialog";
    import { Badge } from '@/components/ui/badge';

    const RolesAndPermissions = ({ roles, onSaveRole, onDeleteRole }) => {
      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingRole, setEditingRole] = useState(null);

      const handleAddNewRole = () => {
        setEditingRole(null);
        setIsFormOpen(true);
      };

      const handleEditRole = (role) => {
        setEditingRole(role);
        setIsFormOpen(true);
      };

      return (
        <Card className="dark:bg-slate-800 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="dark:text-white">Manage Member Roles</CardTitle>
                <CardDescription>Create and manage roles to assign specific permissions to your members.</CardDescription>
              </div>
              <Button onClick={handleAddNewRole} className="bg-primary hover:bg-primary/90">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Role
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roles.length > 0 ? (
                roles.map(role => (
                  <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg dark:border-slate-700 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                      <p className="font-medium dark:text-gray-200">{role.name}</p>
                      {role.isDefault && (
                        <Badge variant="outline" className="border-primary text-primary bg-primary/10 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" /> Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditRole(role)}>
                        <Edit className="h-4 w-4 text-gray-400" />
                      </Button>
                      {!role.isDefault && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="dark:bg-slate-800">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="dark:text-white">Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the "{role.name}" role.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="dark:bg-slate-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-600">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDeleteRole(role.id)} className="bg-destructive hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg dark:border-slate-700">
                  <p className="text-muted-foreground">No roles created yet.</p>
                  <p className="text-sm text-muted-foreground">Click "Add New Role" to get started.</p>
                </div>
              )}
            </div>
          </CardContent>

          <RoleFormDialog
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            onSave={onSaveRole}
            role={editingRole}
          />
        </Card>
      );
    };

    export default RolesAndPermissions;