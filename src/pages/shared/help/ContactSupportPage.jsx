import React, { useState, useEffect, useCallback } from 'react';
    import Layout from '@/components/Layout';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';
    import { Send, Mail, Phone, MessageSquare } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';

    const ContactSupportPage = () => {
      const { toast } = useToast();
      const [currentUser, setCurrentUser] = useState(null);
      const [formValues, setFormValues] = useState({
        name: '',
        email: '',
        buildingUid: '',
        subject: '',
        message: ''
      });

      const loadInitialData = useCallback(() => {
        const userStr = localStorage.getItem('user');
        let user = null;
        if (userStr) {
          user = JSON.parse(userStr);
          setCurrentUser(user);
        }

        const generalSettingsStr = localStorage.getItem('generalSystemSettings');
        let generalSettings = {};
        if (generalSettingsStr) {
          generalSettings = JSON.parse(generalSettingsStr);
        }
        
        setFormValues(prev => ({
          ...prev,
          name: user?.fullName || generalSettings?.contactName || '',
          email: user?.email || generalSettings?.contactEmail || '',
          buildingUid: user?.buildingUid || generalSettings?.systemName || '' 
        }));

      }, []);

      useEffect(() => {
        loadInitialData();
      }, [loadInitialData]);
      
      const userRole = currentUser?.role || 'resident';

      const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormValues(prev => ({ ...prev, [id]: value }));
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        if (!formValues.name || !formValues.email || !formValues.subject || !formValues.message) {
            toast({
                title: "Missing Fields",
                description: "Please fill out all required fields.",
                variant: "destructive",
            });
            return;
        }
        toast({
          title: "Message Sent (Simulated)",
          description: "Your support request has been submitted. We will get back to you shortly. (This is a demo, no actual email sent).",
        });
        setFormValues(prev => ({
            ...prev,
            subject: '',
            message: ''
        }));
      };

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
                  <Send className="mr-3 h-8 w-8 text-primary" /> Contact Support
                </h1>
                <p className="text-muted-foreground">Get in touch with our support team for assistance.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="dark:bg-slate-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="dark:text-white flex items-center"><MessageSquare className="mr-2 h-5 w-5 text-green-500"/>Send Us a Message</CardTitle>
                  <CardDescription>Fill out the form below to submit your query.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="dark:text-gray-300">Full Name</Label>
                      <Input id="name" type="text" placeholder="Your Name" value={formValues.name} onChange={handleInputChange} required className="dark:bg-slate-700 dark:text-white dark:border-slate-600"/>
                    </div>
                    <div>
                      <Label htmlFor="email" className="dark:text-gray-300">Email Address</Label>
                      <Input id="email" type="email" placeholder="your@email.com" value={formValues.email} onChange={handleInputChange} required className="dark:bg-slate-700 dark:text-white dark:border-slate-600"/>
                    </div>
                     {(currentUser?.role === 'manager' || currentUser?.role === 'admin') && formValues.buildingUid && (
                        <div>
                            <Label htmlFor="buildingUid" className="dark:text-gray-300">Building UID / System Name</Label>
                            <Input id="buildingUid" type="text" value={formValues.buildingUid} readOnly className="dark:bg-slate-700 dark:text-white dark:border-slate-600 opacity-70"/>
                        </div>
                     )}
                    <div>
                      <Label htmlFor="subject" className="dark:text-gray-300">Subject</Label>
                      <Input id="subject" type="text" placeholder="Briefly describe your issue" value={formValues.subject} onChange={handleInputChange} required className="dark:bg-slate-700 dark:text-white dark:border-slate-600"/>
                    </div>
                    <div>
                      <Label htmlFor="message" className="dark:text-gray-300">Message</Label>
                      <Textarea id="message" placeholder="Describe your issue in detail..." value={formValues.message} onChange={handleInputChange} required rows={5} className="dark:bg-slate-700 dark:text-white dark:border-slate-600"/>
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Send className="mr-2 h-4 w-4"/> Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="dark:bg-slate-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="dark:text-white">Other Ways to Reach Us</CardTitle>
                  <CardDescription>Alternative contact methods.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold dark:text-gray-200">Email Support</h3>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">support@ipfy.ca (Expect a reply within 24 hours)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Phone className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold dark:text-gray-200">Phone Support (Premium Only)</h3>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">Check your support agreement for the direct line. (Mon-Fri, 9 AM - 5 PM EST)</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t dark:border-slate-700">
                     <h3 className="font-semibold dark:text-gray-200 mb-2">For Sales Inquiries:</h3>
                     <p className="text-sm text-muted-foreground dark:text-gray-400">Please visit <a href="https://ipfy.ca" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ipfy.ca</a> or email sales@ipfy.ca.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </Layout>
      );
    };

    export default ContactSupportPage;