import React from 'react';
    import Layout from '@/components/Layout';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { FileClock, GitMerge, Tag, CheckCircle, AlertTriangle, PlusCircle } from 'lucide-react';
    import { motion } from 'framer-motion';

    const releaseNotesData = [
      {
        version: "1.2.0",
        date: "2025-05-20",
        title: "BMS & IoT Integration + Support Menu",
        type: "Feature",
        icon: <PlusCircle className="h-5 w-5 text-green-500" />,
        notes: [
          "Added new 'BMS & IoT Infrastructure' menu with HVAC controls (mock).",
          "Implemented 'Support & Help' dropdown in the header with links to Help Center, Support Status, System Updates, and Backup/Restore pages (placeholders).",
          "Fixed Building UID propagation issues in Manage Groups and Manage Devices.",
        ],
      },
      {
        version: "1.1.0",
        date: "2025-05-15",
        title: "Messaging & Unit Groups",
        type: "Feature",
        icon: <PlusCircle className="h-5 w-5 text-green-500" />,
        notes: [
          "Implemented 'Groups' feature within Manage Units for custom unit/resident grouping.",
          "Added 'Messages' section for managers/admins to chat with residents and groups.",
          "Added 'Messages' section for residents to chat with building management.",
          "Simulated real-time message updates using localStorage.",
        ],
      },
      {
        version: "1.0.5",
        date: "2025-05-10",
        title: "Device Management & Admin Enhancements",
        type: "Improvement",
        icon: <CheckCircle className="h-5 w-5 text-blue-500" />,
        notes: [
          "Added 'Manage Devices' page for linking intercom device models to doors.",
          "Refined admin permissions: Admins have view-only for Manage Residents.",
          "Added 'Visitors' management for residents.",
          "Fixed various UI bugs and navigation issues.",
        ],
      },
      {
        version: "1.0.0",
        date: "2025-04-25",
        title: "Initial Release",
        type: "Release",
        icon: <Tag className="h-5 w-5 text-purple-500" />,
        notes: [
          "Core Intercom System launched.",
          "Features: Manager & Resident Dashboards, Building Setup, Unit Management, Resident & Visitor Invitations, Door Management.",
          "Kiosk mode for building entry.",
          "Basic reporting and settings.",
        ],
      },
    ];

    const ReleaseNotesPage = () => {
      const [currentUser, setCurrentUser] = React.useState(null);
      React.useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) setCurrentUser(JSON.parse(userStr));
      }, []);
      const userRole = currentUser?.role || 'resident';

      return (
        <Layout role={userRole}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white flex items-center">
                  <FileClock className="mr-3 h-8 w-8 text-primary" /> Release Notes
                </h1>
                <p className="text-muted-foreground">Stay updated with the latest features, improvements, and fixes.</p>
              </div>
            </div>

            <div className="space-y-8">
              {releaseNotesData.map((release) => (
                <Card key={release.version} className="dark:bg-slate-800 shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="dark:text-white flex items-center">
                          {release.icon}
                          <span className="ml-2">Version {release.version} - {release.title}</span>
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">Released on: {release.date}</CardDescription>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        release.type === "Feature" ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" :
                        release.type === "Improvement" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" :
                        release.type === "Fix" ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" :
                        "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                      }`}>
                        {release.type}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground dark:text-gray-300">
                      {release.notes.map((note, index) => (
                        <li key={index}>{note}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </Layout>
      );
    };

    export default ReleaseNotesPage;