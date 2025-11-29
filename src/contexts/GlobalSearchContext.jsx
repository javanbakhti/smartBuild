import React, { createContext, useContext, useState, useCallback } from 'react';
    import { useToast } from '@/components/ui/use-toast';
    import { useNavigate } from 'react-router-dom';

    const GlobalSearchContext = createContext();

    export const useGlobalSearch = () => useContext(GlobalSearchContext);

    const NAV_ITEMS_SEARCHABLE = [
      // Manager Routes
      { name: 'Manager Dashboard', path: '/manager/dashboard', keywords: ['dashboard', 'home', 'overview', 'manager'], role: ['manager', 'admin'] },
      { name: 'Building Setup', path: '/manager/building-setup', keywords: ['building', 'setup', 'configuration', 'floors', 'units per floor'], role: ['manager', 'admin'] },
      { name: 'Manage Units', path: '/manager/manage-units', keywords: ['units', 'floors', 'apartments', 'manage units', 'groups', 'common areas'], role: ['manager', 'admin'] },
      { name: 'Manage Residents', path: '/manager/manage-residents', keywords: ['residents', 'tenants', 'users', 'manage residents'], role: ['manager', 'admin'] },
      { name: 'Manage Admins', path: '/manager/manage-admins', keywords: ['admins', 'administrators', 'staff', 'manage admins'], role: ['manager'] },
      { name: 'Manage Visitors (Manager)', path: '/manager/manage-visitors', keywords: ['visitors', 'guests', 'manager visitors'], role: ['manager', 'admin'] },
      { name: 'Manage Doors', path: '/manager/manage-doors', keywords: ['doors', 'access points', 'entrances', 'manage doors'], role: ['manager', 'admin'] },
      { name: 'Manage Devices', path: '/manager/manage-devices', keywords: ['devices', 'hardware', 'intercoms', 'readers', 'manage devices'], role: ['manager', 'admin'] },
      { name: 'Manager Messages', path: '/manager/messages', keywords: ['messages', 'chat', 'communication', 'manager messages'], role: ['manager', 'admin'] },
      { name: 'Generate Reports', path: '/manager/generate-reports', keywords: ['reports', 'analytics', 'logs', 'generate reports'], role: ['manager', 'admin'] },
      { name: 'Kiosk Settings', path: '/manager/kiosk-settings', keywords: ['kiosk', 'terminal', 'display settings', 'kiosk settings'], role: ['manager', 'admin'] },
      { name: 'HVAC Control', path: '/manager/bms/hvac', keywords: ['hvac', 'climate', 'temperature', 'bms', 'iot'], role: ['manager', 'admin'] },
      { name: 'General Settings', path: '/manager/settings/general', keywords: ['general settings', 'system settings', 'configuration'], role: ['manager', 'admin'] },
      { name: 'Language & Time Zone Settings', path: '/manager/settings/language-timezone', keywords: ['language', 'timezone', 'localization'], role: ['manager', 'admin'] },
      { name: 'Privacy & Security Settings', path: '/manager/settings/privacy-security', keywords: ['privacy', 'security', 'password', 'data'], role: ['manager', 'admin'] },
      { name: 'Theme & Branding Settings', path: '/manager/settings/theme-branding', keywords: ['theme', 'branding', 'logo', 'appearance'], role: ['manager', 'admin'] },
      { name: 'System Updates Hub', path: '/manager/system/updates', keywords: ['updates', 'software', 'firmware', 'system updates'], role: ['manager', 'admin'] },
      { name: 'Backup & Restore Hub', path: '/manager/system/backup-restore', keywords: ['backup', 'restore', 'data protection'], role: ['manager', 'admin'] },
      
      // Resident Routes
      { name: 'Resident Dashboard', path: '/resident/dashboard', keywords: ['dashboard', 'home', 'overview', 'resident'], role: ['resident', 'member'] },
      { name: 'My Members', path: '/resident/members', keywords: ['members', 'household', 'family', 'my members'], role: ['resident'] },
      { name: 'My Visitors (Resident)', path: '/resident/visitors', keywords: ['visitors', 'guests', 'my visitors', 'resident visitors'], role: ['resident'] },
      { name: 'Resident Messages', path: '/resident/messages', keywords: ['messages', 'chat', 'communication', 'resident messages'], role: ['resident', 'member'] },
      { name: 'Resident Reports', path: '/resident/reports', keywords: ['reports', 'activity', 'resident reports'], role: ['resident', 'member'] },
      { name: 'Resident Settings', path: '/resident/settings', keywords: ['settings', 'preferences', 'profile', 'resident settings'], role: ['resident', 'member'] },

      // Shared Help Routes
      { name: 'FAQs & Guides', path: '/help/faq', keywords: ['faq', 'help', 'guides', 'support'], role: ['manager', 'admin', 'resident', 'member'] },
      { name: 'Contact Support', path: '/help/contact', keywords: ['contact', 'support', 'assistance'], role: ['manager', 'admin', 'resident', 'member'] },
      { name: 'Release Notes', path: '/help/release-notes', keywords: ['release notes', 'updates', 'changelog'], role: ['manager', 'admin', 'resident', 'member'] },
    ];


    export const GlobalSearchProvider = ({ children }) => {
      const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(false);
      const [searchTerm, setSearchTermState] = useState('');
      const [searchResults, setSearchResults] = useState([]);
      const [isLoadingSearch, setIsLoadingSearch] = useState(false);
      const { toast } = useToast();
      const navigate = useNavigate();

      const performSearch = useCallback(async (term) => {
        if (!term.trim()) {
          setSearchResults([]);
          setIsSearchResultsOpen(false);
          return;
        }
        
        setSearchTermState(term);
        setIsLoadingSearch(true);
        setIsSearchResultsOpen(true);
        
        // Simulate API delay for better UX
        await new Promise(resolve => setTimeout(resolve, 300));

        const results = [];
        const lowerTerm = term.toLowerCase();
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const currentUserRole = currentUser?.role;
        const currentUserId = currentUser?.id;
        const buildingUid = currentUser?.buildingUid;

        // 1. Search Doors (Manager/Admin)
        if (currentUserRole === 'manager' || currentUserRole === 'admin') {
          const doors = JSON.parse(localStorage.getItem('doors')) || [];
          doors.forEach(door => {
            if (door.name.toLowerCase().includes(lowerTerm) || (door.location && door.location.toLowerCase().includes(lowerTerm))) {
              results.push({
                id: `door-${door.id}`,
                type: 'Door',
                name: door.name,
                description: door.location || 'No location specified',
                path: '/manager/manage-doors',
                data: door,
              });
            }
          });
        }

        // 2. Search Residents (Manager/Admin)
        if (currentUserRole === 'manager' || currentUserRole === 'admin') {
          const users = JSON.parse(localStorage.getItem('users')) || [];
          users.filter(u => u.role === 'resident' && u.buildingUid === buildingUid).forEach(resident => {
            if (
              resident.fullName.toLowerCase().includes(lowerTerm) ||
              resident.email.toLowerCase().includes(lowerTerm) ||
              (resident.unitNumber && resident.unitNumber.toLowerCase().includes(lowerTerm)) ||
              (resident.nickname && resident.nickname.toLowerCase().includes(lowerTerm))
            ) {
              results.push({
                id: `resident-${resident.id}`,
                type: 'Resident',
                name: resident.fullName,
                description: `Unit ${resident.unitNumber || 'N/A'} - ${resident.email}`,
                path: '/manager/manage-residents', 
                data: resident,
              });
            }
          });
        }
        
        // 3. Search Visitors (Manager/Admin)
        if (currentUserRole === 'manager' || currentUserRole === 'admin') {
          const managerVisitors = JSON.parse(localStorage.getItem('visitors')) || [];
           managerVisitors.filter(v => v.buildingUid === buildingUid).forEach(visitor => {
            if (
              visitor.name.toLowerCase().includes(lowerTerm) ||
              (visitor.unitNumber && visitor.unitNumber.toLowerCase().includes(lowerTerm)) ||
              (visitor.companyName && visitor.companyName.toLowerCase().includes(lowerTerm))
            ) {
              results.push({
                id: `m-visitor-${visitor.id}`,
                type: 'Manager Visitor',
                name: visitor.name,
                description: `To Unit ${visitor.unitNumber || 'N/A'} - ${visitor.companyName || 'No company'}`,
                path: '/manager/manage-visitors',
                data: visitor,
              });
            }
          });
        }

        // 4. Search Resident's Visitors (Resident)
        if (currentUserRole === 'resident' && currentUserId) {
          const residentVisitors = JSON.parse(localStorage.getItem(`residentVisitors_${currentUserId}_${buildingUid}`)) || [];
          residentVisitors.forEach(visitor => {
            if (
              visitor.name.toLowerCase().includes(lowerTerm) ||
              (visitor.companyName && visitor.companyName.toLowerCase().includes(lowerTerm))
            ) {
              results.push({
                id: `r-visitor-${visitor.id}`,
                type: 'My Visitor',
                name: visitor.name,
                description: visitor.companyName || 'Personal Visitor',
                path: '/resident/visitors',
                data: visitor,
              });
            }
          });
        }
        
        // 5. Search Resident's Members (Resident)
        if (currentUserRole === 'resident' && currentUserId) {
          const residentMembers = JSON.parse(localStorage.getItem(`residentMembers_${currentUserId}`)) || [];
          residentMembers.forEach(member => {
            if (
              member.fullName.toLowerCase().includes(lowerTerm) ||
              member.email.toLowerCase().includes(lowerTerm) ||
              (member.nickname && member.nickname.toLowerCase().includes(lowerTerm))
            ) {
              results.push({
                id: `member-${member.id}`,
                type: 'My Member',
                name: member.fullName,
                description: member.email,
                path: '/resident/members',
                data: member,
              });
            }
          });
        }

        // 6. Search Navigable Pages
        NAV_ITEMS_SEARCHABLE.forEach(item => {
          if (item.role.includes(currentUserRole) && (item.name.toLowerCase().includes(lowerTerm) || item.keywords.some(kw => kw.toLowerCase().includes(lowerTerm)))) {
            // Ensure help paths are correctly prefixed
            const itemPath = item.path.startsWith('/help/') ? `/${currentUserRole}${item.path}` : item.path;
            results.push({
              id: `nav-${item.name.replace(/\s+/g, '-').toLowerCase()}`,
              type: 'Page',
              name: item.name,
              description: `Navigate to ${item.name}`,
              path: itemPath,
              action: () => {
                navigate(itemPath);
                setIsSearchResultsOpen(false);
              }
            });
          }
        });
        
        // Deduplicate results by ID (preferring non-page items if names clash)
        const uniqueResults = [];
        const seenIds = new Set();
        results.sort((a, b) => (a.type === 'Page' ? 1 : -1)); // Prioritize data over pages
        for (const result of results) {
            if (!seenIds.has(result.id)) {
                uniqueResults.push(result);
                seenIds.add(result.id);
            }
        }


        setSearchResults(uniqueResults);
        setIsLoadingSearch(false);

        if (uniqueResults.length === 0) {
          toast({
            title: 'No Results',
            description: `No items found matching "${term}".`,
            duration: 3000,
          });
        }
      }, [toast, navigate]);

      const closeSearchResults = () => {
        setIsSearchResultsOpen(false);
        setSearchResults([]);
        // setSearchTermState(''); // Optionally clear search term on close
      };

      const value = {
        isSearchResultsOpen,
        searchTerm,
        searchResults,
        isLoadingSearch,
        performSearch,
        closeSearchResults,
        setSearchTermState, // Expose this to allow AppHeader to update it
      };

      return (
        <GlobalSearchContext.Provider value={value}>
          {children}
        </GlobalSearchContext.Provider>
      );
    };