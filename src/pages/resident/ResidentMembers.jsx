import React, { useState, useEffect, useMemo } from 'react';
    import Layout from '@/components/Layout';
    import { motion } from 'framer-motion';
    import ManageMembersHeader from '@/components/resident/members/ManageMembersHeader';
    import MemberList from '@/components/resident/members/MemberList';
    import InviteMemberDialog from '@/components/resident/members/InviteMemberDialog';
    import MemberInvitationPreviewDialog from '@/components/resident/members/MemberInvitationPreviewDialog';
    import { KeyRound, ShieldAlert } from 'lucide-react';
    import { useMemberManagement } from '@/hooks/useMemberManagement';
    import { useRoleManagement } from '@/hooks/useRoleManagement';
    import {
      AlertDialog,
      AlertDialogCancel,
      AlertDialogContent,
      AlertDialogDescription,
      AlertDialogFooter,
      AlertDialogHeader,
      AlertDialogTitle,
    } from "@/components/ui/alert-dialog";
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
    import { Button } from '@/components/ui/button';

    const ResidentMembers = () => {
      const [currentResident, setCurrentResident] = useState(null);
      const [initialLoading, setInitialLoading] = useState(true);
      
      useEffect(() => {
        const residentString = localStorage.getItem('user');
        if (residentString) {
          try {
            setCurrentResident(JSON.parse(residentString));
          } catch (error) {
            console.error("Failed to parse current resident:", error);
          }
        }
        setInitialLoading(false);
      }, []);

      const { roles } = useRoleManagement(currentResident?.id);

      const {
        members,
        resident,
        loading: membersLoading,
        formData,
        editingMember,
        isInviteDialogOpen, setIsInviteDialogOpen,
        isInvitationPreviewOpen, setIsInvitationPreviewOpen,
        isResetPasscodeDialogOpen, setIsResetPasscodeDialogOpen,
        memberToResetPasscode,
        newPasscodeData, setNewPasscodeData,
        resetPasscodeError,
        resetForm,
        handleInputChange,
        handleCheckboxChange,
        handleRadioGroupChange,
        handleSelectChange,
        handleSubmitMember,
        handleEditMember,
        handleDeleteMember,
        handleResendInvitation,
        handleOpenResetPasscodeDialog,
        handleConfirmResetPasscode,
        existingPasscodesForUnit,
        handlePreviewMemberInvitation,
        handleActualSendMemberInvitation,
        previewData,
      } = useMemberManagement(currentResident, roles);

      
      const [searchTerm, setSearchTerm] = useState('');
      const [sortConfig, setSortConfig] = useState({ key: 'fullName', direction: 'ascending' });
      
      const sortedMembers = useMemo(() => {
        let sortableItems = [...members];
        if (sortConfig.key) {
          sortableItems.sort((a, b) => {
            const valA = a[sortConfig.key] || '';
            const valB = b[sortConfig.key] || '';
             if (['dateInvited'].includes(sortConfig.key)) {
                return (new Date(valA) < new Date(valB) ? 1 : -1) * (sortConfig.direction === 'ascending' ? 1 : -1);
            }
            if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
          });
        }
        return sortableItems;
      }, [members, sortConfig]);
      
      const filteredMembers = sortedMembers.filter(member =>
        member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.nickname && member.nickname.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      if (initialLoading || membersLoading) {
        return (
          <Layout role="resident">
             <div className="flex items-center justify-center h-full p-4 md:p-6 lg:p-8">
              <p className="text-xl text-muted-foreground">Loading your data...</p>
            </div>
          </Layout>
        );
      }

      if (!resident) {
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
            <ManageMembersHeader
              unitNumber={resident.unitNumber}
              onInviteClick={() => { resetForm(); setIsInviteDialogOpen(true); }}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
            />
            
            <MemberList
              members={filteredMembers}
              sortConfig={sortConfig}
              requestSort={setSortConfig}
              onEditMember={handleEditMember}
              onDeleteMember={handleDeleteMember}
              onResendInvitation={handleResendInvitation}
              onResetPasscode={handleOpenResetPasscodeDialog}
              searchTerm={searchTerm} 
            />

            <InviteMemberDialog
              isOpen={isInviteDialogOpen}
              onOpenChange={(isOpen) => { setIsInviteDialogOpen(isOpen); if (!isOpen) resetForm(); }}
              formData={formData}
              onInputChange={handleInputChange}
              onCheckboxChange={handleCheckboxChange}
              onRadioGroupChange={handleRadioGroupChange}
              onSelectChange={handleSelectChange}
              onSubmit={handleSubmitMember}
              isEditing={!!editingMember} 
              existingPasscodes={existingPasscodesForUnit}
              onPreviewInvitation={handlePreviewMemberInvitation}
              roles={roles}
            />

            <MemberInvitationPreviewDialog
              isOpen={isInvitationPreviewOpen}
              onOpenChange={setIsInvitationPreviewOpen}
              memberData={previewData} 
              residentName={resident?.fullName}
              unitNumber={resident?.unitNumber}
              onSendInvitation={handleActualSendMemberInvitation}
            />

            {memberToResetPasscode && (
              <AlertDialog open={isResetPasscodeDialogOpen} onOpenChange={setIsResetPasscodeDialogOpen}>
                <AlertDialogContent className="dark:bg-slate-800">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="dark:text-white">Reset Passcode for {memberToResetPasscode.fullName}</AlertDialogTitle>
                    <AlertDialogDescription className="dark:text-gray-400">
                      Generate a new passcode or set a custom one. The member will be notified.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4 py-2">
                    <div>
                      <Label className="dark:text-gray-300">Passcode Type</Label>
                      <RadioGroup
                        value={newPasscodeData.type}
                        onValueChange={(value) => setNewPasscodeData(prev => ({ ...prev, type: value, custom: '' }))}
                        className="flex space-x-4 pt-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="auto" id="resetAutoPasscode" className="dark:border-slate-600 dark:text-primary data-[state=checked]:border-primary" />
                          <Label htmlFor="resetAutoPasscode" className="dark:text-gray-300">Auto-generate</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="custom" id="resetCustomPasscodeOption" className="dark:border-slate-600 dark:text-primary data-[state=checked]:border-primary" />
                          <Label htmlFor="resetCustomPasscodeOption" className="dark:text-gray-300">Custom</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    {newPasscodeData.type === 'custom' && (
                      <div>
                        <Label htmlFor="resetCustomPasscodeValue" className="dark:text-gray-300">Custom Passcode (4-8 digits)</Label>
                        <Input 
                          id="resetCustomPasscodeValue" 
                          type="text" 
                          inputMode="numeric"
                          pattern="\d*"
                          maxLength={8}
                          value={newPasscodeData.custom} 
                          onChange={(e) => setNewPasscodeData(prev => ({ ...prev, custom: e.target.value }))} 
                          placeholder="e.g., 654321" 
                          className={`dark:bg-slate-700 dark:text-white dark:border-slate-600 ${resetPasscodeError ? 'border-red-500 dark:border-red-500' : ''}`} 
                        />
                        {resetPasscodeError && <p className="text-xs text-red-500 dark:text-red-400 flex items-center"><ShieldAlert className="w-3 h-3 mr-1"/>{resetPasscodeError}</p>}
                      </div>
                    )}
                    <div>
                      <Label className="dark:text-gray-300">Notify Member via</Label>
                      <RadioGroup
                        value={newPasscodeData.notifyVia}
                        onValueChange={(value) => setNewPasscodeData(prev => ({ ...prev, notifyVia: value }))}
                        className="flex space-x-4 pt-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="email" id="resetNotifyEmail" className="dark:border-slate-600 dark:text-primary data-[state=checked]:border-primary" />
                          <Label htmlFor="resetNotifyEmail" className="dark:text-gray-300">Email</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sms" id="resetNotifySms" className="dark:border-slate-600 dark:text-primary data-[state=checked]:border-primary" />
                          <Label htmlFor="resetNotifySms" className="dark:text-gray-300">SMS</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="both" id="resetNotifyBoth" className="dark:border-slate-600 dark:text-primary data-[state=checked]:border-primary" />
                          <Label htmlFor="resetNotifyBoth" className="dark:text-gray-300">Both</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsResetPasscodeDialogOpen(false)} className="dark:bg-slate-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-600">Cancel</AlertDialogCancel>
                    <Button 
                      onClick={handleConfirmResetPasscode} 
                      className="bg-primary hover:bg-primary/90"
                      disabled={newPasscodeData.type === 'custom' && (!!resetPasscodeError || !newPasscodeData.custom)}
                    >
                      <KeyRound className="mr-2 h-4 w-4" /> Reset & Send Passcode
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

          </motion.div>
        </Layout>
      );
    };

    export default ResidentMembers;