import { useState, useEffect, useCallback, useMemo } from 'react';
    import { useToast } from '@/components/ui/use-toast';
    import { useNavigate } from 'react-router-dom';

    const defaultContactFormData = {
      id: null,
      // Main Info
      firstName: '',
      lastName: '',
      nickname: '',
      contactType: 'service_provider', // personal, business, service_provider, emergency, other
      visibility: 'me', // me, unit, public
      tags: [],
      
      // Optional Details
      primaryPhoneNumber: '',
      emailPrimary: '',
      website: '',
      addressStreet: '',
      
      // Hidden extended fields
      secondaryPhoneNumber: '',
      workPhoneNumber: '',
      emailSecondary: '',
      addressCity: '',
      addressState: '',
      addressZip: '',
      addressCountry: '',
      companyName: '',
      jobTitle: '',
      
      // System fields
      createdBy: '', // userId
      ownerId: '', // userId of creator
      buildingUid: '',
      unitId: '', // unitId of creator
      
      // Feature fields
      ratings: [], // [{ userId, rating(1-5) }]
      comments: [], // [{ id, userId, userName, comment, reactions: {'👍': [userIds]}, timestamp }]
      usedBy: [], // [userIds]
      reports: [], // [{ reportId, reportedByUserId, reportedByUserName, reason, timestamp, status: 'open' | 'resolved' }]
    };

    export const useContactsManagement = () => {
      const { toast } = useToast();
      const navigate = useNavigate();
      const [allContacts, setAllContacts] = useState([]);
      const [isLoading, setIsLoading] = useState(true);
      const [isFormOpen, setIsFormOpen] = useState(false);
      const [editingContact, setEditingContact] = useState(null);
      const [contactFormData, setContactFormData] = useState(defaultContactFormData);
      
      const [searchTerm, setSearchTerm] = useState('');
      const [sortConfig, setSortConfig] = useState({ key: 'recently_added', direction: 'descending' });
      
      const [currentUser, setCurrentUser] = useState(null);

      const getStorageKey = useCallback((buildingUid) => {
          if (!buildingUid) return null;
          return `contacts_building_${buildingUid}`;
      }, []);

      useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const parsedUser = JSON.parse(userStr);
            setCurrentUser(parsedUser);
          } catch (e) {
            console.error("Failed to parse user from localStorage for contacts", e);
          }
        }
      }, []);

      const loadContacts = useCallback(() => {
        if (!currentUser || !currentUser.buildingUid) {
          setIsLoading(false);
          return;
        }
        const storageKey = getStorageKey(currentUser.buildingUid);
        if (!storageKey) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
          const storedContacts = JSON.parse(localStorage.getItem(storageKey)) || [];
          setAllContacts(storedContacts);
        } catch (error) {
          console.error("Error loading contacts:", error);
          toast({ title: "Error loading contacts", variant: "destructive" });
        }
        setIsLoading(false);
      }, [currentUser, getStorageKey, toast]);

      useEffect(() => {
        if(currentUser) loadContacts();
      }, [currentUser, loadContacts]);

      const saveContacts = useCallback((updatedContacts) => {
        if (!currentUser || !currentUser.buildingUid) {
            toast({ title: "Error saving contacts", description: "User context not found.", variant: "destructive" });
            return;
        }
        const storageKey = getStorageKey(currentUser.buildingUid);
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(updatedContacts));
          setAllContacts(updatedContacts);
        }
      }, [currentUser, getStorageKey, toast]);
      
      const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setContactFormData(prev => ({ ...prev, [name]: value }));
      }, []);
      
      const handleCheckboxChange = useCallback((name, checked) => {
        setContactFormData(prev => ({ ...prev, [name]: checked }));
      }, []);

      const handleTagsChange = useCallback((newTags) => {
        setContactFormData(prev => ({ ...prev, tags: newTags }));
      }, []);

      const openFormDialog = (contact = null) => {
        if (contact) {
          setEditingContact(contact);
          setContactFormData({ ...defaultContactFormData, ...contact });
        } else {
          setEditingContact(null);
          setContactFormData({
            ...defaultContactFormData,
            ownerId: currentUser?.id || '',
            createdBy: currentUser?.id || '',
            buildingUid: currentUser?.buildingUid || '',
            unitId: currentUser?.unitId || '',
          });
        }
        setIsFormOpen(true);
      };

      const handleSubmit = () => {
        if (!contactFormData.firstName) {
          toast({ title: "Missing Field", description: "First Name / Service Name is required.", variant: "destructive" });
          return;
        }
        if (contactFormData.emailPrimary && !/\S+@\S+\.\S+/.test(contactFormData.emailPrimary)) {
          toast({ title: "Invalid Email", description: "Please enter a valid primary email address.", variant: "destructive" });
          return;
        }

        let updatedContacts;
        if (editingContact) {
          updatedContacts = allContacts.map(c => c.id === editingContact.id ? { ...contactFormData, id: editingContact.id, lastModified: new Date().toISOString() } : c);
          toast({ title: "Contact Updated", description: `${contactFormData.firstName} ${contactFormData.lastName || ''} has been updated.` });
        } else {
          const newContact = { ...contactFormData, id: `contact_${Date.now()}`, createdAt: new Date().toISOString() };
          updatedContacts = [...allContacts, newContact];
          toast({ title: "Contact Added", description: `${contactFormData.firstName} ${contactFormData.lastName || ''} has been added.` });
        }
        saveContacts(updatedContacts);
        setIsFormOpen(false);
      };

      const handleDelete = (contactId) => {
        const contactToDelete = allContacts.find(c => c.id === contactId);
        if (!contactToDelete) return;
        
        const canDelete = currentUser?.role === 'manager' || currentUser?.role === 'admin' || contactToDelete.ownerId === currentUser?.id;
        if (!canDelete) {
            toast({ title: "Permission Denied", description: "You can only delete contacts you have created.", variant: "destructive" });
            return;
        }

        if (window.confirm("Are you sure you want to delete this contact? This action cannot be undone.")) {
          saveContacts(allContacts.filter(c => c.id !== contactId));
          toast({ title: "Contact Deleted", variant: "destructive" });
        }
      };
      
      const requestSort = useCallback((key) => {
        setSortConfig(prev => {
          if (prev.key === key) {
            return { ...prev, direction: prev.direction === 'ascending' ? 'descending' : 'ascending' };
          }
          return { key, direction: 'descending' }; // Default to descending for new sort keys
        });
      }, []);

      const visibleContacts = useMemo(() => {
        if (!currentUser) return [];
        return allContacts.filter(contact => {
            if (currentUser.role === 'manager' || currentUser.role === 'admin') return true;
            if (contact.visibility === 'public') return true;
            if (contact.visibility === 'unit' && contact.unitId === currentUser.unitId) return true;
            if (contact.ownerId === currentUser.id) return true;
            return false;
        });
      }, [allContacts, currentUser]);

      const filteredAndSortedContacts = useMemo(() => {
          let items = [...visibleContacts];

          if (searchTerm) {
              const lowercasedTerm = searchTerm.toLowerCase();
              items = items.filter(contact => 
                  (contact.firstName?.toLowerCase().includes(lowercasedTerm)) ||
                  (contact.lastName?.toLowerCase().includes(lowercasedTerm)) ||
                  (contact.tags && contact.tags.some(tag => tag.toLowerCase().includes(lowercasedTerm))) ||
                  (contact.comments && contact.comments.some(comment => comment.comment.toLowerCase().includes(lowercasedTerm)))
              );
          }

          items.sort((a, b) => {
              const key = sortConfig.key;
              const direction = sortConfig.direction === 'ascending' ? 1 : -1;

              if (key === 'highest_rated') {
                  const avgRatingA = a.ratings?.length ? a.ratings.reduce((sum, r) => sum + r.rating, 0) / a.ratings.length : 0;
                  const avgRatingB = b.ratings?.length ? b.ratings.reduce((sum, r) => sum + r.rating, 0) / b.ratings.length : 0;
                  return (avgRatingA - avgRatingB) * direction;
              }
              if (key === 'most_shared') {
                  // This is a proxy for "used by", which is more relevant.
                  const usedA = a.usedBy?.length || 0;
                  const usedB = b.usedBy?.length || 0;
                  return (usedA - usedB) * direction;
              }
              if (key === 'recently_added') {
                  return (new Date(b.createdAt) - new Date(a.createdAt)) * (direction === -1 ? 1 : -1) ; // Inverse direction logic for date
              }
              // Default alphabetical sort
              const valA = a.lastName || '';
              const valB = b.lastName || '';
              return valA.localeCompare(valB) * direction;
          });

          return items;
      }, [visibleContacts, searchTerm, sortConfig]);

      const allTags = useMemo(() => {
        const tagSet = new Set();
        allContacts.forEach(contact => {
          if (contact.tags && Array.isArray(contact.tags)) {
            contact.tags.forEach(tag => tagSet.add(tag));
          }
        });
        return Array.from(tagSet).sort();
      }, [allContacts]);

      const handleContactUpdate = useCallback((updatedContact) => {
          const updatedContacts = allContacts.map(c => c.id === updatedContact.id ? updatedContact : c);
          saveContacts(updatedContacts);
      }, [allContacts, saveContacts]);

      const handleReportContact = useCallback((contactId, reason) => {
        const contactToReport = allContacts.find(c => c.id === contactId);
        if (!contactToReport || !currentUser) return;

        const newReport = {
            reportId: `report_${Date.now()}`,
            reportedByUserId: currentUser.id,
            reportedByUserName: currentUser.fullName,
            reason: reason,
            timestamp: new Date().toISOString(),
            status: 'open',
        };

        const updatedContact = {
            ...contactToReport,
            reports: [...(contactToReport.reports || []), newReport],
        };

        handleContactUpdate(updatedContact);

        // Simulate sending a message to admins/managers
        const buildingUid = currentUser.buildingUid;
        const messagesKey = `messages_${buildingUid}`;
        const messages = JSON.parse(localStorage.getItem(messagesKey)) || [];
        const reportMessage = {
            id: `msg_${Date.now()}`,
            senderId: 'system_notification',
            senderName: 'System Alert',
            receiverId: 'manager_group',
            subject: `Contact Reported: ${contactToReport.firstName}`,
            body: `Contact "${contactToReport.firstName} ${contactToReport.lastName || ''}" has been reported by ${currentUser.fullName}. Reason: "${reason}". Please review.`,
            timestamp: new Date().toISOString(),
            read: false,
            type: 'notification',
        };
        localStorage.setItem(messagesKey, JSON.stringify([...messages, reportMessage]));

        toast({
            title: "Contact Reported",
            description: "Thank you. The building manager has been notified.",
        });
    }, [allContacts, currentUser, handleContactUpdate, toast]);


      return {
        contacts: filteredAndSortedContacts,
        isLoading,
        isFormOpen, setIsFormOpen,
        editingContact,
        contactFormData, setContactFormData,
        searchTerm, setSearchTerm,
        sortConfig, requestSort,
        allTags,
        openFormDialog,
        handleSubmit,
        handleDelete,
        handleInputChange,
        handleCheckboxChange,
        handleTagsChange,
        handleContactUpdate,
        handleReportContact,
        currentUser
      };
    };