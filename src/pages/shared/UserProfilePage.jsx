import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { User, Lock, LogOut } from 'lucide-react';
import AvatarSelection from '@/components/shared/AvatarSelection';

const UserProfilePage = ({ setUser: setAppUser }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({ fullName: '', avatarUrl: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      setFormData({ fullName: user.fullName || '', avatarUrl: user.avatarUrl || '' });
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (avatarUrl) => {
    setFormData(prev => ({ ...prev, avatarUrl }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      toast({ title: "Error", description: "Full name cannot be empty.", variant: "destructive" });
      return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const updatedUsers = users.map(u =>
      u.id === currentUser.id ? { ...u, fullName: formData.fullName, avatarUrl: formData.avatarUrl } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    const updatedCurrentUser = { ...currentUser, fullName: formData.fullName, avatarUrl: formData.avatarUrl };
    localStorage.setItem('user', JSON.stringify(updatedCurrentUser));
    setCurrentUser(updatedCurrentUser);
    setAppUser(updatedCurrentUser);

    toast({ title: "Success", description: "Your profile has been updated." });
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({ title: "Error", description: "New password must be at least 6 characters long.", variant: "destructive" });
      return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) {
      toast({ title: "Error", description: "User not found.", variant: "destructive" });
      return;
    }

    if (users[userIndex].password !== passwordData.currentPassword) {
      toast({ title: "Error", description: "Incorrect current password.", variant: "destructive" });
      return;
    }

    users[userIndex].password = passwordData.newPassword;
    localStorage.setItem('users', JSON.stringify(users));

    toast({ title: "Success", description: "Your password has been changed." });
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setAppUser(null);
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    navigate('/');
  };

  if (!currentUser) {
    return <Layout role="manager"><div className="text-center p-8">Loading...</div></Layout>;
  }

  const roleName = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);

  return (
    <Layout role={currentUser.role}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto p-4"
      >
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and security settings.</p>
        </header>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />Profile</TabsTrigger>
            <TabsTrigger value="security"><Lock className="mr-2 h-4 w-4" />Security</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <Card>
              <form onSubmit={handleProfileUpdate}>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your public information and avatar here.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <AvatarSelection
                    currentAvatar={formData.avatarUrl}
                    onAvatarChange={handleAvatarChange}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={currentUser.email} readOnly disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" value={roleName} readOnly disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">Save Changes</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          <TabsContent value="security">
            <Card>
              <form onSubmit={handlePasswordUpdate}>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Choose a strong, new password.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" name="currentPassword" type="password" value={passwordData.currentPassword} onChange={handlePasswordChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" name="newPassword" type="password" value={passwordData.newPassword} onChange={handlePasswordChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={handlePasswordChange} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">Update Password</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Log Out</CardTitle>
            <CardDescription>End your current session on this device.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Log Out
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </Layout>
  );
};

export default UserProfilePage;