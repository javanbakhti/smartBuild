import React, { useState, useEffect, useCallback } from 'react';
    import Layout from '@/components/Layout';
    import { Button } from '@/components/ui/button';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import Breadcrumbs from '@/components/manager/system/backup/Breadcrumbs';
    import { UploadCloud, Save } from 'lucide-react';
    import BackupDestinations from '@/components/manager/system/backup/BackupDestinations';
    import BackupNotifications from '@/components/manager/system/backup/BackupNotifications';
    import BackupOptions from '@/components/manager/system/backup/BackupOptions';

    const BackupConfigurationPage = () => {
      const { toast } = useToast();
      
      const [backupSettings, setBackupSettings] = useState({
        autoBackupEnabled: false,
        schedules: [],
        destination: 'localStorage',
        destinationDetails: {
          localStorage: {},
          ftp: { host: '', port: '21', user: '', pass: '' },
          sftp: { host: '', port: '22', user: '', pass: '' },
          scp: { host: '', port: '22', user: '', pass: '', path: '' },
          fileSharing: { path: '', user: '', pass: '' },
          googleDrive: { folderId: '' },
          dropbox: { folderPath: '' },
          email: { address: '', subjectPrefix: '[Backup]' },
        },
        notificationsEnabled: false,
        notificationEmail: '',
        notifyOnSuccess: true,
        notifyOnFailure: true,
        retentionPolicyEnabled: false,
        retentionType: 'latestX', 
        retentionValue: 5, 
        encryptionEnabled: false,
        encryptionPassphrase: '',
      });

      const breadcrumbItems = [
        { name: 'Settings', link: '/manager/settings/general' },
        { name: 'System', link: '/manager/settings/system/updates' },
        { name: 'Backup & Restore', link: '/manager/settings/system/backup-restore' },
        { name: 'Backup Configuration' }
      ];

      const loadSettings = useCallback(() => {
        const storedSettings = JSON.parse(localStorage.getItem('backupSettingsV2'));
        if (storedSettings) {
          setBackupSettings(prev => ({...prev, ...storedSettings}));
        }
      }, []);

      useEffect(() => {
        loadSettings();
      }, [loadSettings]);

      const saveAllSettings = () => {
        localStorage.setItem('backupSettingsV2', JSON.stringify(backupSettings));
        toast({ title: 'Settings Saved', description: 'Backup configuration updated successfully.' });
      };

      return (
        <Layout role="manager">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8"
          >
            <Breadcrumbs items={breadcrumbItems} />
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white flex items-center">
                <UploadCloud className="mr-3 h-8 w-8 text-primary" /> System Backup Settings
              </h1>
              <p className="mt-2 text-muted-foreground">
                Configure backup destinations, schedules, retention, security, and notifications.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <BackupDestinations settings={backupSettings} setSettings={setBackupSettings} />
                <BackupNotifications settings={backupSettings} setSettings={setBackupSettings} />
              </div>

              <div className="lg:col-span-1 space-y-6">
                <BackupOptions settings={backupSettings} setSettings={setBackupSettings} />
              </div>
            </div>
            
            <div className="flex justify-end mt-8">
                <Button onClick={saveAllSettings} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                  <Save className="mr-2 h-4 w-4" /> Save All Settings
                </Button>
            </div>

          </motion.div>
        </Layout>
      );
    };

    export default BackupConfigurationPage;