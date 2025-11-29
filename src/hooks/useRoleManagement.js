import { useState, useEffect, useCallback } from 'react';
    import { useToast } from '@/components/ui/use-toast';

    const defaultPermissions = {
      can_view_visitors: false,
      can_manage_visitors: false,
      can_view_members: true,
      can_manage_members: false,
      can_view_contacts: true,
      can_manage_contacts: false,
      can_view_reports: false,
      can_access_settings: false,
    };

    const defaultRole = {
      id: 'default-member-role',
      name: 'Member',
      description: 'Default role with basic permissions for unit members.',
      isDefault: true,
      permissions: { ...defaultPermissions },
    };

    export const useRoleManagement = (residentId) => {
      const { toast } = useToast();
      const [roles, setRoles] = useState([]);
      const [loading, setLoading] = useState(true);

      const getRoles = useCallback(() => {
        if (!residentId) return [];
        try {
          const storedRoles = JSON.parse(localStorage.getItem(`residentRoles_${residentId}`)) || [];
          const allRoles = [defaultRole, ...storedRoles];
          return allRoles;
        } catch (error) {
          console.error("Error parsing roles from localStorage:", error);
          return [defaultRole];
        }
      }, [residentId]);

      useEffect(() => {
        if (residentId) {
          setLoading(true);
          const allRoles = getRoles();
          setRoles(allRoles);
          setLoading(false);
        } else {
          setLoading(false);
          setRoles([]);
        }
      }, [residentId, getRoles]);

      const saveRoles = useCallback((updatedRoles) => {
        if (!residentId) {
          toast({ title: "Save Error", description: "Cannot save roles. Resident information missing.", variant: "destructive" });
          return;
        }
        const rolesToStore = updatedRoles.filter(role => !role.isDefault);
        localStorage.setItem(`residentRoles_${residentId}`, JSON.stringify(rolesToStore));
        setRoles([defaultRole, ...rolesToStore]);
      }, [residentId, toast]);

      const addRole = useCallback((roleData) => {
        const newRole = {
          id: `role_${Date.now()}`,
          ...roleData,
          permissions: { ...defaultPermissions, ...roleData.permissions },
          isDefault: false,
        };
        const currentRoles = getRoles().filter(r => !r.isDefault);
        const updatedRoles = [...currentRoles, newRole];
        saveRoles(updatedRoles);
        toast({ title: "Role Created", description: `The role "${newRole.name}" has been successfully created.` });
      }, [getRoles, saveRoles, toast]);

      const updateRole = useCallback((roleId, updatedData) => {
        const currentRoles = getRoles();
        const updatedRoles = currentRoles.map(role =>
          role.id === roleId ? { ...role, ...updatedData } : role
        );
        saveRoles(updatedRoles);
        toast({ title: "Role Updated", description: `The role "${updatedData.name}" has been updated.` });
      }, [getRoles, saveRoles, toast]);

      const deleteRole = useCallback((roleId) => {
        const roleToDelete = roles.find(r => r.id === roleId);
        if (roleToDelete && roleToDelete.isDefault) {
          toast({ title: "Action Forbidden", description: "The default role cannot be deleted.", variant: "destructive" });
          return;
        }
        
        if (window.confirm(`Are you sure you want to delete the role "${roleToDelete?.name}"? This action cannot be undone.`)) {
          const currentRoles = getRoles();
          const updatedRoles = currentRoles.filter(role => role.id !== roleId);
          saveRoles(updatedRoles);
          toast({ title: "Role Deleted", description: `The role "${roleToDelete?.name}" has been deleted.`, variant: "destructive" });
        }
      }, [roles, getRoles, saveRoles, toast]);

      return {
        roles,
        loading,
        addRole,
        updateRole,
        deleteRole,
        defaultPermissions,
      };
    };