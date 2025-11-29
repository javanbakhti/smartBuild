import React from 'react';
    import Layout from '@/components/Layout';
    import { Link } from 'react-router-dom';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { RefreshCw, DownloadCloud, History, Settings2 as UpdateSettingsIcon, ChevronRight } from 'lucide-react';
    import { motion } from 'framer-motion';
    import BreadcrumbsUpdates from '@/components/manager/system/updates/BreadcrumbsUpdates';

    const SystemUpdatesHubPage = () => {
      const breadcrumbItems = [
        { name: 'Settings', link: '/manager/settings/general' },
        { name: 'System', link: '/manager/settings/system/updates' },
        { name: 'Updates Hub' }
      ];

      const features = [
        {
          icon: <RefreshCw className="h-8 w-8 text-primary" />,
          title: 'Check for Updates',
          description: 'View current system version and check for new software or firmware updates.',
          link: '/manager/settings/system/updates/check',
          cta: 'Check Updates'
        },
        {
          icon: <DownloadCloud className="h-8 w-8 text-primary" />,
          title: 'Apply Updates',
          description: 'Apply downloaded updates to your system. Includes progress and confirmation.',
          link: '/manager/settings/system/updates/apply',
          cta: 'Apply Updates'
        },
        {
          icon: <History className="h-8 w-8 text-primary" />,
          title: 'Update History',
          description: 'View a log of all past updates, filter by type or status, and search entries.',
          link: '/manager/settings/system/updates/history',
          cta: 'View History'
        },
        {
          icon: <UpdateSettingsIcon className="h-8 w-8 text-primary" />,
          title: 'Update Settings',
          description: 'Configure automatic updates, schedules, and notification preferences.',
          link: '/manager/settings/system/updates/settings',
          cta: 'Configure Settings'
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
            <BreadcrumbsUpdates items={breadcrumbItems} />
            <div className="text-center mb-12">
              <RefreshCw className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-4xl font-bold tracking-tight text-gray-800 dark:text-white">System Updates</h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Keep your intercom system running smoothly and securely with the latest software and firmware.
                Manage, apply, and track updates all in one place.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
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

    export default SystemUpdatesHubPage;