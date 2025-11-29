import React, { useState, useEffect } from 'react';
    import Layout from '@/components/Layout';
    import { Button } from '@/components/ui/button';
    import { ShieldAlert, UserCog, PlusCircle } from 'lucide-react';
    import { motion } from 'framer-motion';
    import ManageAdminsHeader from '@/components/manager/admins/ManageAdminsHeader';
    import AdminList from '@/components/manager/admins/AdminList';
    import InviteAdminDialog from '@/components/manager/admins/InviteAdminDialog';
    import { useToast } from '@/components/ui/use-toast';
    import { useNavigate } from 'react-router-dom';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import AdminRolesList from '@/components/manager/admins/AdminRolesList';
    import AdminRoleForm from '@/components/manager/admins/AdminRoleForm';
    import AdminInvitationLinkDialog from '@/components/manager/admins/AdminInvitationLinkDialog';
    import { usePermissions } from '@/contexts/PermissionContext';

    const ManageAdmins = () => {
      const { toast } = useToast();
      const navigate = useNavigate();
      const { hasPermission, isManager } = usePermissions();
      const [admins, setAdmins] = useState([]);
      const [adminRoles, setAdminRoles] = useState([]);
      const [searchTerm, setSearchTerm] = useState('');
      const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
      const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
      const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
      const [generatedLink, setGeneratedLink] = useState('');
      const [inviteEmail, setInviteEmail] = useState('');
      const [selectedRoleId, setSelectedRoleId] = useState(null);
      const [editingRole, setEditingRole] = useState(null);
      const [currentUser, setCurrentUser] = useState(null);
      const [sortConfig, setSortConfig] = useState({ key: 'email', direction: 'ascending' });
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        try {
          const currentUserString = localStorage.getItem('user');
          if (currentUserString) {
            const user = JSON.parse(currentUserString);
            setCurrentUser(user);
            if (user && user.buildingUid) {
              const storedAdmins = JSON.parse(localStorage.getItem(`buildingAdmins_${user.buildingUid}`)) || [];
              const storedRoles = JSON.parse(localStorage.getItem(`buildingAdminRoles_${user.buildingUid}`)) || [];
              setAdmins(storedAdmins);
              setAdminRoles(storedRoles);
            } else if (user && user.role === 'manager' && !user.buildingUid) {
               console.warn("Manager user found, but no buildingUid associated.");
               toast({ title: "Configuration Incomplete", description: "Building UID not found for manager. Please ensure building setup is complete.", variant: "destructive"});
            }
          } else {
            toast({ title: "Authentication Error", description: "User data not found. Please log in again.", variant: "destructive"});
          }
        } catch (error) {
          console.error("Error loading user or admin data:", error);
          toast({ title: "Error", description: "Could not load necessary data. Please try refreshing.", variant: "destructive"});
        }
        setLoading(false);
      }, [toast]);

      const saveAdmins = (updatedAdmins) => {
        if (currentUser && currentUser.buildingUid) {
          localStorage.setItem(`buildingAdmins_${currentUser.buildingUid}`, JSON.stringify(updatedAdmins));
          setAdmins(updatedAdmins);
        } else {
          console.error("Cannot save admins: User or Building UID is missing.");
          toast({ title: "Save Error", description: "Could not save admin data due to missing user or building information.", variant: "destructive"});
        }
      };

      const saveAdminRoles = (updatedRoles) => {
        if (currentUser && currentUser.buildingUid) {
          localStorage.setItem(`buildingAdminRoles_${currentUser.buildingUid}`, JSON.stringify(updatedRoles));
          setAdminRoles(updatedRoles);
        } else {
          toast({ title: "Save Error", description: "Could not save admin roles data.", variant: "destructive"});
        }
      };

      const handleInviteAdmin = () => {
        if (!currentUser || !currentUser.buildingUid) {
          toast({ title: "Error", description: "Cannot invite admin: Building UID is missing.", variant: "destructive" });
          return;
        }
        if (!inviteEmail.trim() || !/\S+@\S+\.\S+/.test(inviteEmail)) {
          toast({ title: "Error", description: "Please enter a valid email address.", variant: "destructive" });
          return;
        }
        if (!selectedRoleId) {
          toast({ title: "Error", description: "Please select a role for the new admin.", variant: "destructive" });
          return;
        }
        if (admins.some(admin => admin.email === inviteEmail)) {
          toast({ title: "Error", description: "This email is already associated with an admin.", variant: "destructive" });
          return;
        }

        const referralCode = `${currentUser.buildingUid}-${Date.now().toString(36)}`;
        const newAdmin = {
          id: Date.now(),
          email: inviteEmail,
          status: 'invited',
          buildingUid: currentUser.buildingUid,
          referralCode: referralCode,
          dateInvited: new Date().toISOString(),
          roleId: parseInt(selectedRoleId, 10),
        };
        saveAdmins([...admins, newAdmin]);
        
        const invitationLink = `${window.location.origin}/signup/admin?token=${referralCode}`;
        setGeneratedLink(invitationLink);
        
        toast({ title: "Invitation Created", description: `An invitation has been created for ${inviteEmail}.` });
        setInviteEmail('');
        setSelectedRoleId(null);
        setIsInviteDialogOpen(false);
        setIsLinkDialogOpen(true);
      };

      const handleDeleteAdmin = (adminId) => {
        if (window.confirm("Are you sure you want to remove this admin? Their access will be revoked.")) {
          const adminToRemove = admins.find(admin => admin.id === adminId);
          saveAdmins(admins.filter(admin => admin.id !== adminId));
          console.log(`LOG: Admin Removed - Email: ${adminToRemove?.email}, BuildingUID: ${currentUser?.buildingUid}`);
          toast({ title: "Admin Removed", description: `Admin access has been revoked.`, variant: "destructive" });
        }
      };
      
      const handleResendInvitation = (admin) => {
        const invitationLink = `${window.location.origin}/signup/admin?token=${admin.referralCode}`;
        setGeneratedLink(invitationLink);
        setIsLinkDialogOpen(true);
        toast({ title: "Invitation Link Ready", description: `The link for ${admin.email} is ready to be shared.`});
      };

      const handleSaveRole = (roleData) => {
        if (!roleData.name.trim()) {
          toast({ title: "Error", description: "Role name cannot be empty.", variant: "destructive" });
          return false;
        }

        if (roleData.id) { // Editing existing role
          const updatedRoles = adminRoles.map(r => r.id === roleData.id ? roleData : r);
          saveAdminRoles(updatedRoles);
          toast({ title: "Role Updated", description: `Role "${roleData.name}" has been updated.` });
        } else { // Creating new role
          if (adminRoles.some(r => r.name.toLowerCase() === roleData.name.toLowerCase())) {
            toast({ title: "Error", description: "A role with this name already exists.", variant: "destructive" });
            return false;
          }
          const newRole = { ...roleData, id: Date.now() };
          saveAdminRoles([...adminRoles, newRole]);
          toast({ title: "Role Created", description: `Role "${roleData.name}" has been created.` });
        }
        return true;
      };

      const handleEditRole = (role) => {
        setEditingRole(role);
        setIsRoleFormOpen(true);
      };

      const handleDeleteRole = (roleId) => {
        const roleIsAssigned = admins.some(admin => admin.roleId === roleId);
        if (roleIsAssigned) {
          toast({ title: "Cannot Delete Role", description: "This role is assigned to one or more admins. Please reassign them before deleting this role.", variant: "destructive" });
          return;
        }

        if (window.confirm("Are you sure you want to delete this role? This action cannot be undone.")) {
          saveAdminRoles(adminRoles.filter(r => r.id !== roleId));
          toast({ title: "Role Deleted", variant: "destructive" });
        }
      };

      if (loading) {
        return <Layout role="manager"><div className="text-center p-8">Loading...</div></Layout>;
      }
      
      if (!hasPermission('manageAdmins', 'view')) {
        return (
          <Layout role={currentUser?.role || "admin"}>
             <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-semibold text-red-600 dark:text-red-400">Access Denied</h2>
              <p className="text-muted-foreground mt-2">You do not have permission to manage administrators.</p>
              <Button onClick={() => window.history.back()} className="mt-6">Go Back</Button>
            </div>
          </Layout>
        );
      }
      
      if (isManager && !currentUser.buildingUid) {
         return (
          <Layout role="manager">
             <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <UserCog className="w-16 h-16 text-orange-500 mb-4" />
              <h2 className="text-2xl font-semibold text-orange-600 dark:text-orange-400">Building UID Missing</h2>
              <p className="text-muted-foreground mt-2">
                A Building UID is required to manage administrators. 
                Please ensure the building setup is complete.
              </p>
              <Button onClick={() => navigate('/manager/building-setup')} className="mt-6">Go to Building Setup</Button>
            </div>
          </Layout>
        );
      }

      return (
        <Layout role={currentUser?.role}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <ManageAdminsHeader
              buildingUid={currentUser.buildingUid}
              onInviteClick={() => setIsInviteDialogOpen(true)}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
            />

            <Tabs defaultValue="admins" className="w-full">
              <TabsList className="grid w-full grid-cols-2 dark:bg-slate-900">
                <TabsTrigger value="admins" className="dark:data-[state=active]:bg-slate-700">Manage Admins</TabsTrigger>
                <TabsTrigger value="roles" className="dark:data-[state=active]:bg-slate-700">Admin Roles</TabsTrigger>
              </TabsList>
              <TabsContent value="admins">
                <AdminList
                  admins={admins}
                  adminRoles={adminRoles}
                  searchTerm={searchTerm}
                  sortConfig={sortConfig}
                  requestSort={setSortConfig}
                  onDeleteAdmin={handleDeleteAdmin}
                  onResendInvitation={handleResendInvitation}
                />
              </TabsContent>
              <TabsContent value="roles">
                <div className="space-y-4">
                  {hasPermission('manageAdmins', 'add') && (
                    <div className="text-right">
                      <Button onClick={() => { setEditingRole(null); setIsRoleFormOpen(true); }}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Create New Role
                      </Button>
                    </div>
                  )}
                  <AdminRolesList
                    roles={adminRoles}
                    onEditRole={handleEditRole}
                    onDeleteRole={handleDeleteRole}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <InviteAdminDialog
              isOpen={isInviteDialogOpen}
              onOpenChange={setIsInviteDialogOpen}
              email={inviteEmail}
              onEmailChange={setInviteEmail}
              onSubmit={handleInviteAdmin}
              buildingUid={currentUser.buildingUid}
              roles={adminRoles}
              selectedRole={selectedRoleId}
              onRoleChange={setSelectedRoleId}
            />
            
            <AdminRoleForm
              isOpen={isRoleFormOpen}
              onOpenChange={setIsRoleFormOpen}
              onSaveRole={handleSaveRole}
              editingRole={editingRole}
            />

            <AdminInvitationLinkDialog
              isOpen={isLinkDialogOpen}
              onOpenChange={setIsLinkDialogOpen}
              invitationLink={generatedLink}
            />

          </motion.div>
        </Layout>
      );
    };

    export default ManageAdmins;