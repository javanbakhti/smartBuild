import React, { Suspense, lazy, useEffect, useState } from 'react';
    import { BrowserRouter as Router, Routes, Route, Navigate, Outlet as RouterOutlet } from 'react-router-dom';
    import { Toaster } from '@/components/ui/toaster';
    import { useToast } from '@/components/ui/use-toast';
    import { Button } from '@/components/ui/button';
    import { Building } from 'lucide-react';
    import { LanguageProvider } from '@/contexts/LanguageContext';
    import KioskAuthGate from '@/pages/KioskAuthGate';
    import { TourProvider } from '@/contexts/TourContext';
    import { TooltipProvider } from '@/components/ui/tooltip';
    import { GlobalSearchProvider } from '@/contexts/GlobalSearchContext';
    import SearchResultsDialog from '@/components/shared/SearchResultsDialog';
    import { PermissionProvider } from '@/contexts/PermissionContext';

    const LandingPage = lazy(() => import('@/pages/LandingPage'));
    const ManagerLogin = lazy(() => import('@/pages/ManagerLogin'));
    const ManagerSignUp = lazy(() => import('@/pages/ManagerSignUp'));
    const AdminSignUp = lazy(() => import('@/pages/AdminSignUp'));
    const ResidentLogin = lazy(() => import('@/pages/ResidentLogin'));
    const ResidentSignUp = lazy(() => import('@/pages/ResidentSignUp'));
    const MemberSignUp = lazy(() => import('@/pages/MemberSignUp')); 
    const ManagerDashboard = lazy(() => import('@/pages/ManagerDashboard'));
    const ResidentDashboard = lazy(() => import('@/pages/ResidentDashboard'));
    const BuildingSetup = lazy(() => import('@/pages/manager/BuildingSetup'));
    const ManageUnits = lazy(() => import('@/pages/manager/ManageUnits'));
    const ManageResidents = lazy(() => import('@/pages/manager/ManageResidents'));
    const ManageAdmins = lazy(() => import('@/pages/manager/ManageAdmins'));
    const ManageVisitors = lazy(() => import('@/pages/manager/ManageVisitors'));
    const ManageDoors = lazy(() => import('@/pages/manager/ManageDoors'));
    const ManageDevices = lazy(() => import('@/pages/manager/ManageDevices'));
    const ManagerMessages = lazy(() => import('@/pages/manager/ManagerMessages'));
    const GenerateReports = lazy(() => import('@/pages/manager/GenerateReports'));
    const KioskSettings = lazy(() => import('@/pages/manager/KioskSettings'));
    const ManagerContactsPage = lazy(() => import('@/pages/manager/ManagerContactsPage'));
    const UserProfilePage = lazy(() => import('@/pages/shared/UserProfilePage'));

    const HVACControl = lazy(() => import('@/pages/manager/bms/HVACControl.jsx'));

    
    const HelpFAQPage = lazy(() => import('@/pages/shared/help/HelpFAQPage'));
    const ContactSupportPage = lazy(() => import('@/pages/shared/help/ContactSupportPage'));
    const ReleaseNotesPage = lazy(() => import('@/pages/shared/help/ReleaseNotesPage'));
    const SupportStatusPage = lazy(() => import('@/pages/manager/support/SupportStatusPage'));

    const SystemUpdatesHubPage = lazy(() => import('@/pages/manager/system/updates/SystemUpdatesHubPage'));
    const CheckForUpdatesPage = lazy(() => import('@/pages/manager/system/updates/CheckForUpdatesPage'));
    const ApplyUpdatesPage = lazy(() => import('@/pages/manager/system/updates/ApplyUpdatesPage'));
    const UpdateHistoryLogPage = lazy(() => import('@/pages/manager/system/updates/UpdateHistoryLogPage')); 
    const UpdateSettingsPage = lazy(() => import('@/pages/manager/system/updates/UpdateSettingsPage'));

    const BackupRestorePage = lazy(() => import('@/pages/manager/system/backup/BackupRestorePage'));
    const BackupConfigurationPage = lazy(() => import('@/pages/manager/system/backup/BackupConfigurationPage'));
    const RestoreBackupPage = lazy(() => import('@/pages/manager/system/backup/RestoreBackupPage'));
    const DataRecoveryManagementPage = lazy(() => import('@/pages/manager/system/backup/DataRecoveryManagementPage'));

    const GeneralSystemSettingsPage = lazy(() => import('@/pages/manager/settings/GeneralSystemSettingsPage'));
    const LanguageTimezonePage = lazy(() => import('@/pages/manager/settings/LanguageTimezonePage'));
    const PrivacySecurityPage = lazy(() => import('@/pages/manager/settings/PrivacySecurityPage'));
    const ThemeBrandingPage = lazy(() => import('@/pages/manager/settings/ThemeBrandingPage'));
    const PhoneSettingsPage = lazy(() => import('@/pages/manager/settings/PhoneSettingsPage'));

    const ResidentSettings = lazy(() => import('@/pages/resident/ResidentSettings'));
    const ResidentPhoneSettings = lazy(() => import('@/pages/resident/ResidentPhoneSettings'));
    const ResidentMembers = lazy(() => import('@/pages/resident/ResidentMembers'));
    const ResidentRoles = lazy(() => import('@/pages/resident/ResidentRoles'));
    const ResidentVisitors = lazy(() => import('@/pages/resident/ResidentVisitors'));
    const ResidentMessages = lazy(() => import('@/pages/resident/ResidentMessages'));
    const ResidentReports = lazy(() => import('@/pages/resident/ResidentReports')); 
    const ResidentContactsPage = lazy(() => import('@/pages/resident/ResidentContactsPage'));
    const CallPage = lazy(() => import('@/pages/CallPage'));
    const KioskPage = lazy(() => import('@/pages/KioskPage'));


    const LoadingFallback = () => (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700">
        <div className="text-center">
          <Building className="w-24 h-24 text-white animate-pulse mx-auto" />
          <p className="text-white text-2xl mt-4 font-semibold">Loading Intercom System...</p>
        </div>
      </div>
    );

    function App() {
      const { toast } = useToast();
      const [user, setUser] = useState(null);
      const [loadingSession, setLoadingSession] = useState(true);
      const [kioskAuthTime, setKioskAuthTime] = useState(null);

      const showPWAInstallPrompt = () => {
        toast({
          title: "Install App?",
          description: "Add this Intercom System to your home screen for easy access.",
          action: (
            <Button variant="outline" size="sm" onClick={() => alert("To install, tap 'Share' or 'Options' then 'Add to Home Screen'.")}>
              Learn More
            </Button>
          ),
        });
      };

      useEffect(() => {
        const fontAwesomeLink = document.createElement('link');
        fontAwesomeLink.rel = 'stylesheet';
        fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
        document.head.appendChild(fontAwesomeLink);

        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (navigator.standalone === false || (navigator.standalone === undefined && !isStandalone)) {
          setTimeout(showPWAInstallPrompt, 7000);
        }

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (e) {
            console.error("Failed to parse user from localStorage", e);
            localStorage.removeItem('user');
          }
        }
        
        const authTime = localStorage.getItem('kioskAuthTime');
        if (authTime) {
          setKioskAuthTime(parseInt(authTime, 10));
        }

        setLoadingSession(false);

        return () => {
            document.head.removeChild(fontAwesomeLink);
        }
      }, []);

      useEffect(() => {
        const checkInitialSupabaseConnection = async () => {
          console.log("Supabase is currently disconnected.");
        };

        if (!loadingSession) {
          // checkInitialSupabaseConnection(); 
        }
      }, [toast, loadingSession]);

      if (loadingSession) { 
        return <LoadingFallback />;
      }
      
      const KIOSK_AUTH_TIMEOUT = 30 * 60 * 1000; // 30 minutes

      return (
        <LanguageProvider>
          <Router>
            <GlobalSearchProvider>
              <TooltipProvider>
                <TourProvider>
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route 
                        path="/kiosk" 
                        element={
                          <KioskAuthGate 
                            setKioskAuthTime={setKioskAuthTime} 
                            kioskAuthTime={kioskAuthTime}
                            authTimeout={KIOSK_AUTH_TIMEOUT}
                          >
                            <KioskPage />
                          </KioskAuthGate>
                        } 
                      />
                      <Route path="/login/manager" element={!user || (user.role !== 'manager' && user.role !== 'admin') ? <ManagerLogin setUser={setUser} /> : <Navigate to="/manager/dashboard" />} />
                      <Route path="/signup/manager" element={!user || (user.role !== 'manager' && user.role !== 'admin') ? <ManagerSignUp setUser={setUser} /> : <Navigate to="/manager/dashboard" />} />
                      <Route path="/signup/admin" element={<AdminSignUp setUser={setUser} />} />
                      <Route path="/login/resident" element={!user || user.role !== 'resident' ? <ResidentLogin setUser={setUser} /> : <Navigate to="/resident/dashboard" />} />
                      <Route path="/signup/resident" element={!user || user.role !== 'resident' ? <ResidentSignUp setUser={setUser} /> : <Navigate to="/resident/dashboard" />} />
                      <Route path="/signup/member" element={!user || user.role !== 'member' ? <MemberSignUp setUser={setUser} /> : <Navigate to="/resident/dashboard" />} />
                      
                      <Route path="/manager" element={<AuthGuard user={user} role={['manager', 'admin']} />}>
                        <Route path="dashboard" element={<ManagerDashboard />} />
                        <Route path="building-setup" element={<BuildingSetup />} />
                        <Route path="manage-units" element={<ManageUnits />} />
                        <Route path="manage-residents" element={<ManageResidents user={user} />} />
                        <Route path="manage-admins" element={<ManageAdmins />} />
                        <Route path="manage-visitors" element={<ManageVisitors user={user} />} />
                        <Route path="contacts" element={<ManagerContactsPage />} />
                        <Route path="manage-doors" element={<ManageDoors />} />
                        <Route path="manage-devices" element={<ManageDevices />} />
                        <Route path="messages" element={<ManagerMessages />} />
                        <Route path="generate-reports" element={<GenerateReports />} />
                        <Route path="kiosk-settings" element={<KioskSettings />} />
                        <Route path="profile" element={<UserProfilePage setUser={setUser} />} />
                        <Route path="bms" element={<HVACControl />} />
                        <Route path="help/faq" element={<HelpFAQPage />} />
                        <Route path="help/contact" element={<ContactSupportPage />} />
                        <Route path="help/release-notes" element={<ReleaseNotesPage />} />
                        <Route path="support/status" element={<SupportStatusPage />} />
                        
                        <Route path="settings/general" element={<GeneralSystemSettingsPage />} />
                        <Route path="settings/language-timezone" element={<LanguageTimezonePage />} />
                        <Route path="settings/privacy-security" element={<PrivacySecurityPage />} />
                        <Route path="settings/theme-branding" element={<ThemeBrandingPage />} />
                        <Route path="settings/phone" element={<PhoneSettingsPage />} />
                        <Route path="settings/system/updates" element={<SystemUpdatesHubPage />} />
                        <Route path="settings/system/updates/check" element={<CheckForUpdatesPage />} />
                        <Route path="settings/system/updates/apply" element={<ApplyUpdatesPage />} />
                        <Route path="settings/system/updates/history" element={<UpdateHistoryLogPage />} />
                        <Route path="settings/system/updates/settings" element={<UpdateSettingsPage />} />
                        <Route path="settings/system/backup-restore" element={<BackupRestorePage />} />
                        <Route path="settings/system/backup-restore/configuration" element={<BackupConfigurationPage />} />
                        <Route path="settings/system/backup-restore/restore" element={<RestoreBackupPage />} />
                        <Route path="settings/system/backup-restore/recovery-management" element={<DataRecoveryManagementPage />} />
                      </Route>

                      <Route path="/resident" element={<AuthGuard user={user} role="resident" />}>
                        <Route path="dashboard" element={<ResidentDashboard />} />
                        <Route path="settings" element={<ResidentSettings />} /> 
                        <Route path="phone-settings" element={<ResidentPhoneSettings />} />
                        <Route path="members" element={<ResidentMembers />} />
                        <Route path="roles" element={<ResidentRoles />} />
                        <Route path="visitors" element={<ResidentVisitors />} />
                        <Route path="contacts" element={<ResidentContactsPage />} />
                        <Route path="messages" element={<ResidentMessages />} />
                        <Route path="reports" element={<ResidentReports />} /> 
                        <Route path="profile" element={<UserProfilePage setUser={setUser} />} />
                        <Route path="help/faq" element={<HelpFAQPage />} />
                        <Route path="help/contact" element={<ContactSupportPage />} />
                        <Route path="help/release-notes" element={<ReleaseNotesPage />} />
                      </Route>
                      
                      <Route path="/call/:unitId" element={<CallPage />} />

                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </Suspense>
                  <Toaster />
                  <SearchResultsDialog />
                </TourProvider>
              </TooltipProvider>
            </GlobalSearchProvider>
          </Router>
        </LanguageProvider>
      );
    }

    const AuthGuard = ({ user, role, children }) => {
      const rolesToCheck = Array.isArray(role) ? role : [role];
    
      if (!user) {
        const targetPath = rolesToCheck.includes('manager') || rolesToCheck.includes('admin') ? "/login/manager" : "/login/resident";
        return <Navigate to={targetPath} replace />;
      }
      
      const effectiveUserRole = user.role === 'member' ? 'resident' : user.role;

      if (!rolesToCheck.includes(effectiveUserRole)) {
        console.warn(`AuthGuard: User role mismatch. Expected one of: ${rolesToCheck.join(', ')}, Actual: ${user.role} (effective: ${effectiveUserRole}). Redirecting.`);
        if (user.role === 'manager' || user.role === 'admin') return <Navigate to="/manager/dashboard" replace />;
        if (user.role === 'resident' || user.role === 'member') return <Navigate to="/resident/dashboard" replace />;
        localStorage.removeItem('user'); 
        return <Navigate to="/" replace />;
      }
      
      const outlet = children ? children : <RouterOutlet />;

      if (rolesToCheck.includes('manager') || rolesToCheck.includes('admin')) {
        return <PermissionProvider user={user}>{outlet}</PermissionProvider>;
      }

      return outlet;
    };

    export default App;