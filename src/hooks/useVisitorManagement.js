import { useState, useEffect, useMemo, useCallback } from 'react';
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
      name: '', unitNumber: '', expectedDate: '', expectedTime: '', 
      companyName: '', supervisorName: '', supervisorContact: '', visitorEmail: '', visitorPhone: '',
      comment: ''
    };

    export const useVisitorManagement = () => {
      const { toast } = useToast();
      const [activeVisitors, setActiveVisitors] = useState([]);
      const [archivedVisitors, setArchivedVisitors] = useState([]);
      const [searchTerm, setSearchTerm] = useState('');
      const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
      const [editingVisitor, setEditingVisitor] = useState(null);
      const [formData, setFormData] = useState(defaultFormDataState);
      const [isPasscodeDialogOpen, setIsPasscodeDialogOpen] = useState(false);
      const [generatedPasscodeInfo, setGeneratedPasscodeInfo] = useState(null);
      const [sortConfig, setSortConfig] = useState({ key: 'expectedDateTime', direction: 'descending' });
      const [activeTab, setActiveTab] = useState('active'); 


      const buildingUnits = JSON.parse(localStorage.getItem('buildingUnits')) || [];
      const unitOptions = useMemo(() => buildingUnits.map(u => u.identifier), [buildingUnits]);

      const processVisitorDates = (visitor) => ({
        ...visitor,
        expectedDateTime: visitor.expectedDateTime ? new Date(visitor.expectedDateTime) : null,
        passcodeExpiresAt: visitor.passcodeExpiresAt ? new Date(visitor.passcodeExpiresAt) : null,
        absoluteExpirationDateTime: visitor.absoluteExpirationDateTime ? new Date(visitor.absoluteExpirationDateTime) : null,
        entryCount: visitor.entryCount || 0,
        comment: visitor.comment || '',
      });

      const loadVisitors = useCallback(() => {
        const storedActiveVisitors = JSON.parse(localStorage.getItem('visitors')) || [];
        const storedArchivedVisitors = JSON.parse(localStorage.getItem('archivedVisitors')) || [];
        
        const now = new Date();
        const oneWeekAgo = subDays(now, 7);

        let currentActive = [];
        let currentArchived = [...storedArchivedVisitors.map(processVisitorDates)];

        storedActiveVisitors.map(processVisitorDates).forEach(visitor => {
          let v = {...visitor};
          if (v.passcodeExpiresAt && isPast(new Date(v.passcodeExpiresAt)) && v.status === 'expected') {
            v.status = 'expired';
          }

          if (v.passcodeExpiresAt && new Date(v.passcodeExpiresAt) < oneWeekAgo && v.status !== 'archived') {
            v.status = 'archived'; 
            currentArchived.push(v);
          } else if (v.status !== 'archived') { 
             currentActive.push(v);
          }
        });
        
        const uniqueArchivedMap = new Map();
        currentArchived.forEach(v => uniqueArchivedMap.set(v.id, v));
        const uniqueArchived = Array.from(uniqueArchivedMap.values());

        setActiveVisitors(currentActive);
        setArchivedVisitors(uniqueArchived);
        localStorage.setItem('visitors', JSON.stringify(currentActive));
        localStorage.setItem('archivedVisitors', JSON.stringify(uniqueArchived));

      }, []);


      useEffect(() => {
        loadVisitors();
      }, [loadVisitors]);
      

      const saveActiveVisitors = useCallback((updatedActiveVisitors) => {
        localStorage.setItem('visitors', JSON.stringify(updatedActiveVisitors));
        setActiveVisitors(updatedActiveVisitors.map(processVisitorDates));
      }, []);

      const saveArchivedVisitors = useCallback((updatedArchivedVisitors) => {
        localStorage.setItem('archivedVisitors', JSON.stringify(updatedArchivedVisitors));
        setArchivedVisitors(updatedArchivedVisitors.map(processVisitorDates));
      }, []);
      
      const saveTemporaryPasscodes = (passcodes) => localStorage.setItem('temporaryPasscodes', JSON.stringify(passcodes));
      const getTemporaryPasscodes = () => JSON.parse(localStorage.getItem('temporaryPasscodes')) || [];

      const handleInputChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
      }, []);

      const calculatePasscodeExpiration = useCallback((visitorFormData) => {
        const { expectedDate, expectedTime, expirationType, expirationDays, expirationHours, absoluteExpirationDate, absoluteExpirationTime } = visitorFormData;
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
          if (days === 0 && hours === 0) return addHours(baseExpectedDateTime, 24);
          return relativeExpiration;
        }
      }, []);

      const handleSubmit = useCallback((currentFormData) => {
        const { name, unitNumber, expectedDate, expectedTime, accessType } = currentFormData;

        if (!name || !unitNumber || !expectedDate || !expectedTime) {
          toast({ title: "Error", description: "Visitor Name, Unit, Expected Date, and Time are required.", variant: "destructive" });
          return;
        }
        if (currentFormData.expirationType === 'absolute' && (!currentFormData.absoluteExpirationDate || !currentFormData.absoluteExpirationTime)) {
          toast({ title: "Error", description: "Specific expiration date and time are required for absolute expiration.", variant: "destructive" });
          return;
        }
        if (accessType === 'multiple' && currentFormData.usageLimit && parseInt(currentFormData.usageLimit, 10) <= 0) {
          toast({ title: "Error", description: "Usage limit must be a positive number if set.", variant: "destructive" });
          return;
        }

        const expectedDateTime = new Date(`${expectedDate}T${expectedTime}`);
        const passcodeExpiresAt = calculatePasscodeExpiration(currentFormData);
        
        let visitorPayload = {
          ...currentFormData,
          expectedDateTime,
          passcodeExpiresAt,
          absoluteExpirationDateTime: currentFormData.expirationType === 'absolute' ? new Date(`${currentFormData.absoluteExpirationDate}T${currentFormData.absoluteExpirationTime}`) : null,
          usageLimit: accessType === 'multiple' && currentFormData.usageLimit ? parseInt(currentFormData.usageLimit, 10) : null,
          entryCount: editingVisitor ? (editingVisitor.entryCount || 0) : 0,
          comment: currentFormData.comment || '',
        };
        
        if (isPast(passcodeExpiresAt) && visitorPayload.status === 'expected') {
            visitorPayload.status = 'expired';
        }


        if (editingVisitor) {
          const updatedVisitors = activeVisitors.map(v => v.id === editingVisitor.id ? { ...v, ...visitorPayload } : v);
          saveActiveVisitors(updatedVisitors);
          toast({ title: "Visitor Updated", description: `${visitorPayload.name}'s details updated.` });
        } else {
          const newVisitor = { 
            id: Date.now(), ...visitorPayload,
            status: visitorPayload.status || 'expected', 
            addedBy: 'manager',
          };
          saveActiveVisitors([...activeVisitors, newVisitor]);
          toast({ title: "Visitor Added", description: `${visitorPayload.name} added.` });
        }
        setIsFormDialogOpen(false);
        setEditingVisitor(null);
        setFormData(defaultFormDataState);
        loadVisitors(); 
      }, [activeVisitors, editingVisitor, saveActiveVisitors, calculatePasscodeExpiration, toast, loadVisitors]);

      const handleEdit = useCallback((visitor) => {
        setEditingVisitor(visitor);
        const defaultEditFormData = {
          ...defaultFormDataState,
          ...visitor,
          expectedDate: visitor.expectedDateTime ? format(new Date(visitor.expectedDateTime), 'yyyy-MM-dd') : '',
          expectedTime: visitor.expectedDateTime ? format(new Date(visitor.expectedDateTime), 'HH:mm') : '',
          absoluteExpirationDate: visitor.expirationType === 'absolute' && visitor.absoluteExpirationDateTime ? format(new Date(visitor.absoluteExpirationDateTime), 'yyyy-MM-dd') : '',
          absoluteExpirationTime: visitor.expirationType === 'absolute' && visitor.absoluteExpirationDateTime ? format(new Date(visitor.absoluteExpirationDateTime), 'HH:mm') : '',
          expirationDays: visitor.expirationType === 'relative' ? (visitor.expirationDays || '1') : '1',
          expirationHours: visitor.expirationType === 'relative' ? (visitor.expirationHours || '0') : '0',
          usageLimit: visitor.usageLimit || '',
          comment: visitor.comment || '',
        };
        setFormData(defaultEditFormData);
        setIsFormDialogOpen(true);
      }, []);

      const handleDelete = useCallback((visitorId, isArchived = false) => {
        if (window.confirm(`Are you sure you want to ${isArchived ? 'permanently delete' : 'remove'} this visitor?`)) {
            if (isArchived) {
                saveArchivedVisitors(archivedVisitors.filter(v => v.id !== visitorId));
            } else {
                saveActiveVisitors(activeVisitors.filter(v => v.id !== visitorId));
            }
          toast({ title: `Visitor ${isArchived ? 'Permanently Deleted' : 'Removed'}`, variant: "destructive" });
        }
      }, [activeVisitors, archivedVisitors, saveActiveVisitors, saveArchivedVisitors, toast]);

      const handleStatusChange = useCallback((visitorId, newStatus) => {
        const visitorToUpdate = activeVisitors.find(v => v.id === visitorId);
        if (!visitorToUpdate) return;

        let updatedVisitor = { ...visitorToUpdate, status: newStatus };

        if (newStatus === 'arrived' && visitorToUpdate.accessType === 'multiple' && visitorToUpdate.usageLimit) {
          const currentCount = visitorToUpdate.entryCount || 0;
          if (currentCount < visitorToUpdate.usageLimit) {
            updatedVisitor.entryCount = currentCount + 1;
          } else {
            toast({ title: "Usage Limit Reached", description: `${visitorToUpdate.name} cannot enter, usage limit exceeded.`, variant: "destructive" });
            return;
          }
        }
        if (newStatus === 'arrived' && visitorToUpdate.passcodeExpiresAt && new Date(visitorToUpdate.passcodeExpiresAt) < new Date()) {
          updatedVisitor.status = 'expired'; 
          saveActiveVisitors(activeVisitors.map(v => v.id === visitorId ? updatedVisitor : v));
          toast({ title: "Access Expired", description: `${visitorToUpdate.name} cannot enter, access has expired. Status updated to expired.`, variant: "destructive" });
          loadVisitors(); 
          return;
        }

        saveActiveVisitors(activeVisitors.map(v => v.id === visitorId ? updatedVisitor : v));
        toast({ title: "Status Updated" });
        if (newStatus === 'departed' || newStatus === 'denied' || newStatus === 'expired') {
            loadVisitors(); 
        }
      }, [activeVisitors, saveActiveVisitors, toast, loadVisitors]);

      const sendPasscodeNotifications = useCallback((passcodeInfo) => {
        let visitorMessage = `Your access passcode for unit ${passcodeInfo.unit} is ${passcodeInfo.code}. Valid from ${passcodeInfo.validFrom} to ${passcodeInfo.validUntil}.`;
        if (passcodeInfo.companyName) visitorMessage += ` Representing: ${passcodeInfo.companyName}.`;
        
        if (passcodeInfo.visitorEmail) {
          toast({ title: "Email Sent (Simulated)", description: `To Visitor (${passcodeInfo.visitorEmail}): ${visitorMessage}`, duration: 7000 });
        }
        if (passcodeInfo.visitorPhone) {
          toast({ title: "SMS Sent (Simulated)", description: `To Visitor (${passcodeInfo.visitorPhone}): ${visitorMessage}`, duration: 7000 });
        }

        if (passcodeInfo.supervisorName && passcodeInfo.supervisorContact) {
          let supervisorMessage = `Access for ${passcodeInfo.name} (Company: ${passcodeInfo.companyName || 'N/A'}) to unit ${passcodeInfo.unit} is scheduled. Valid from ${passcodeInfo.validFrom} to ${passcodeInfo.validUntil}. Passcode details sent to visitor.`;
          toast({ title: "Notification Sent (Simulated)", description: `To Supervisor (${passcodeInfo.supervisorContact}): ${supervisorMessage}`, duration: 7000 });
        }
      }, [toast]);

      const handleGeneratePasscode = useCallback((visitor) => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const startTime = visitor.expectedDateTime ? new Date(visitor.expectedDateTime) : new Date();
        const endTime = visitor.passcodeExpiresAt ? new Date(visitor.passcodeExpiresAt) : calculatePasscodeExpiration(visitor);
        
        const tempPasscodes = getTemporaryPasscodes();
        saveTemporaryPasscodes([...tempPasscodes, { code, visitorId: visitor.id, unitNumber: visitor.unitNumber, startTime: startTime.toISOString(), endTime: endTime.toISOString() }]);
        saveActiveVisitors(activeVisitors.map(v => v.id === visitor.id ? { ...v, passcode: code, passcodeExpiresAt: endTime } : v));
        
        const passcodeInfo = {
          code, name: visitor.name, unit: visitor.unitNumber,
          validFrom: format(startTime, 'MMM dd, yyyy p'),
          validUntil: format(endTime, 'MMM dd, yyyy p'),
          qrData: `PASSCODE:${code},UNIT:${visitor.unitNumber},EXPIRES:${endTime.toISOString()}`,
          visitorEmail: visitor.visitorEmail, visitorPhone: visitor.visitorPhone,
          supervisorName: visitor.supervisorName, supervisorContact: visitor.supervisorContact,
          companyName: visitor.companyName,
        };
        setGeneratedPasscodeInfo(passcodeInfo);
        setIsPasscodeDialogOpen(true);
        sendPasscodeNotifications(passcodeInfo);
      }, [activeVisitors, saveActiveVisitors, calculatePasscodeExpiration, sendPasscodeNotifications]);
      
      const handleResendPasscode = useCallback((visitor) => {
        if (!visitor.passcode || !visitor.passcodeExpiresAt) {
          toast({ title: "Error", description: "No passcode generated for this visitor yet.", variant: "destructive"});
          return;
        }
        const passcodeInfo = {
          code: visitor.passcode, name: visitor.name, unit: visitor.unitNumber,
          validFrom: visitor.expectedDateTime ? format(new Date(visitor.expectedDateTime), 'MMM dd, yyyy p') : 'N/A',
          validUntil: visitor.passcodeExpiresAt ? format(new Date(visitor.passcodeExpiresAt), 'MMM dd, yyyy p') : 'N/A',
          qrData: `PASSCODE:${visitor.passcode},UNIT:${visitor.unitNumber},EXPIRES:${visitor.passcodeExpiresAt.toISOString()}`,
          visitorEmail: visitor.visitorEmail, visitorPhone: visitor.visitorPhone,
          supervisorName: visitor.supervisorName, supervisorContact: visitor.supervisorContact,
          companyName: visitor.companyName,
        };
        sendPasscodeNotifications(passcodeInfo);
        toast({ title: "Passcode Info Resent (Simulated)", description: `Details for ${visitor.name} resent.`});
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
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
        }
        setSortConfig({ key, direction });
      }, [sortConfig]);

      const openAddVisitorDialog = useCallback(() => {
        setEditingVisitor(null); 
        setFormData(defaultFormDataState); 
        setIsFormDialogOpen(true);
      }, []);

      const handleArchiveVisitor = useCallback((visitorId) => {
        const visitorToArchive = activeVisitors.find(v => v.id === visitorId);
        if (visitorToArchive) {
            const updatedActive = activeVisitors.filter(v => v.id !== visitorId);
            const updatedArchived = [...archivedVisitors, {...visitorToArchive, status: 'archived'}];
            saveActiveVisitors(updatedActive);
            saveArchivedVisitors(updatedArchived);
            toast({title: "Visitor Archived", description: `${visitorToArchive.name} has been moved to archive.`});
        }
      }, [activeVisitors, archivedVisitors, saveActiveVisitors, saveArchivedVisitors, toast]);

      const handleUnarchiveVisitor = useCallback((visitorId) => {
        const visitorToUnarchive = archivedVisitors.find(v => v.id === visitorId);
        if (visitorToUnarchive) {
            const updatedArchived = archivedVisitors.filter(v => v.id !== visitorId);
            const newStatus = (isPast(new Date(visitorToUnarchive.passcodeExpiresAt))) ? 'expired' : 'expected';
            const updatedActive = [...activeVisitors, {...visitorToUnarchive, status: newStatus }];
            saveActiveVisitors(updatedActive);
            saveArchivedVisitors(updatedArchived);
            toast({title: "Visitor Unarchived", description: `${visitorToUnarchive.name} has been moved to active list.`});
        }
      }, [activeVisitors, archivedVisitors, saveActiveVisitors, saveArchivedVisitors, toast]);


      return {
        activeVisitors,
        archivedVisitors,
        searchTerm,
        setSearchTerm,
        isFormDialogOpen,
        setIsFormDialogOpen,
        editingVisitor,
        setEditingVisitor,
        formData,
        setFormData,
        isPasscodeDialogOpen,
        setIsPasscodeDialogOpen,
        generatedPasscodeInfo,
        sortConfig,
        unitOptions,
        handleInputChange,
        handleSubmit,
        handleEdit,
        handleDelete,
        handleStatusChange,
        handleGeneratePasscode,
        handleViewPasscode,
        handleResendPasscode,
        requestSort,
        openAddVisitorDialog,
        handleArchiveVisitor,
        handleUnarchiveVisitor,
        activeTab, 
        setActiveTab
      };
    };