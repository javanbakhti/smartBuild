import { useState, useEffect, useMemo, useCallback } from 'react';
    import { useToast } from '@/components/ui/use-toast';

    const defaultFormData = {
      id: null,
      fullName: '',
      email: '',
      nickname: '',
      relationship: '',
      phoneNumber: '',
      immediateAccess: false,
      passcodeType: 'auto',
      customPasscode: '',
      notifyVia: 'email',
      referralCode: '',
      invitationLink: '',
      isEnabled: true,
      roleId: '',
    };

    const generateMemberReferralCode = (unitNumber) => `MEMBER-${unitNumber}-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    export const useMemberManagement = (initialResident, roles = []) => {
      const { toast } = useToast();
      const [members, setMembers] = useState([]);
      const [resident, setResident] = useState(initialResident);
      const [loading, setLoading] = useState(true);
      
      const [formData, setFormData] = useState(defaultFormData);
      const [editingMember, setEditingMember] = useState(null);
      const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
      const [isInvitationPreviewOpen, setIsInvitationPreviewOpen] = useState(false);
      const [previewData, setPreviewData] = useState(null);
      
      const [isResetPasscodeDialogOpen, setIsResetPasscodeDialogOpen] = useState(false);
      const [memberToResetPasscode, setMemberToResetPasscode] = useState(null);
      const [newPasscodeData, setNewPasscodeData] = useState({ type: 'auto', custom: '', notifyVia: 'email' });
      const [resetPasscodeError, setResetPasscodeError] = useState('');

      useEffect(() => {
        if (initialResident && initialResident.id) {
          setResident(initialResident);
          try {
            const storedMembers = JSON.parse(localStorage.getItem(`residentMembers_${initialResident.id}`)) || [];
            setMembers(storedMembers.map(m => ({...m, status: m.status || 'invited'})));
          } catch (error) {
            console.error("Error parsing data from localStorage:", error);
            toast({ title: "Error", description: "Could not load data. Please try refreshing.", variant: "destructive"});
          }
        }
        setLoading(false);
      }, [initialResident, toast]);

      const existingPasscodesForUnit = useMemo(() => {
        const currentMemberId = editingMember ? editingMember.id : (memberToResetPasscode ? memberToResetPasscode.id : null);
        return members
          .filter(m => m.passcode && m.id !== currentMemberId)
          .map(m => m.passcode);
      }, [members, editingMember, memberToResetPasscode]);

      useEffect(() => {
        if (isResetPasscodeDialogOpen && newPasscodeData.type === 'custom' && newPasscodeData.custom) {
          const pc = newPasscodeData.custom;
          if (!/^\d{4,8}$/.test(pc)) {
            setResetPasscodeError('Passcode must be 4-8 digits.');
          } else if (existingPasscodesForUnit.includes(pc)) {
            setResetPasscodeError('This passcode is already in use for this unit.');
          } else {
            setResetPasscodeError('');
          }
        } else {
          setResetPasscodeError('');
        }
      }, [newPasscodeData.custom, newPasscodeData.type, isResetPasscodeDialogOpen, existingPasscodesForUnit]);

      const saveMembers = useCallback((updatedMembers) => {
        if (resident && resident.id) {
          localStorage.setItem(`residentMembers_${resident.id}`, JSON.stringify(updatedMembers));
          setMembers(updatedMembers);
        } else {
          toast({ title: "Save Error", description: "Could not save member data. Resident information missing.", variant: "destructive"});
        }
      }, [resident, toast]);

      const resetForm = useCallback(() => {
        const defaultRole = roles.find(r => r.isDefault) || roles[0];
        setFormData({
          ...defaultFormData,
          roleId: defaultRole ? defaultRole.id : '',
        });
        setEditingMember(null);
      }, [roles]);

      const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      }, []);

      const handleCheckboxChange = useCallback((name, checked) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }, []);
      
      const handleRadioGroupChange = useCallback((name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
      }, []);
      
      const handleSelectChange = useCallback((name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
      }, []);

      const generatePasscode = useCallback(() => {
        let newPc;
        const currentPasscodes = members.map(m => m.passcode).filter(Boolean);
        do {
          newPc = Math.floor(1000 + Math.random() * 90000000).toString().substring(0, Math.floor(Math.random() * 5) + 4);
        } while (currentPasscodes.includes(newPc));
        return newPc;
      }, [members]);

      const prepareMemberInvitationData = useCallback((currentData) => {
        if (!resident || !resident.unitNumber || !resident.id || !resident.buildingUid) {
            console.error("Cannot prepare invitation data: resident details missing.");
            return { ...currentData, referralCode: '', invitationLink: '' };
        }
        const code = currentData.referralCode || generateMemberReferralCode(resident.unitNumber);
        const link = currentData.invitationLink || `${window.location.origin}/signup/member?referralCode=${code}&email=${encodeURIComponent(currentData.email)}&name=${encodeURIComponent(currentData.fullName)}&phoneNumber=${encodeURIComponent(currentData.phoneNumber || '')}&unitNumber=${encodeURIComponent(resident.unitNumber)}&residentId=${encodeURIComponent(resident.id)}&buildingUid=${encodeURIComponent(resident.buildingUid)}`;
        return { ...currentData, referralCode: code, invitationLink: link };
      }, [resident]);
      
      const handleSubmitMember = useCallback(() => {
        if (!resident || !resident.id || !resident.unitNumber) {
          toast({ title: "Error", description: "Resident information is missing or incomplete.", variant: "destructive" });
          return;
        }
        if (!formData.fullName.trim() || !formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
          toast({ title: "Error", description: "Full Name and a valid Email are required.", variant: "destructive" });
          return;
        }
        if ((formData.notifyVia === 'sms' || formData.notifyVia === 'both' || formData.immediateAccess) && (!formData.phoneNumber || !/^\+?[1-9]\d{1,14}$/.test(formData.phoneNumber))) {
             toast({ title: "Error", description: "A valid phone number is required for SMS notifications or immediate access.", variant: "destructive" });
             return;
        }

        let memberPasscode = null;
        if (editingMember === null && formData.immediateAccess) {
          if (formData.passcodeType === 'auto') {
            memberPasscode = generatePasscode();
          } else {
            if (!/^\d{4,8}$/.test(formData.customPasscode) || existingPasscodesForUnit.includes(formData.customPasscode)) {
              toast({ title: "Error", description: "Invalid or duplicate custom passcode.", variant: "destructive" });
              return;
            }
            memberPasscode = formData.customPasscode;
          }
        }
        
        let finalMemberData = { ...formData };
        if (editingMember === null || (editingMember && editingMember.status === 'invited')) {
            finalMemberData = prepareMemberInvitationData(finalMemberData);
        }


        if (editingMember) {
          const updatedMember = { ...editingMember, ...finalMemberData };
          if (updatedMember.status !== 'invited') {
             updatedMember.status = finalMemberData.isEnabled ? 'active' : 'suspended';
          }
          if (updatedMember.status === 'invited') {
            const rePreparedInvite = prepareMemberInvitationData(updatedMember);
            updatedMember.referralCode = rePreparedInvite.referralCode;
            updatedMember.invitationLink = rePreparedInvite.invitationLink;
          }
          const updatedMembers = members.map(m => m.id === editingMember.id ? updatedMember : m);
          saveMembers(updatedMembers);
          toast({ title: "Member Updated", description: `${finalMemberData.fullName} has been updated.` });
        } else { 
          if (members.some(member => member.email === finalMemberData.email)) {
            toast({ title: "Error", description: "This email is already associated with a member in your unit.", variant: "destructive" });
            return;
          }
          const newMember = {
            ...finalMemberData,
            id: Date.now(),
            passcode: memberPasscode,
            status: finalMemberData.isEnabled ? 'invited' : 'suspended',
            dateInvited: new Date().toISOString(),
            invitedBy: resident.id,
            unitNumber: resident.unitNumber,
            floorNumber: resident.floorNumber || 'N/A',
            buildingUid: resident.buildingUid,
          };
          saveMembers([...members, newMember]);
          
          let notificationMessage = `An invitation has been prepared for ${finalMemberData.fullName}.`;
          if (formData.immediateAccess && memberPasscode) {
            notificationMessage += ` Passcode ${memberPasscode} for immediate door access sent via ${finalMemberData.notifyVia}. (Simulated)`;
            console.log(`LOG: Member Immediate Access & Invite - Email: ${finalMemberData.email}, Phone: ${finalMemberData.phoneNumber}, Unit: ${resident.unitNumber}, Passcode: ${memberPasscode}, Notify: ${finalMemberData.notifyVia}, Referral: ${finalMemberData.referralCode}`);
          } else {
            console.log(`LOG: Member Invitation Prepared - Email: ${finalMemberData.email}, Unit: ${resident.unitNumber}, Referral: ${finalMemberData.referralCode}`);
          }
          toast({ title: "Action Complete", description: notificationMessage });
        }
        resetForm();
        setIsInviteDialogOpen(false);
      }, [resident, formData, editingMember, members, saveMembers, generatePasscode, toast, resetForm, existingPasscodesForUnit, prepareMemberInvitationData]);

      const handleEditMember = useCallback((member) => {
        setEditingMember(member);
        const dataForForm = {
          ...defaultFormData, 
          ...member, 
          isEnabled: member.status !== 'suspended',
          immediateAccess: false, 
          passcodeType: 'auto', 
          customPasscode: '', 
          referralCode: member.referralCode || '',
          invitationLink: member.invitationLink || '',
        };
        setFormData(dataForForm);
        setIsInviteDialogOpen(true);
      }, []);

      const handleDeleteMember = useCallback((memberId) => {
        const memberToRemove = members.find(m => m.id === memberId);
        if (window.confirm(`Are you sure you want to remove ${memberToRemove?.fullName || 'this member'}? This action cannot be undone.`)) {
          saveMembers(members.filter(member => member.id !== memberId));
          console.log(`LOG: Member Removed - Email: ${memberToRemove?.email}, Unit: ${resident?.unitNumber}`);
          toast({ title: "Member Removed", description: `${memberToRemove?.fullName} has been removed.`, variant: "destructive" });
        }
      }, [members, resident, saveMembers, toast]);
      
      const handlePreviewMemberInvitation = useCallback((memberDataForPreview) => {
        if (!memberDataForPreview.fullName || !memberDataForPreview.email) {
             toast({ title: "Missing Information", description: "Please fill in Name and Email before previewing.", variant: "destructive"});
             return;
        }
        let dataWithInviteDetails = prepareMemberInvitationData(memberDataForPreview);
        
        if (dataWithInviteDetails.immediateAccess) {
          if (dataWithInviteDetails.passcodeType === 'auto') {
            dataWithInviteDetails.passcode = generatePasscode();
          } else {
            if (!/^\d{4,8}$/.test(dataWithInviteDetails.customPasscode) || existingPasscodesForUnit.includes(dataWithInviteDetails.customPasscode)) {
              toast({ title: "Error", description: "Invalid or duplicate custom passcode for preview.", variant: "destructive" });
              return;
            }
            dataWithInviteDetails.passcode = dataWithInviteDetails.customPasscode;
          }
        }

        setPreviewData(dataWithInviteDetails); 
        setIsInvitationPreviewOpen(true);
      }, [prepareMemberInvitationData, toast, generatePasscode, existingPasscodesForUnit]);

      const handleResendInvitation = useCallback((member) => {
        if (member.status !== 'invited') {
            toast({ title: "Cannot Resend", description: "Only 'invited' members can have their invitation resent.", variant: "destructive" });
            return;
        }
        handlePreviewMemberInvitation(member); 
      }, [handlePreviewMemberInvitation, toast]);

      const handleActualSendMemberInvitation = useCallback(() => {
        if (!previewData || !previewData.email || !previewData.referralCode) {
            toast({ title: "Error", description: "Cannot send invitation. Preview data is missing.", variant: "destructive" });
            return;
        }
        toast({ title: "Member Invitation Sent (Simulated)", description: `Invitation with code ${previewData.referralCode} sent to ${previewData.email}.`});
        setIsInvitationPreviewOpen(false); 
        setPreviewData(null);
      }, [previewData, toast]);


      const handleOpenResetPasscodeDialog = useCallback((member) => {
        setMemberToResetPasscode(member);
        setNewPasscodeData({ type: 'auto', custom: '', notifyVia: member.notifyVia || 'email' });
        setResetPasscodeError('');
        setIsResetPasscodeDialogOpen(true);
      }, []);

      const handleConfirmResetPasscode = useCallback(() => {
        if (!memberToResetPasscode) return;

        let newPc = '';
        if (newPasscodeData.type === 'auto') {
          newPc = generatePasscode();
        } else {
          if (resetPasscodeError) {
            toast({ title: "Error", description: resetPasscodeError, variant: "destructive" });
            return;
          }
          newPc = newPasscodeData.custom;
        }
        
        const updatedMembers = members.map(m => 
          m.id === memberToResetPasscode.id ? { ...m, passcode: newPc, status: m.status === 'invited' ? 'invited' : 'active' } : m
        );
        saveMembers(updatedMembers);
        
        console.log(`LOG: Passcode Reset - Member: ${memberToResetPasscode.email}, New Passcode: ${newPc}, Notify: ${newPasscodeData.notifyVia}`);
        toast({ title: "Passcode Reset", description: `New passcode ${newPc} sent to ${memberToResetPasscode.fullName} via ${newPasscodeData.notifyVia}. (Simulated)` });
        
        setIsResetPasscodeDialogOpen(false);
        setMemberToResetPasscode(null);
      }, [memberToResetPasscode, newPasscodeData, resetPasscodeError, generatePasscode, saveMembers, members, toast]);

      return {
        members,
        resident,
        loading,
        formData, setFormData,
        editingMember, setEditingMember,
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
      };
    };