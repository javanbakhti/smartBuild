import React, { useState, useEffect } from 'react';
    import { useNavigate, useLocation } from 'react-router-dom';
    import { useToast } from '@/components/ui/use-toast';
    import AppHeader from './layout/AppHeader';
    import Sidebar from './layout/Sidebar';
    import AppFooter from './layout/AppFooter';
    import BottomNavigation from './layout/BottomNavigation'; 
    import InteractiveGuide from '@/components/shared/InteractiveGuide'; 
    import PageTour from '@/components/shared/PageTour';
    import { useTour } from '@/contexts/TourContext';
    import { Button } from '@/components/ui/button';
    import { useLanguage } from '@/contexts/LanguageContext';
    import { MemberManagementProvider } from '@/contexts/MemberManagementContext';
    import { motion, AnimatePresence } from 'framer-motion';
    import { 
      Home, Shield, User, Users, Settings as SettingsIcon, Building, FileText, Tv2, DoorOpen, Grid3X3, 
      UserCog, UserPlus, HardDrive, MessageSquare, Thermometer, Lightbulb, Zap, BookUser,
      ShieldAlert as SecurityIconAlert, SprayCan, Video, Bell as BellIcon, X as XIcon,
      Globe, Palette, Lock, SlidersHorizontal, Briefcase, LifeBuoy, LogOut,
      BookOpen, Send as ContactIcon, FileClock, Info, RefreshCw, DownloadCloud, UploadCloud, History, DatabaseBackup,
      HelpCircle, LayoutDashboard, ArchiveRestore, Settings2, ShieldCheck, Phone
    } from 'lucide-react';

    const useWindowSize = () => {
      const [windowSize, setWindowSize] = useState({
        width: undefined,
        height: undefined,
      });

      useEffect(() => {
        function handleResize() {
          setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
          });
        }
        
        window.addEventListener("resize", handleResize);
        handleResize();
        
        return () => window.removeEventListener("resize", handleResize);
      }, []);
      return windowSize;
    }


    const Layout = ({ children, role }) => {
      const navigate = useNavigate();
      const location = useLocation();
      const { toast } = useToast();
      const { startTour: initiatePageTour, isTourActive } = useTour(); 
      const { t, currentLanguage } = useLanguage();
      const [darkMode, setDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : false;
      });
      const [currentUser, setCurrentUser] = useState(null);
      const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
      const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
      const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        const savedState = localStorage.getItem('sidebarCollapsed');
        return savedState ? JSON.parse(savedState) : false;
      });
      const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
      const [showTutorial, setShowTutorial] = useState(false);
      const { width } = useWindowSize();
      const isDesktop = width >= 1024;

      useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const parsedUser = JSON.parse(userStr);
            setCurrentUser(parsedUser);

            if (parsedUser.notificationConsent === null || parsedUser.notificationConsent === undefined) {
                const promptShown = sessionStorage.getItem('notificationPromptShown');
                if (!promptShown) {
                    setShowNotificationPrompt(true);
                }
            }

            if (parsedUser.role === 'manager' || parsedUser.role === 'admin') {
              const tutorialCompleted = localStorage.getItem(`tutorialCompleted_${parsedUser.id}`);
              const tutorialDeferred = sessionStorage.getItem('tutorialDeferred');
              if (!tutorialCompleted && !tutorialDeferred) {
                setShowTutorial(true);
              }
            }

            if (parsedUser.buildingUid) {
              const messages = JSON.parse(localStorage.getItem(`messages_${parsedUser.buildingUid}`)) || [];
              const unread = messages.some(msg => !msg.read && msg.receiverId === (parsedUser.role === 'manager' || parsedUser.role === 'admin' ? 'manager_group' : parsedUser.id));
              setHasUnreadMessages(unread);
            } else if (parsedUser.role === 'resident') {
                 const messages = JSON.parse(localStorage.getItem(`messages`)) || []; 
                 const unread = messages.some(msg => !msg.read && msg.receiverId === parsedUser.id);
                 setHasUnreadMessages(unread);
            }
          } catch (error) {
            console.error("Failed to parse user from localStorage in Layout:", error);
            localStorage.removeItem('user'); 
          }
        }
      }, [location.pathname]);

      useEffect(() => {
        if (darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
      }, [darkMode]);

      useEffect(() => {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed));
      }, [isSidebarCollapsed]);

      const toggleDarkMode = () => {
        setDarkMode(prevMode => !prevMode);
      };

      const toggleSidebarCollapse = () => {
        setIsSidebarCollapsed(prevState => !prevState);
      };

      const handleLogout = () => {
        const buildingUid = currentUser?.buildingUid;
        const residentId = currentUser?.id;

        localStorage.removeItem('user');
        localStorage.removeItem('buildingDetails');
        localStorage.removeItem('residents'); 
        localStorage.removeItem('visitors'); 
        localStorage.removeItem('kioskSettings');
        localStorage.removeItem('kioskAuthTime');
        localStorage.removeItem('doors');
        localStorage.removeItem('buildingUnits');
        localStorage.removeItem('buildingDevices'); 
        localStorage.removeItem('messages'); 
        localStorage.removeItem(`messages_${buildingUid}`); 
        localStorage.removeItem(`unitGroups_${buildingUid}`); 
        localStorage.removeItem('generalSystemSettings');
        localStorage.removeItem('languageTimezoneSettings');
        localStorage.removeItem('themeBrandingSettings');
        localStorage.removeItem('backupSettingsV2');
        localStorage.removeItem('systemBackups');
        localStorage.removeItem('dataRecoveryLog');
        localStorage.removeItem('updateSettings');
        localStorage.removeItem('updateHistory');
        localStorage.removeItem(`contacts_manager_${buildingUid}`);
        localStorage.removeItem(`contacts_resident_${residentId}`);
        
        if (buildingUid) {
          localStorage.removeItem(`buildingAdmins_${buildingUid}`);
          localStorage.removeItem(`buildingDevices_${buildingUid}`);
        }
        if (residentId) {
          localStorage.removeItem(`residentMembers_${residentId}`);
          localStorage.removeItem(`residentVisitors_${residentId}`); 
          localStorage.removeItem(`residentMemberRoles_${residentId}`);
        }
        
        toast({ title: t('logout'), description: t('loggedOutSuccessfully') || "You have been successfully logged out." });
        navigate('/');
        setIsMobileSidebarOpen(false);
      };

      const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
      };
      
      const closeMobileSidebar = () => {
        setIsMobileSidebarOpen(false);
      };

      const handleNotificationPermission = (allow) => {
        setShowNotificationPrompt(false);
        sessionStorage.setItem('notificationPromptShown', 'true');
        if (currentUser) {
            const updatedUser = { ...currentUser, notificationConsent: allow };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setCurrentUser(updatedUser); 

            const users = JSON.parse(localStorage.getItem('users')) || [];
            const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
            localStorage.setItem('users', JSON.stringify(updatedUsers));

            toast({
                title: "Notification Preference Saved",
                description: allow ? "Notifications enabled." : "Notifications disabled. You can change this in settings.",
            });
        }
      };
      
      const handleTutorialComplete = () => {
        if (currentUser) {
          localStorage.setItem(`tutorialCompleted_${currentUser.id}`, 'true');
        }
        setShowTutorial(false);
      };

      const handleTutorialShowLater = () => {
        setShowTutorial(false);
        sessionStorage.setItem('tutorialDeferred', 'true');
      };
      
      const handleRestartTutorial = () => {
        if (currentUser) {
          localStorage.removeItem(`tutorialCompleted_${currentUser.id}`);
          sessionStorage.removeItem('tutorialDeferred');
          setShowTutorial(true); 
        }
      };
      
      const buildingManagementNavItems = [
        { id: 'nav-building-setup', icon: <Building className="mr-2 h-4 w-4" />, text: 'Building Setup', path: '/manager/building-setup', pathPrefix: '/manager/building-setup' },
        { id: 'nav-manage-units', icon: <Grid3X3 className="mr-2 h-4 w-4" />, text: 'Manage Units', path: '/manager/manage-units', pathPrefix: '/manager/manage-units' },
        { id: 'nav-manage-doors', icon: <DoorOpen className="mr-2 h-4 w-4" />, text: 'Manage Doors', path: '/manager/manage-doors', pathPrefix: '/manager/manage-doors' },
        { id: 'nav-manage-devices', icon: <HardDrive className="mr-2 h-4 w-4" />, text: 'Manage Devices', path: '/manager/manage-devices', pathPrefix: '/manager/manage-devices' },
        { id: 'nav-manage-admins', icon: <UserCog className="mr-2 h-4 w-4" />, text: 'Manage Admins', path: '/manager/manage-admins', pathPrefix: '/manager/manage-admins', condition: currentUser?.role === 'manager' },
      ];

      const bmsNavItems = [
        { id: 'nav-bms-hvac', icon: <Thermometer className="mr-2 h-4 w-4" />, text: 'HVAC Control', path: '/manager/bms/hvac', pathPrefix: '/manager/bms/hvac' },
        { id: 'nav-bms-lighting', icon: <Lightbulb className="mr-2 h-4 w-4" />, text: 'Lighting Management', path: '#', disabled: true },
        { id: 'nav-bms-energy', icon: <Zap className="mr-2 h-4 w-4" />, text: 'Energy Monitoring', path: '#', disabled: true },
        { id: 'nav-bms-security', icon: <SecurityIconAlert className="mr-2 h-4 w-4" />, text: 'Security Systems', path: '#', disabled: true },
        { id: 'nav-bms-fire', icon: <SprayCan className="mr-2 h-4 w-4" />, text: 'Fire Safety', path: '#', disabled: true },
        { id: 'nav-bms-camera', icon: <Video className="mr-2 h-4 w-4" />, text: 'Camera & Surveillance', path: '#', disabled: true },
      ];
      
      const systemSubNavItems = [
        { type: 'subheader', key: 'subheader-updates', text: 'System Updates' },
        { id: 'nav-system-updates-hub', icon: <RefreshCw className="mr-2 h-4 w-4" />, text: 'Updates Hub', path: '/manager/settings/system/updates', pathPrefix: '/manager/settings/system/updates' },
        { type: 'separator', key: 'sep-updates-backup'},
        { type: 'subheader', key: 'subheader-backup-restore', text: 'Backup & Restore' },
        { id: 'nav-system-backup-restore-hub', icon: <ArchiveRestore className="mr-2 h-4 w-4" />, text: 'Backup & Restore Hub', path: '/manager/settings/system/backup-restore', pathPrefix: '/manager/settings/system/backup-restore' },
      ];

      const managerSettingsNavItems = [
        { id: 'nav-settings-general', icon: <SlidersHorizontal className="mr-2 h-4 w-4" />, text: 'General', path: '/manager/settings/general', pathPrefix: '/manager/settings/general' },
        { id: 'nav-settings-phone', icon: <Phone className="mr-2 h-4 w-4" />, text: 'Phone Settings', path: '/manager/settings/phone', pathPrefix: '/manager/settings/phone' },
        { id: 'nav-settings-language', icon: <Globe className="mr-2 h-4 w-4" />, text: 'Language & Time Zone', path: '/manager/settings/language-timezone', pathPrefix: '/manager/settings/language-timezone' },
        { id: 'nav-settings-privacy', icon: <Lock className="mr-2 h-4 w-4" />, text: 'Privacy & Security', path: '/manager/settings/privacy-security', pathPrefix: '/manager/settings/privacy-security' },
        { id: 'nav-settings-theme', icon: <Palette className="mr-2 h-4 w-4" />, text: 'Theme & Branding', path: '/manager/settings/theme-branding', pathPrefix: '/manager/settings/theme-branding' },
        { type: 'separator', key: 'sep-settings-system' },
        { 
          id: 'nav-system-accordion-nested',
          type: 'accordion', 
          icon: <Settings2 className="h-5 w-5" />, 
          text: 'System', 
          items: systemSubNavItems, 
          pathPrefix: '/manager/settings/system'
        },
      ];
      
      const helpPathPrefixToUse = role === 'manager' || role === 'admin' ? '/manager' : '/resident';
      const baseHelpAndSupportNavItems = [
        { id: 'nav-help-faq', icon: <BookOpen className="mr-2 h-4 w-4" />, textKey: 'faqsAndGuides', defaultText: 'FAQs & Guides', path: `${helpPathPrefixToUse}/help/faq` },
        { id: 'nav-help-contact', icon: <ContactIcon className="mr-2 h-4 w-4" />, textKey: 'contactSupport', defaultText: 'Contact Support', path: `${helpPathPrefixToUse}/help/contact` },
        { id: 'nav-help-release', icon: <FileClock className="mr-2 h-4 w-4" />, textKey: 'releaseNotes', defaultText: 'Release Notes', path: `${helpPathPrefixToUse}/help/release-notes` },
      ];
      
      let helpAndSupportNavItems = baseHelpAndSupportNavItems.map(item => ({
        ...item,
        text: t(item.textKey) || item.defaultText
      }));

      if (role === 'manager' || role === 'admin') {
        helpAndSupportNavItems.push(
          { type: 'separator', key: 'sep1'},
          { id: 'nav-support-status', icon: <Info className="mr-2 h-4 w-4" />, text: t('viewSupportStatus') || 'View Support Status', path: '/manager/support/status' },
          { type: 'separator', key: 'sep-tutorial'},
          { id: 'nav-restart-tutorial', icon: <HelpCircle className="mr-2 h-4 w-4" />, text: t('restartTutorial') || 'Restart Tutorial', path: '#', action: handleRestartTutorial }
        );
      }

      const managerNavItems = [
        { id: 'nav-dashboard', type: 'link', icon: <Home className="h-5 w-5" />, text: 'Dashboard', path: '/manager/dashboard' },
        { id: 'nav-building-management-accordion', type: 'accordion', icon: <Building className="h-5 w-5" />, text: 'Manage Building', items: buildingManagementNavItems, pathPrefix: '/manager/(building-setup|manage-units|manage-doors|manage-devices|manage-admins)' },
        { id: 'nav-manage-residents', type: 'link', icon: <Users className="h-5 w-5" />, text: 'Manage Residents', path: '/manager/manage-residents' },
        { id: 'nav-manage-visitors', type: 'link', icon: <User className="h-5 w-5" />, text: 'Manage Visitors', path: '/manager/manage-visitors' },
        { id: 'nav-contacts-manager', type: 'link', icon: <BookUser className="h-5 w-5" />, text: 'Contacts', path: '/manager/contacts' },
        { id: 'nav-bms-iot-accordion', type: 'accordion', icon: <SettingsIcon className="h-5 w-5" />, text: 'BMS & IoT', items: bmsNavItems, pathPrefix: '/manager/bms' },
        { id: 'nav-messages', type: 'link', icon: <MessageSquare className="h-5 w-5" />, text: 'Messages', path: '/manager/messages' },
        { id: 'nav-reports', type: 'link', icon: <FileText className="h-5 w-5" />, text: 'Reports', path: '/manager/generate-reports' },
        { id: 'nav-kiosk-settings', type: 'link', icon: <Tv2 className="h-5 w-5" />, text: 'Kiosk Settings', path: '/manager/kiosk-settings' },
        { id: 'nav-settings-accordion', type: 'accordion', icon: <SettingsIcon className="h-5 w-5" />, text: 'Settings', items: managerSettingsNavItems, pathPrefix: '/manager/settings' },
        { id: 'nav-support-accordion', type: 'accordion', icon: <LifeBuoy className="h-5 w-5" />, text: 'Support & Help', items: helpAndSupportNavItems, pathPrefix: helpPathPrefixToUse + '/help' },
      ];

      const residentNavItems = [
        { id: 'nav-resident-dashboard', type: 'link', icon: <LayoutDashboard className="h-5 w-5" />, text: t('dashboard'), path: '/resident/dashboard' },
        { id: 'nav-resident-members', type: 'link', icon: <Users className="h-5 w-5" />, text: t('members'), path: '/resident/members' },
        { id: 'nav-resident-roles', type: 'link', icon: <ShieldCheck className="h-5 w-5" />, text: t('rolesAndPermissions') || 'Roles & Permissions', path: '/resident/roles' },
        { id: 'nav-resident-visitors', type: 'link', icon: <UserPlus className="h-5 w-5" />, text: t('visitors'), path: '/resident/visitors' },
        { id: 'nav-contacts-resident', type: 'link', icon: <BookUser className="h-5 w-5" />, text: 'Contacts', path: '/resident/contacts' },
        { id: 'nav-resident-messages', type: 'link', icon: <MessageSquare className="h-5 w-5" />, text: 'messages', path: '/resident/messages' },
        { id: 'nav-resident-reports', type: 'link', icon: <FileText className="h-5 w-5" />, text: 'reports', path: '/resident/reports'},
        { id: 'nav-resident-phone-settings', type: 'link', icon: <Phone className="h-5 w-5" />, text: t('phoneSettings') || 'Phone Settings', path: '/resident/phone-settings' },
        { id: 'nav-resident-settings', type: 'link', icon: <SettingsIcon className="h-5 w-5" />, text: t('settings'), path: '/resident/settings' }, 
        { id: 'nav-resident-support-accordion', type: 'accordion', icon: <LifeBuoy className="h-5 w-5" />, text: t('supportHelp') || 'Support & Help', items: helpAndSupportNavItems , pathPrefix: helpPathPrefixToUse + '/help' },
      ];
      
      const bottomNavItemsForResident = [
        { id: 'bottom-nav-dashboard', icon: LayoutDashboard, textKey: 'dashboard', defaultText: 'Dashboard', path: '/resident/dashboard' },
        { id: 'bottom-nav-contacts', icon: BookUser, textKey: 'contacts', defaultText: 'Contacts', path: '/resident/contacts' },
        { id: 'bottom-nav-settings', icon: SettingsIcon, textKey: 'settings', defaultText: 'Settings', path: '/resident/settings' },
        { id: 'bottom-nav-messages', icon: MessageSquare, textKey: 'messages', defaultText: 'Messages', path: '/resident/messages' },
      ].map(item => ({...item, text: t(item.textKey) || item.defaultText}));

      const navItemsToDisplay = (role === 'manager' || role === 'admin') ? managerNavItems : residentNavItems;
      
      const mainContentPadding = !isDesktop ? '0rem' : (isSidebarCollapsed ? '5rem' : '16rem');

      const layoutContent = (
        <div className={`flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 ${role === 'resident' ? 'pb-16 lg:pb-0' : ''}`}>
          <AppHeader 
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            role={role}
            hasUnreadMessages={hasUnreadMessages}
            onToggleMobileSidebar={toggleMobileSidebar}
            user={currentUser}
            onLogout={handleLogout}
            isSidebarCollapsed={isSidebarCollapsed}
            toggleSidebarCollapse={toggleSidebarCollapse}
            isDesktop={isDesktop}
          />
          
          <div className="flex flex-1">
            {(role === 'manager' || role === 'admin' || role === 'resident') && (
              <Sidebar 
                navItems={navItemsToDisplay} 
                isMobileOpen={isMobileSidebarOpen}
                isCollapsed={isSidebarCollapsed}
                onCloseMobile={closeMobileSidebar}
                onLogoutClick={handleLogout}
                currentLanguage={currentLanguage}
                toggleCollapse={toggleSidebarCollapse}
                isDesktop={isDesktop}
              />
            )}
            <motion.main 
              className={`flex-1 transition-all duration-300 ease-in-out pt-16`}
              animate={{ paddingLeft: mainContentPadding }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="p-4 sm:p-6 lg:p-8 h-full">
                {children}
              </div>
            </motion.main>
          </div>

          {showNotificationPrompt && (
            <div className="fixed bottom-4 right-4 z-[100] p-4 bg-background dark:bg-slate-800 shadow-2xl rounded-lg border border-border dark:border-slate-700 max-w-sm">
                <div className="flex items-start">
                    <BellIcon className="h-6 w-6 text-primary mr-3 mt-1" />
                    <div className="flex-1">
                        <h4 className="font-semibold text-foreground dark:text-white">Stay Updated!</h4>
                        <p className="text-sm text-muted-foreground dark:text-gray-300 mt-1 mb-3">
                            Allow notifications to receive important updates and alerts from the system.
                        </p>
                        <div className="flex gap-2">
                            <Button onClick={() => handleNotificationPermission(true)} size="sm" className="flex-1">Allow</Button>
                            <Button onClick={() => handleNotificationPermission(false)} variant="outline" size="sm" className="flex-1">Later</Button>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setShowNotificationPrompt(false)} className="ml-2 -mt-2 -mr-2 h-7 w-7">
                        <XIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>
          )}
          
          {showTutorial && (currentUser?.role === 'manager' || currentUser?.role === 'admin') && (
            <InteractiveGuide 
              onComplete={handleTutorialComplete} 
              onShowLater={handleTutorialShowLater}
              navigate={navigate}
            />
          )}

          {isTourActive && <PageTour />}
          
          {(role === 'resident' || role === 'member') && <BottomNavigation navItems={bottomNavItemsForResident} />}
          <AppFooter />
        </div>
      );

      if (role === 'resident') {
        return (
          <MemberManagementProvider user={currentUser}>
            {layoutContent}
          </MemberManagementProvider>
        )
      }

      return layoutContent;
    };

    export default Layout;