import React, { useState, useEffect } from 'react';
    import Layout from '@/components/Layout';
    import { motion } from 'framer-motion';
    import { useRoleManagement } from '@/hooks/useRoleManagement';
    import RolesAndPermissions from '@/components/resident/members/RolesAndPermissions';
    import { useToast } from '@/components/ui/use-toast';
    import { Loader2 } from 'lucide-react';

    const ResidentRoles = () => {
      const [currentResident, setCurrentResident] = useState(null);
      const [initialLoading, setInitialLoading] = useState(true);
      const { toast } = useToast();

      useEffect(() => {
        const residentString = localStorage.getItem('user');
        if (residentString) {
          try {
            setCurrentResident(JSON.parse(residentString));
          } catch (error) {
            console.error("Failed to parse current resident:", error);
            toast({
              title: "Error",
              description: "Could not load your information. Please try logging in again.",
              variant: "destructive",
            });
          }
        }
        setInitialLoading(false);
      }, [toast]);

      const { roles, loading: rolesLoading, addRole, updateRole, deleteRole } = useRoleManagement(currentResident?.id);

      const handleSaveRole = (roleData) => {
        if (roleData.id) {
          updateRole(roleData.id, roleData);
        } else {
          addRole(roleData);
        }
      };

      const handleDeleteRoleWithConfirmation = (roleId) => {
        deleteRole(roleId);
      };

      const isLoading = initialLoading || rolesLoading;

      if (isLoading) {
        return (
          <Layout role="resident">
            <div className="flex items-center justify-center h-full p-4 md:p-6 lg:p-8">
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-xl font-semibold">Loading Roles & Permissions...</p>
              </div>
            </div>
          </Layout>
        );
      }

      if (!currentResident) {
        return (
          <Layout role="resident">
            <div className="flex items-center justify-center h-full p-4 md:p-6 lg:p-8">
              <p className="text-xl text-muted-foreground">Could not load resident information. Please log in again.</p>
            </div>
          </Layout>
        );
      }

      return (
        <Layout role="resident">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 p-4 md:p-6 lg:p-8"
          >
            <RolesAndPermissions
              roles={roles}
              onSaveRole={handleSaveRole}
              onDeleteRole={handleDeleteRoleWithConfirmation}
            />
          </motion.div>
        </Layout>
      );
    };

    export default ResidentRoles;