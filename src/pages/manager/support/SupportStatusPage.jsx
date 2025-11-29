import React, { useState, useEffect } from 'react';
    import Layout from '@/components/Layout';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { ShieldCheck, CalendarDays, AlertTriangle, ExternalLink, Info } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';

    const SupportStatusPage = () => {
      const { toast } = useToast();
      const [supportData, setSupportData] = useState(null);
      const [loading, setLoading] = useState(true);
      const [currentUser, setCurrentUser] = useState(null);

      useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setCurrentUser(user);
            // Simulate fetching support data based on Building UID
            if (user && user.buildingUid) {
                // In a real app, this would be an API call
                setTimeout(() => {
                    // Mock data - replace with actual logic if UID determines plan
                    const mockSupportPlans = {
                        "UID123-PREMIUM": { level: "Premium 24/7", startDate: "2024-01-15", expiryDate: "2026-01-14", features: ["24/7 Phone & Email", "Priority Response", "Dedicated Account Manager", "On-site (if applicable)"] },
                        "UID456-STANDARD": { level: "Standard Business Hours", startDate: "2024-03-01", expiryDate: "2025-02-28", features: ["Business Hours Email", "Knowledge Base Access", "Community Forum"] },
                    };
                    const buildingpecificPlan = mockSupportPlans[user.buildingUid] || mockSupportPlans["UID456-STANDARD"]; // Default to standard if UID not matched
                    
                    setSupportData(buildingpecificPlan);
                    setLoading(false);
                }, 1000);
            } else {
                setSupportData({ level: "Basic (Community Support)", startDate: "N/A", expiryDate: "N/A", features: ["Knowledge Base Access", "Community Forum Only"] });
                setLoading(false);
            }
        } else {
            setLoading(false); // No user, no specific support data
        }
      }, []);

      const handlePurchaseSupport = () => {
        // In a real app, this would redirect to support.ipfy.ca with UID prefill if possible
        window.open(`https://support.ipfy.ca?uid=${currentUser?.buildingUid || ''}&serial=${currentUser?.buildingUid || ''}`, '_blank');
        toast({
          title: "Redirecting to Purchase Support",
          description: "You will be redirected to support.ipfy.ca to manage your support plan.",
        });
      };

      return (
        <Layout role="manager">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white flex items-center">
                  <ShieldCheck className="mr-3 h-8 w-8 text-primary" /> Support Plan Status
                </h1>
                <p className="text-muted-foreground">View your current customer support agreement details.</p>
              </div>
            </div>

            {loading ? (
              <Card className="dark:bg-slate-800 shadow-lg">
                <CardContent className="pt-6 text-center text-muted-foreground">Loading support status...</CardContent>
              </Card>
            ) : !currentUser || !currentUser.buildingUid ? (
                 <Card className="bg-yellow-50 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700">
                    <CardHeader className="flex flex-row items-center space-x-3">
                    <Info className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
                    <div>
                        <CardTitle className="text-yellow-700 dark:text-yellow-300">Building Information Needed</CardTitle>
                        <CardDescription className="text-yellow-600 dark:text-yellow-400">
                        Building UID is required to fetch specific support plan details. Please ensure building setup is complete.
                        Displaying generic information.
                        </CardDescription>
                    </div>
                    </CardHeader>
                </Card>
            ) : supportData ? (
              <Card className="dark:bg-slate-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="dark:text-white">Your Support Plan: <span className="text-primary">{supportData.level}</span></CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Building UID: {currentUser.buildingUid}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <CalendarDays className="h-5 w-5 text-green-500" />
                      <span className="dark:text-gray-300">Start Date: <span className="font-medium">{supportData.startDate}</span></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CalendarDays className="h-5 w-5 text-red-500" />
                      <span className="dark:text-gray-300">Expiry Date: <span className="font-medium">{supportData.expiryDate}</span></span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 dark:text-gray-200">Features Included:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground dark:text-gray-400 space-y-1">
                      {supportData.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                  {supportData.expiryDate !== "N/A" && new Date(supportData.expiryDate) < new Date() && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <p className="text-sm text-red-700 dark:text-red-300">Your support plan has expired. Please renew to continue receiving dedicated support.</p>
                    </div>
                  )}
                  <div className="pt-4 border-t dark:border-slate-700">
                    <Button onClick={handlePurchaseSupport} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Manage or Purchase Support <ExternalLink className="ml-2 h-4 w-4"/>
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 dark:text-gray-500">
                      You will be redirected to support.ipfy.ca. Please have your Building UID/Serial Number ready.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="dark:bg-slate-800 shadow-lg">
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Could not load support information. Please try again later or contact support.
                </CardContent>
              </Card>
            )}
          </motion.div>
        </Layout>
      );
    };

    export default SupportStatusPage;