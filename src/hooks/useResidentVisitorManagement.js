import { useState, useEffect, useCallback } from 'react';
    import { useToast } from '@/components/ui/use-toast';
    import { format, addHours, addDays, isPast, subDays } from 'date-fns';

    const defaultFormDataState = {
      accessType: 'single',
      expirationType: 'relative',
      expirationDays: '1',
      expirationHours: '0',
      absoluteExpirationDate: '',
      absoluteExpirationTime: '',
      usageLimit: '',
      entryCount: 0,
      status: 'expected',
      name: '',
      expectedDate: '',
      expectedTime: '',
      visitorEmail: '',
      visitorPhone: '',
      comment: '',
      companyName: '',
      referralCode: '',
      invitationLink: '',
    };
    
    const generateReferralCode = () => `RES_VISITOR_${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const processVisitorData = (visitor) => ({
      ...visitor,
      expectedDateTime: visitor.expectedDateTime ? new Date(visitor.expectedDateTime) : null,
      passcodeExpiresAt: visitor.passcodeExpiresAt ? new Date(visitor.passcodeExpiresAt) : null,
      absoluteExpirationDateTime: visitor.absoluteExpirationDateTime ? new Date(visitor.absoluteExpirationDateTime) : null,
      entryCount: visitor.entryCount || 0,
      comment: visitor.comment || '',
      referralCode: visitor.referralCode || '',
      invitationLink: visitor.invitationLink || '',
    });

    const calculatePasscodeExpirationHelper = (guestFormData) => {
      const { expectedDate, expectedTime, expirationType, expirationDays, expirationHours, absoluteExpirationDate, absoluteExpirationTime } = guestFormData;
      if (!expectedDate || !expectedTime) return addDays(new Date(), 1);
      const baseExpectedDateTime = new Date(`${expectedDate}T${expectedTime}`);
  
      if (expirationType === 'absolute') {
        if (absoluteExpirationDate && absoluteExpirationTime) {
          return new Date(`${absoluteExpirationDate}T${absoluteExpirationTime}`);
        }
        return addDays(baseExpectedDateTime, 1);
      } else {
        const days = parseInt(expirationDays, 10) || 0;
        const hours = parseInt(expirationHours, 10) || 0;
        let relativeExpiration = baseExpectedDateTime;
        if (days > 0) relativeExpiration = addDays(relativeExpiration, days);
        if (hours > 0) relativeExpiration = addHours(relativeExpiration, hours);
        if (days === 0 && hours === 0 && expirationType === 'relative') return addHours(baseExpectedDateTime, 24);
        return relativeExpiration;
      }
    };

    export const useResidentVisitorManagement = () => {
      const { toast } = useToast();
      const [activeVisitors, setActiveVisitors] = useState([]); 
      const [archivedVisitors, setArchivedVisitors] = useState([]);
      const [searchTerm, setSearchTerm] = useState('');
      const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
      const [editingVisitor, setEditingVisitor] = useState(null);
      const [formData, setFormData] = useState(defaultFormDataState);
      const [isPasscodeDialogOpen, setIsPasscodeDialogOpen] = useState(false);
      const [generatedPasscodeInfo, setGeneratedPasscodeInfo] = useState(null);
      const [isInvitationPreviewOpen, setIsInvitationPreviewOpen] = useState(false); // Not used in this hook
      const [invitationPreviewData, setInvitationPreviewData] = useState(null); // Not used in this hook
      const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
      const [activeTab, setActiveTab] = useState('active');
      const [currentUser, setCurrentUser] = useState(null);
      const [loading, setLoading] = useState(true);
    
      const getStorageKey = useCallback((type = 'active') => {
        if (!currentUser || !currentUser.id || !currentUser.buildingUid) return null;
        return type === 'active'
          ? `residentVisitors_${currentUser.id}_${currentUser.buildingUid}`
          : `residentArchivedVisitors_${currentUser.id}_${currentUser.buildingUid}`;
      }, [currentUser]);
    
      const loadData = useCallback(() => {
        if (!currentUser) {
          setLoading(false);
          return;
        }
        setLoading(true);
        const activeKey = getStorageKey('active');
        const archivedKey = getStorageKey('archived');
    
        if (!activeKey || !archivedKey) {
          setLoading(false);
          return;
        }
    
        const storedActive = JSON.parse(localStorage.getItem(activeKey)) || [];
        const storedArchived = JSON.parse(localStorage.getItem(archivedKey)) || [];
        
        setActiveVisitors(storedActive.map(processVisitorData));
        setArchivedVisitors(storedArchived.map(processVisitorData));
        setLoading(false);
      }, [currentUser, getStorageKey]);
    
      useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const parsedUser = JSON.parse(userStr);
            setCurrentUser(parsedUser);
            setFormData(prev => ({ ...prev, unitNumber: parsedUser.unitNumber }));
          } catch (e) { console.error("Failed to parse user from localStorage", e); setLoading(false); }
        } else { setLoading(false); }
      }, []);
    
      useEffect(() => { if (currentUser) loadData(); }, [currentUser, loadData]);
    
      const saveDataToStorage = useCallback((data, type = 'active') => {
        const key = getStorageKey(type);
        if (key) {
          localStorage.setItem(key, JSON.stringify(data));
          if (type === 'active') setActiveVisitors(data.map(processVisitorData));
          else setArchivedVisitors(data.map(processVisitorData));
        }
      }, [getStorageKey]);
    
      const handleInputChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
      }, []);
    
      const handleSubmit = useCallback(() => {
        if (!currentUser || !currentUser.unitNumber) {
          toast({ title: "Error", description: "Resident unit information is missing.", variant: "destructive" });
          return;
        }
        const { name, expectedDate, expectedTime } = formData;
        if (!name || !expectedDate || !expectedTime) {
          toast({ title: "Error", description: "Visitor Name, Expected Date, and Time are required.", variant: "destructive" });
          return;
        }
        
        let visitorPayload = { ...formData, unitNumber: currentUser.unitNumber };
        visitorPayload.passcodeExpiresAt = calculatePasscodeExpirationHelper(visitorPayload);
        visitorPayload.expectedDateTime = new Date(`${expectedDate}T${expectedTime}`);

        if (editingVisitor) {
          const updatedVisitors = activeVisitors.map(v => v.id === editingVisitor.id ? { ...editingVisitor, ...visitorPayload } : v);
          saveDataToStorage(updatedVisitors, 'active');
          toast({ title: "Visitor Updated", description: `Details for ${visitorPayload.name} updated.` });
        } else {
          const newVisitor = {
            id: `res_visitor_${Date.now()}`,
            ...visitorPayload,
            addedByResidentId: currentUser.id,
            status: 'expected', // Resident visitors are typically for direct access, not invites unless explicitly stated
          };
          saveDataToStorage([...activeVisitors, newVisitor], 'active');
          toast({ title: "Visitor Added", description: `${visitorPayload.name} added for unit ${currentUser.unitNumber}.` });
        }
        
        setIsFormDialogOpen(false);
        setEditingVisitor(null);
        setFormData({...defaultFormDataState, unitNumber: currentUser.unitNumber});
        loadData();
      }, [activeVisitors, editingVisitor, saveDataToStorage, toast, currentUser, loadData, formData]);

      const handleEdit = useCallback((visitor) => {
        setEditingVisitor(visitor);
        const formDataForEdit = {
          ...defaultFormDataState,
          ...visitor,
          unitNumber: currentUser?.unitNumber,
          expectedDate: visitor.expectedDateTime ? format(new Date(visitor.expectedDateTime), 'yyyy-MM-dd') : '',
          expectedTime: visitor.expectedDateTime ? format(new Date(visitor.expectedDateTime), 'HH:mm') : '',
        };
        setFormData(formDataForEdit);
        setIsFormDialogOpen(true);
      }, [currentUser]);
    
      const handleDelete = useCallback((visitorId, isArchived = false) => {
        if (window.confirm(`Are you sure you want to ${isArchived ? 'permanently delete' : 'remove'} this visitor?`)) {
          if (isArchived) {
            saveDataToStorage(archivedVisitors.filter(v => v.id !== visitorId), 'archived');
          } else {
            saveDataToStorage(activeVisitors.filter(v => v.id !== visitorId), 'active');
          }
          toast({ title: `Visitor ${isArchived ? 'Permanently Deleted' : 'Removed'}`, variant: "destructive" });
        }
      }, [activeVisitors, archivedVisitors, saveDataToStorage, toast]);
    
      const handleStatusChange = useCallback((visitorId, newStatus) => {
        const visitorToUpdate = activeVisitors.find(v => v.id === visitorId);
        if (!visitorToUpdate) return;
    
        let updatedVisitor = { ...visitorToUpdate, status: newStatus };
        if (newStatus === 'arrived' && visitorToUpdate.passcodeExpiresAt && new Date(visitorToUpdate.passcodeExpiresAt) < new Date()) {
          updatedVisitor.status = 'expired'; 
          toast({ title: "Access Expired", description: `${visitorToUpdate.name}'s access has expired. Status updated to expired.`, variant: "destructive" });
        }
        
        saveDataToStorage(activeVisitors.map(v => v.id === visitorId ? updatedVisitor : v), 'active');
        toast({ title: "Status Updated" });
        if (newStatus === 'departed' || newStatus === 'denied' || newStatus === 'expired') {
          loadData(); 
        }
      }, [activeVisitors, saveDataToStorage, toast, loadData]);
    
      const sendPasscodeNotifications = useCallback((passcodeInfo) => {
        let message = `Access passcode for unit ${passcodeInfo.unit}: ${passcodeInfo.code}. Valid: ${passcodeInfo.validFrom} to ${passcodeInfo.validUntil}.`;
        if (passcodeInfo.visitorEmail) toast({ title: "Email (Simulated)", description: `To ${passcodeInfo.visitorEmail}: ${message}`, duration: 7000 });
        if (passcodeInfo.visitorPhone) toast({ title: "SMS (Simulated)", description: `To ${passcodeInfo.visitorPhone}: ${message}`, duration: 7000 });
      }, [toast]);
    
      const handleGeneratePasscode = useCallback((visitor) => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const startTime = visitor.expectedDateTime ? new Date(visitor.expectedDateTime) : new Date();
        const endTime = visitor.passcodeExpiresAt ? new Date(visitor.passcodeExpiresAt) : calculatePasscodeExpirationHelper(visitor);
    
        saveDataToStorage(activeVisitors.map(v => v.id === visitor.id ? { ...v, passcode: code, passcodeExpiresAt: endTime } : v), 'active');
    
        const info = {
          code, name: visitor.name, unit: visitor.unitNumber,
          validFrom: format(startTime, 'MMM dd, yyyy p'),
          validUntil: format(endTime, 'MMM dd, yyyy p'),
          qrData: `PASSCODE:${code},UNIT:${visitor.unitNumber},EXPIRES:${endTime.toISOString()}`,
          visitorEmail: visitor.visitorEmail, visitorPhone: visitor.visitorPhone,
        };
        setGeneratedPasscodeInfo(info);
        setIsPasscodeDialogOpen(true);
        sendPasscodeNotifications(info);
      }, [activeVisitors, saveDataToStorage, sendPasscodeNotifications]);
    
      const handleResendPasscode = useCallback((visitor) => {
        if (!visitor.passcode || !visitor.passcodeExpiresAt) {
          toast({ title: "Error", description: "No passcode generated yet.", variant: "destructive" });
          return;
        }
        const info = {
          code: visitor.passcode, name: visitor.name, unit: visitor.unitNumber,
          validFrom: visitor.expectedDateTime ? format(new Date(visitor.expectedDateTime), 'MMM dd, yyyy p') : 'N/A',
          validUntil: visitor.passcodeExpiresAt ? format(new Date(visitor.passcodeExpiresAt), 'MMM dd, yyyy p') : 'N/A',
          qrData: `PASSCODE:${visitor.passcode},UNIT:${visitor.unitNumber},EXPIRES:${visitor.passcodeExpiresAt.toISOString()}`,
          visitorEmail: visitor.visitorEmail, visitorPhone: visitor.visitorPhone,
        };
        sendPasscodeNotifications(info);
        toast({ title: "Passcode Info Resent (Simulated)" });
      }, [sendPasscodeNotifications, toast]);
    
      const handleViewPasscode = useCallback((visitor) => {
        if (!visitor.passcode) return;
        setGeneratedPasscodeInfo({
          code: visitor.passcode, name: visitor.name, unit: visitor.unitNumber,
          validFrom: visitor.expectedDateTime ? format(new Date(visitor.expectedDateTime), 'MMM dd, yyyy p') : 'N/A',
          validUntil: visitor.passcodeExpiresAt ? format(new Date(visitor.passcodeExpiresAt), 'MMM dd, yyyy p') : 'N/A',
          qrData: `PASSCODE:${visitor.passcode},UNIT:${visitor.unitNumber},EXPIRES:${visitor.passcodeExpiresAt.toISOString()}`
        });
        setIsPasscodeDialogOpen(true);
      }, []);
    
      const requestSort = useCallback((key) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending' }));
      }, []);
    
      const openAddVisitorDialog = useCallback(() => {
        setEditingVisitor(null);
        setFormData({...defaultFormDataState, unitNumber: currentUser?.unitNumber});
        setIsFormDialogOpen(true);
      }, [currentUser]);
    
      const handleArchiveVisitor = useCallback((visitorId) => {
        const visitorToArchive = activeVisitors.find(v => v.id === visitorId);
        if (visitorToArchive) {
          const updatedActive = activeVisitors.filter(v => v.id !== visitorId);
          const updatedArchived = [...archivedVisitors, { ...visitorToArchive, status: 'archived' }];
          saveDataToStorage(updatedActive, 'active');
          saveDataToStorage(updatedArchived, 'archived');
          toast({ title: "Visitor Archived", description: `${visitorToArchive.name} moved to archive.` });
        }
      }, [activeVisitors, archivedVisitors, saveDataToStorage, toast]);
    
      const handleUnarchiveVisitor = useCallback((visitorId) => {
        const visitorToUnarchive = archivedVisitors.find(v => v.id === visitorId);
        if (visitorToUnarchive) {
          const updatedArchived = archivedVisitors.filter(v => v.id !== visitorId);
          const newStatus = (isPast(new Date(visitorToUnarchive.passcodeExpiresAt || 0))) ? 'expired' : 'expected';
          const updatedActive = [...activeVisitors, { ...visitorToUnarchive, status: newStatus }];
          saveDataToStorage(updatedActive, 'active');
          saveDataToStorage(updatedArchived, 'archived');
          toast({ title: "Visitor Unarchived", description: `${visitorToUnarchive.name} moved to active list.` });
        }
      }, [activeVisitors, archivedVisitors, saveDataToStorage, toast]);
    
      return {
        activeVisitors, archivedVisitors, searchTerm, setSearchTerm,
        isFormDialogOpen, setIsFormDialogOpen, editingVisitor, setEditingVisitor,
        formData, setFormData, isPasscodeDialogOpen, setIsPasscodeDialogOpen,
        generatedPasscodeInfo, sortConfig, handleInputChange, handleSubmit,
        handleEdit, handleDelete, handleStatusChange, handleGeneratePasscode,
        handleViewPasscode, handleResendPasscode, requestSort, openAddVisitorDialog,
        handleArchiveVisitor, handleUnarchiveVisitor, activeTab, setActiveTab,
        currentUser, loading,
        isInvitationPreviewOpen, setIsInvitationPreviewOpen, // Keep for consistency, though not used here
        invitationPreviewData, setInvitationPreviewData,     // Keep for consistency
        handleOpenInvitationPreview: () => {},             // Placeholder
        handleSendInvitation: () => {},                    // Placeholder
        viewExistingInvitation: () => {}                   // Placeholder
      };
    };