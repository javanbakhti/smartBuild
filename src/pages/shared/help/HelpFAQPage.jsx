import React from 'react';
    import Layout from '@/components/Layout';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { BookOpen, HelpCircle } from 'lucide-react';
    import { motion } from 'framer-motion';
    import {
      Accordion,
      AccordionContent,
      AccordionItem,
      AccordionTrigger,
    } from "@/components/ui/accordion"


    const faqs = [
      {
        question: "How do I reset my password?",
        answer: "You can reset your password by clicking the 'Forgot Password' link on the login page. Follow the instructions sent to your email.",
      },
      {
        question: "How can I invite a new resident?",
        answer: "If you are a Building Manager, navigate to 'Manage Residents' and click 'Invite New Resident'. Fill in their details and an invitation will be sent.",
      },
      {
        question: "What do I do if the Kiosk is not responding?",
        answer: "First, check if the Kiosk device has power and is connected to the internet. If issues persist, try restarting the device. If that doesn't help, contact support through the 'Contact Support' option in the Help Center.",
      },
      {
        question: "How do I add a temporary visitor?",
        answer: "Residents can add temporary visitors via their 'Visitors' menu. Managers/Admins can use the 'Manage Visitors' section. You'll typically need to provide the visitor's name, access duration, and optionally, a contact number.",
      },
      {
        question: "Where can I find my Building UID?",
        answer: "If you are a Building Manager, your Building UID (Serial Number) is displayed in the 'Building Setup' section of your dashboard.",
      }
    ];

    const HelpFAQPage = () => {
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
                  <BookOpen className="mr-3 h-8 w-8 text-primary" /> FAQs & Troubleshooting
                </h1>
                <p className="text-muted-foreground">Find answers to common questions and troubleshooting tips.</p>
              </div>
            </div>

            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center"><HelpCircle className="mr-2 h-5 w-5 text-blue-500"/>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem value={`item-${index}`} key={index} className="dark:border-slate-700">
                      <AccordionTrigger className="hover:no-underline text-left dark:text-gray-200 dark:hover:text-primary">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground dark:text-gray-400">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
            
            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white">Troubleshooting Tips</CardTitle>
                <CardDescription>General advice for common issues.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground dark:text-gray-300">
                <p><strong>Connectivity Issues:</strong> Ensure your device and the intercom system are connected to the internet. Check your router and network cables if applicable.</p>
                <p><strong>Login Problems:</strong> Double-check your email and password. Use the 'Forgot Password' link if needed. Ensure CAPS LOCK is off.</p>
                <p><strong>Slow Performance:</strong> Try clearing your browser cache and cookies. Ensure your browser is updated to the latest version.</p>
                <p><strong>Still Stuck?</strong> If these tips don't help, please use the 'Contact Support' option for further assistance.</p>
              </CardContent>
            </Card>

          </motion.div>
        </Layout>
      );
    };

    export default HelpFAQPage;