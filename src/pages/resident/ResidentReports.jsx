import React from 'react';
    import Layout from '@/components/Layout';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { FileText, Construction } from 'lucide-react';
    import { motion } from 'framer-motion';

    const ResidentReports = () => {
      return (
        <Layout role="resident">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 md:p-6 lg:p-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-800 dark:text-white flex items-center">
                  <FileText className="mr-3 h-8 w-8 text-primary" /> My Reports
                </h1>
                <p className="text-md md:text-lg text-muted-foreground">
                  View activity logs and other relevant reports for your unit.
                </p>
              </div>
            </div>

            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white">Reports Overview</CardTitle>
                <CardDescription>
                  This section will provide access to various reports related to your unit's activity, access logs, and more.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
                <Construction className="h-16 w-16 text-yellow-500 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Feature Coming Soon!</h2>
                <p className="text-muted-foreground">
                  We are working hard to bring you detailed reports. Please check back later.
                </p>
              </CardContent>
            </Card>

            {/* Placeholder for future report types */}
            {/* 
            <div className="grid gap-6 mt-8 md:grid-cols-2">
              <Card className="dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Access Log</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">View who accessed your unit and when (Coming Soon).</p>
                </CardContent>
              </Card>
              <Card className="dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Visitor History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Review past visitor entries and details (Coming Soon).</p>
                </CardContent>
              </Card>
            </div> 
            */}
          </motion.div>
        </Layout>
      );
    };

    export default ResidentReports;