import React, { useState, useEffect, useCallback } from 'react';
    import Layout from '@/components/Layout';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Switch } from '@/components/ui/switch';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { Phone, Save, KeyRound, Rss, Server, User, Lock } from 'lucide-react';

    const PhoneSettingsPage = () => {
      const { toast } = useToast();
      const [settings, setSettings] = useState({
        dtmfKey: '9',
        sipEnabled: false,
        sipType: 'credentials', // 'credentials' or 'ip'
        sipUsername: '',
        sipPassword: '',
        sipIpAddress: '',
        sipPhoneNumber: '',
      });

      const loadSettings = useCallback(() => {
        const storedSettings = localStorage.getItem('managerPhoneSettings');
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
      }, []);

      useEffect(() => {
        loadSettings();
      }, [loadSettings]);

      const handleInputChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
      };

      const handleSaveSettings = () => {
        localStorage.setItem('managerPhoneSettings', JSON.stringify(settings));
        toast({
          title: 'Phone Settings Saved',
          description: 'Your phone system configurations have been updated successfully.',
        });
      };

      return (
        <Layout role="manager">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 max-w-4xl mx-auto"
          >
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white flex items-center">
                <Phone className="mr-3 h-8 w-8 text-primary" /> Phone Settings
              </h1>
              <p className="text-muted-foreground">Configure system-wide phone call settings, including DTMF and SIP trunking.</p>
            </div>

            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center"><KeyRound className="mr-2 h-5 w-5 text-yellow-500"/>DTMF Unlock Settings</CardTitle>
                <CardDescription>Define the key residents press to unlock the door during a call.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-w-xs">
                  <Label htmlFor="dtmfKey" className="text-muted-foreground dark:text-gray-300">Unlock Key</Label>
                  <Input
                    id="dtmfKey"
                    value={settings.dtmfKey}
                    onChange={(e) => handleInputChange('dtmfKey', e.target.value)}
                    maxLength="1"
                    className="bg-background dark:bg-slate-700 border-input dark:border-slate-600"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Default is '9'.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center"><Rss className="mr-2 h-5 w-5 text-blue-500"/>SIP Trunk Configuration</CardTitle>
                <CardDescription>Optionally enable and configure a secondary SIP trunk for IP-based calls.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border dark:border-slate-700 rounded-lg">
                  <Label htmlFor="sipEnabled" className="text-base dark:text-gray-200">Enable SIP Trunking</Label>
                  <Switch
                    id="sipEnabled"
                    checked={settings.sipEnabled}
                    onCheckedChange={(value) => handleInputChange('sipEnabled', value)}
                  />
                </div>

                {settings.sipEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 p-4 border dark:border-slate-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Label className="dark:text-gray-300">Connection Type:</Label>
                      <Button
                        type="button"
                        variant={settings.sipType === 'credentials' ? 'default' : 'outline'}
                        onClick={() => handleInputChange('sipType', 'credentials')}
                      >
                        Credentials
                      </Button>
                      <Button
                        type="button"
                        variant={settings.sipType === 'ip' ? 'default' : 'outline'}
                        onClick={() => handleInputChange('sipType', 'ip')}
                      >
                        IP Based
                      </Button>
                    </div>

                    {settings.sipType === 'credentials' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="sipUsername" className="text-muted-foreground dark:text-gray-300 flex items-center"><User className="mr-2 h-4 w-4"/>SIP Username</Label>
                            <Input id="sipUsername" value={settings.sipUsername} onChange={(e) => handleInputChange('sipUsername', e.target.value)} className="bg-background dark:bg-slate-700 border-input dark:border-slate-600"/>
                          </div>
                          <div>
                            <Label htmlFor="sipPassword" className="text-muted-foreground dark:text-gray-300 flex items-center"><Lock className="mr-2 h-4 w-4"/>SIP Password</Label>
                            <Input id="sipPassword" type="password" value={settings.sipPassword} onChange={(e) => handleInputChange('sipPassword', e.target.value)} className="bg-background dark:bg-slate-700 border-input dark:border-slate-600"/>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sipIpAddress" className="text-muted-foreground dark:text-gray-300 flex items-center"><Server className="mr-2 h-4 w-4"/>SIP Server IP Address</Label>
                        <Input id="sipIpAddress" value={settings.sipIpAddress} onChange={(e) => handleInputChange('sipIpAddress', e.target.value)} placeholder="e.g., 192.168.1.100" className="bg-background dark:bg-slate-700 border-input dark:border-slate-600"/>
                      </div>
                      <div>
                        <Label htmlFor="sipPhoneNumber" className="text-muted-foreground dark:text-gray-300 flex items-center"><Phone className="mr-2 h-4 w-4"/>Intercom SIP Phone Number</Label>
                        <Input id="sipPhoneNumber" type="tel" value={settings.sipPhoneNumber} onChange={(e) => handleInputChange('sipPhoneNumber', e.target.value)} placeholder="e.g., 1001" className="bg-background dark:bg-slate-700 border-input dark:border-slate-600"/>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveSettings} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Save className="mr-2 h-5 w-5" /> Save Phone Settings
              </Button>
            </div>
          </motion.div>
        </Layout>
      );
    };

    export default PhoneSettingsPage;