import React, { useState, useEffect } from 'react';
    import Layout from '@/components/Layout';
    import { Button } from '@/components/ui/button';
    import { Save, Bell } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import KioskDisplaySettings from '@/components/resident/settings/KioskDisplaySettings';
    import DoNotDisturbSettings from '@/components/resident/settings/DoNotDisturbSettings';
    import NotificationPreferences from '@/components/resident/settings/NotificationPreferences';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';


    const ResidentSettings = () => {
      const { toast } = useToast();
      const [currentUser, setCurrentUser] = useState(null);
      const [loading, setLoading] = useState(true);

      const [kioskDisplayName, setKioskDisplayName] = useState('');
      
      const [dndEnabled, setDndEnabled] = useState(false);
      const [dndScheduleActive, setDndScheduleActive] = useState(false);
      const [dndWorkHoursStart1, setDndWorkHoursStart1] = useState("08:00");
      const [dndWorkHoursEnd1, setDndWorkHoursEnd1] = useState("12:00");
      const [dndWorkHoursStart2, setDndWorkHoursStart2] = useState("14:00");
      const [dndWorkHoursEnd2, setDndWorkHoursEnd2] = useState("18:00");
      const [dndNonWorkHourAction, setDndNonWorkHourAction] = useState("showDNDIcon");

      const [notificationConsent, setNotificationConsent] = useState(false);

      useEffect(() => {
        const loggedInUserString = localStorage.getItem('user');
        if (loggedInUserString) {
          try {
            const loggedInUser = JSON.parse(loggedInUserString);
            if (loggedInUser && loggedInUser.role === 'resident') {
              const residents = JSON.parse(localStorage.getItem('users')) || []; // Changed to 'users'
              const residentData = residents.find(r => r.id === loggedInUser.id && r.role === 'resident');
              
              if (residentData) {
                setCurrentUser(residentData);
                setKioskDisplayName(residentData.kioskDisplayName || residentData.fullName || '');
                
                const dnd = residentData.dndSettings || {};
                setDndEnabled(dnd.enabled || false);
                setDndScheduleActive(dnd.scheduleActive || false);
                setDndWorkHoursStart1(dnd.workHoursStart1 || "08:00");
                setDndWorkHoursEnd1(dnd.workHoursEnd1 || "12:00");
                setDndWorkHoursStart2(dnd.workHoursStart2 || "14:00");
                setDndWorkHoursEnd2(dnd.workHoursEnd2 || "18:00");
                setDndNonWorkHourAction(dnd.nonWorkHourAction || "showDNDIcon");
                setNotificationConsent(residentData.notificationConsent === null ? false : residentData.notificationConsent);
              } else {
                console.warn("Resident data not found in 'users' list for logged in user:", loggedInUser.id);
                toast({ title: "Error", description: "Could not load your detailed settings. Please try again.", variant: "destructive" });
              }
            } else {
               console.warn("User is not a resident or user data is malformed.");
            }
          } catch (error) {
            console.error("Error parsing user from localStorage:", error);
            toast({ title: "Error", description: "Session data corrupted. Please log out and log in again.", variant: "destructive" });
          }
        } else {
          console.warn("No user found in localStorage.");
        }
        setLoading(false);
      }, [toast]);

      const handleSaveSettings = () => {
        if (!currentUser) {
          toast({ title: "Error", description: "User data not available. Cannot save settings.", variant: "destructive" });
          return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const updatedUsers = users.map(u => {
          if (u.id === currentUser.id) {
            return {
              ...u,
              kioskDisplayName: kioskDisplayName || u.fullName,
              dndSettings: {
                enabled: dndEnabled,
                scheduleActive: dndScheduleActive,
                workHoursStart1: dndWorkHoursStart1,
                workHoursEnd1: dndWorkHoursEnd1,
                workHoursStart2: dndWorkHoursStart2,
                workHoursEnd2: dndWorkHoursEnd2,
                nonWorkHourAction: dndNonWorkHourAction,
              },
              notificationConsent: notificationConsent,
            };
          }
          return u;
        });
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        if (loggedInUser && loggedInUser.id === currentUser.id) {
            const updatedCurrentUserSession = {
                ...loggedInUser,
                kioskDisplayName: kioskDisplayName || loggedInUser.fullName,
                dndSettings: {
                    enabled: dndEnabled,
                    scheduleActive: dndScheduleActive,
                    workHoursStart1: dndWorkHoursStart1,
                    workHoursEnd1: dndWorkHoursEnd1,
                    workHoursStart2: dndWorkHoursStart2,
                    workHoursEnd2: dndWorkHoursEnd2,
                    nonWorkHourAction: dndNonWorkHourAction,
                },
                notificationConsent: notificationConsent,
            };
            localStorage.setItem('user', JSON.stringify(updatedCurrentUserSession));
            setCurrentUser(updatedCurrentUserSession); // Update local state for current user
        }

        toast({
          title: 'Settings Saved',
          description: 'Your preferences have been updated.',
        });
      };

      if (loading) {
        return (
          <Layout role="resident">
            <div className="text-center p-8">Loading your settings...</div>
          </Layout>
        );
      }

      if (!currentUser) {
        return (
          <Layout role="resident">
            <div className="text-center p-8">Could not load resident data. Please ensure you are logged in correctly or contact support.</div>
          </Layout>
        );
      }

      return (
        <Layout role="resident">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 max-w-3xl mx-auto p-4 md:p-0"
          >
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white">My Settings</h1>
              <p className="text-muted-foreground">Manage your Kiosk display, Do Not Disturb, and Notification preferences.</p>
            </div>

            <KioskDisplaySettings
              kioskDisplayName={kioskDisplayName}
              setKioskDisplayName={setKioskDisplayName}
              defaultFullName={currentUser.fullName}
            />

            <DoNotDisturbSettings
              dndEnabled={dndEnabled}
              setDndEnabled={setDndEnabled}
              dndScheduleActive={dndScheduleActive}
              setDndScheduleActive={setDndScheduleActive}
              dndWorkHoursStart1={dndWorkHoursStart1}
              setDndWorkHoursStart1={setDndWorkHoursStart1}
              dndWorkHoursEnd1={dndWorkHoursEnd1}
              setDndWorkHoursEnd1={setDndWorkHoursEnd1}
              dndWorkHoursStart2={dndWorkHoursStart2}
              setDndWorkHoursStart2={setDndWorkHoursStart2}
              dndWorkHoursEnd2={dndWorkHoursEnd2}
              setDndWorkHoursEnd2={setDndWorkHoursEnd2}
              dndNonWorkHourAction={dndNonWorkHourAction}
              setDndNonWorkHourAction={setDndNonWorkHourAction}
            />

            <NotificationPreferences
              notificationConsent={notificationConsent}
              setNotificationConsent={setNotificationConsent}
            />

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveSettings} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Save className="mr-2 h-5 w-5" /> Save My Settings
              </Button>
            </div>
          </motion.div>
        </Layout>
      );
    };

    export default ResidentSettings;