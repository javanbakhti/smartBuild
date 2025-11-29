import React, { useState } from 'react';
    import Layout from '@/components/Layout';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Button } from '@/components/ui/button';
    import { Lock, ShieldCheck, FileText, KeyRound, Eye, EyeOff, Save } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { useToast } from '@/components/ui/use-toast';

    const PrivacySecurityPage = () => {
      const { toast } = useToast();
      const [currentPassword, setCurrentPassword] = useState('');
      const [newPassword, setNewPassword] = useState('');
      const [confirmNewPassword, setConfirmNewPassword] = useState('');
      const [showCurrentPassword, setShowCurrentPassword] = useState(false);
      const [showNewPassword, setShowNewPassword] = useState(false);
      const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
      const [isChangingPassword, setIsChangingPassword] = useState(false);

      const handleChangePassword = async (e) => {
        e.preventDefault();
        setIsChangingPassword(true);

        if (newPassword !== confirmNewPassword) {
          toast({
            title: "Error",
            description: "New passwords do not match.",
            variant: "destructive",
          });
          setIsChangingPassword(false);
          return;
        }

        if (newPassword.length < 8) {
            toast({
                title: "Error",
                description: "New password must be at least 8 characters long.",
                variant: "destructive",
            });
            setIsChangingPassword(false);
            return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));

        const user = JSON.parse(localStorage.getItem('user'));
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === user.id);

        if (userIndex === -1 || users[userIndex].password !== currentPassword) {
            toast({
                title: "Error",
                description: "Current password is incorrect.",
                variant: "destructive",
            });
        } else {
            users[userIndex].password = newPassword;
            localStorage.setItem('users', JSON.stringify(users));
            
            if (user.id === users[userIndex].id) {
                const updatedUser = {...user, password: newPassword }; // This is just for local state, password shouldn't be in user object in LS
                localStorage.setItem('user', JSON.stringify(updatedUser)); // Update current user session if needed
            }

            toast({
                title: "Success",
                description: "Password changed successfully. (Simulated)",
            });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        }
        setIsChangingPassword(false);
      };


      return (
        <Layout role="manager">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 max-w-3xl mx-auto"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white flex items-center">
                  <Lock className="mr-3 h-8 w-8 text-primary" /> Privacy & Security
                </h1>
                <p className="text-muted-foreground">Manage your account security and understand our data practices.</p>
              </div>
            </div>

            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center"><KeyRound className="mr-2 h-5 w-5 text-yellow-500"/>Change Password</CardTitle>
                <CardDescription>Update your account password regularly for better security.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword" className="text-muted-foreground dark:text-gray-300">Current Password</Label>
                    <div className="relative">
                      <Input 
                        id="currentPassword" 
                        type={showCurrentPassword ? "text" : "password"} 
                        value={currentPassword} 
                        onChange={(e) => setCurrentPassword(e.target.value)} 
                        required 
                        className="bg-background dark:bg-slate-700 border-input dark:border-slate-600"
                        disabled={isChangingPassword}
                      />
                      <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowCurrentPassword(!showCurrentPassword)} disabled={isChangingPassword}>
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="newPassword" className="text-muted-foreground dark:text-gray-300">New Password</Label>
                     <div className="relative">
                        <Input 
                            id="newPassword" 
                            type={showNewPassword ? "text" : "password"} 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            required 
                            className="bg-background dark:bg-slate-700 border-input dark:border-slate-600"
                            disabled={isChangingPassword}
                        />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowNewPassword(!showNewPassword)} disabled={isChangingPassword}>
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmNewPassword" className="text-muted-foreground dark:text-gray-300">Confirm New Password</Label>
                    <div className="relative">
                        <Input 
                            id="confirmNewPassword" 
                            type={showConfirmNewPassword ? "text" : "password"} 
                            value={confirmNewPassword} 
                            onChange={(e) => setConfirmNewPassword(e.target.value)} 
                            required 
                            className="bg-background dark:bg-slate-700 border-input dark:border-slate-600"
                            disabled={isChangingPassword}
                        />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} disabled={isChangingPassword}>
                            {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full sm:w-auto" disabled={isChangingPassword}>
                    {isChangingPassword ? "Changing..." : <><Save className="mr-2 h-4 w-4" /> Change Password</>}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-green-500"/>Our Commitment to Your Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground dark:text-gray-300">
                <p>At IPFy.ca Smart Intercom Systems, we are committed to protecting your privacy and ensuring the security of your data. This page outlines key aspects of our privacy and security policies.</p>
                <p>All data transmission between your devices and our system (when applicable, e.g., for cloud features not yet implemented) will use industry-standard encryption (e.g., TLS/SSL).</p>
                <p>Locally stored data (currently using browser localStorage for this demo) is sandboxed within your browser and not accessible by other websites. For production deployments with persistent cloud storage, robust database security measures are implemented.</p>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white">Data Handling</CardTitle>
                <CardDescription>How we manage and protect your information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground dark:text-gray-300">
                <p><strong>Data Collection:</strong> We collect only the necessary information to provide and improve our services. This includes user account details, building configuration, resident and visitor information, and system logs.</p>
                <p><strong>Data Usage:</strong> Your data is used solely for the operation of the intercom system, providing support, and, with your consent, for system improvement analytics (feature not yet implemented).</p>
                <p><strong>Data Retention:</strong> System logs and user data are retained as per configurable policies or legal requirements. (Currently, data persists in localStorage until cleared by user or logout action).</p>
                <p><strong>Third-Party Services:</strong> We may use third-party services for specific functionalities (e.g., email notifications - not yet implemented). We ensure these services adhere to strict privacy and security standards.</p>
              </CardContent>
            </Card>
            
            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white">Security Measures</CardTitle>
                <CardDescription>Steps taken to secure the system.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-muted-foreground dark:text-gray-300">
                <p><strong>Password Policies:</strong> We recommend using strong, unique passwords. Passwords (in this demo) are stored directly in localStorage. In a production system, they would be securely hashed and salted.</p>
                <p><strong>Access Control:</strong> Role-based access control ensures users only have access to features relevant to their roles (Manager, Admin, Resident).</p>
                <p><strong>Regular Audits:</strong> (For production systems) We would conduct regular security audits and penetration testing to identify and address potential vulnerabilities.</p>
                <p><strong>Software Updates:</strong> Keep your system software updated to benefit from the latest security patches and features. Check the 'System Updates' section regularly.</p>
              </CardContent>
            </Card>
            
            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center"><FileText className="mr-2 h-5 w-5 text-blue-500"/>Full Privacy Policy & Terms of Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground dark:text-gray-300">For detailed information, please refer to our official documents:</p>
                <div className="flex space-x-4">
                    <Button variant="link" asChild className="p-0 h-auto text-primary hover:underline">
                        <a href="https://ipfy.ca/privacy-policy" target="_blank" rel="noopener noreferrer">View Full Privacy Policy</a>
                    </Button>
                    <Button variant="link" asChild className="p-0 h-auto text-primary hover:underline">
                        <a href="https://ipfy.ca/terms-of-service" target="_blank" rel="noopener noreferrer">View Terms of Service</a>
                    </Button>
                </div>
                 <p className="text-xs text-muted-foreground mt-2 dark:text-gray-500">
                    Note: The links above are placeholders and lead to the main IPFy.ca site. Specific policy documents for this demo system are not available.
                </p>
              </CardContent>
            </Card>

          </motion.div>
        </Layout>
      );
    };

    export default PrivacySecurityPage;