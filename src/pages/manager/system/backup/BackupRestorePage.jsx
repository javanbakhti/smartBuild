import React from 'react';
    import Layout from '@/components/Layout';
    import { Link } from 'react-router-dom';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { UploadCloud, DownloadCloud, ShieldCheck, ArchiveRestore, ChevronRight } from 'lucide-react';
    import { motion } from 'framer-motion';
    import Breadcrumbs from '@/components/manager/system/backup/Breadcrumbs';

    const BackupRestorePage = () => {
      const breadcrumbItems = [
        { name: 'Settings', link: '/manager/settings/general' },
        { name: 'System', link: '/manager/settings/system/updates' },
        { name: 'Backup & Restore' }
      ];

      const features = [
        {
          icon: <UploadCloud className="h-8 w-8 text-primary" />,
          title: 'Backup Configuration',
          description: 'Create, manage, and schedule full or partial system backups.',
          link: '/manager/settings/system/backup-restore/configuration',
          cta: 'Configure Backups'
        },
        {
          icon: <DownloadCloud className="h-8 w-8 text-primary" />,
          title: 'Restore from Backup',
          description: 'Upload a backup file to restore your system to a previous state.',
          link: '/manager/settings/system/backup-restore/restore',
          cta: 'Restore System'
        },
        {
          icon: <ShieldCheck className="h-8 w-8 text-primary" />,
          title: 'Manage Data Recovery',
          description: 'Scan for and recover accidentally deleted items, and generate recovery logs.',
          link: '/manager/settings/system/backup-restore/recovery-management',
          cta: 'Manage Recovery'
        }
      ];

      return (
        <Layout role="manager">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8"
          >
            <Breadcrumbs items={breadcrumbItems} />
            <div className="text-center mb-12">
              <ArchiveRestore className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-4xl font-bold tracking-tight text-gray-800 dark:text-white">Backup & Restore Hub</h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Manage your system backups, perform restores, and recover data with full control and transparency.
                Regular backups are crucial for data safety. We recommend daily automated backups and manual backups before major system changes.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="h-full flex flex-col dark:bg-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="items-center text-center">
                      {feature.icon}
                      <CardTitle className="mt-4 dark:text-white">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow text-center">
                      <CardDescription>{feature.description}</CardDescription>
                    </CardContent>
                    <CardContent className="text-center">
                      <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Link to={feature.link}>
                          {feature.cta} <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Layout>
      );
    };

    export default BackupRestorePage;