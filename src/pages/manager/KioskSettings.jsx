import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tv2, KeyRound, ShieldCheck, ListChecks, WifiOff, PlusCircle, Trash2, Save, Eye, EyeOff, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import axiosClient from "@/api/axiosClient";

// helper سمت فرانت: اگر سرور URL نداد یک URL جدید بسازد
const generateKioskUrl = () => {
  const randomString =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  return `${window.location.origin}/kiosk?access_token=${randomString}`;
};
const KioskSettings = () => {
  const { toast } = useToast();
  const [kioskUsername, setKioskUsername] = useState('');
  const [kioskPassword, setKioskPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [ipWhitelist, setIpWhitelist] = useState([]);
  const [currentIp, setCurrentIp] = useState('');
  const [enable2FA, setEnable2FA] = useState(false);
  const [kioskUrl, setKioskUrl] = useState('');
  const [accessLogs, setAccessLogs] = useState([]);

   useEffect(() => {
    // ⬇️ تابع async برای لود تنظیمات از سرور
    const loadSettings = async () => {
      try {
        // 1) تلاش برای لود از بک‌اند
        const res = await axiosClient.get("/kiosk/settings");
        const data = res.data?.settings || {};

        setKioskUsername(data.kioskUsername || "kiosk_admin");
        setKioskPassword(data.kioskPassword || "password123");
        setIpWhitelist(data.ipWhitelist || []);
        setEnable2FA(!!data.enable2FA);
        setKioskUrl(data.kioskUrl || generateKioskUrl());
        setAccessLogs(
          data.accessLogs && data.accessLogs.length > 0
            ? data.accessLogs
            : [
                {
                  timestamp: new Date(Date.now() - 3600000).toISOString(),
                  ip: "192.168.1.100",
                  status: "Success",
                  user: "kiosk_admin",
                },
                {
                  timestamp: new Date(Date.now() - 7200000).toISOString(),
                  ip: "10.0.0.5",
                  status: "Failed",
                  user: "unknown",
                },
              ]
        );
      } catch (err) {
        console.error("Kiosk settings load error:", err);

        // 2) اگر API خطا داد، از localStorage بخوان (fallback)
        const savedSettings =
          JSON.parse(localStorage.getItem("kioskSettings")) || {};

        setKioskUsername(savedSettings.kioskUsername || "kiosk_admin");
        setKioskPassword(savedSettings.kioskPassword || "password123");
        setIpWhitelist(savedSettings.ipWhitelist || []);
        setEnable2FA(savedSettings.enable2FA || false);
        setKioskUrl(savedSettings.kioskUrl || generateKioskUrl());
        setAccessLogs(
          savedSettings.accessLogs && savedSettings.accessLogs.length > 0
            ? savedSettings.accessLogs
            : []
        );

        // یک نوتیفیکیشن هم بده
        toast({
          title: "Could not load from server",
          description: "Loaded kiosk settings from your browser (localStorage).",
          variant: "destructive",
        });
      }
    };

    loadSettings();
  }, [toast]);

  const handleSaveSettings = async () => {
    try {
      const payload = {
        kioskUsername,
        kioskPassword,
        ipWhitelist,
        enable2FA,
        kioskUrl,
        accessLogs,
      };

      // 1) ارسال به بک‌اند
      const res = await axiosClient.post("/kiosk/settings", payload);

      // 2) اختیاری: نگه داشتن نسخه‌ی لوکال برای fallback
      localStorage.setItem("kioskSettings", JSON.stringify(payload));

      toast({
        title: "Kiosk Settings Saved",
        description: "Your Kiosk access configurations have been updated on server.",
      });
    } catch (err) {
      console.error("Save kiosk settings error:", err);
      toast({
        title: "Save Failed",
        description: "Could not save kiosk settings to server.",
        variant: "destructive",
      });
    }
  };


  const handleAddIp = () => {
    if (currentIp && !ipWhitelist.includes(currentIp)) {
      // Basic IP format validation (very simple)
      if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(currentIp)) {
        setIpWhitelist([...ipWhitelist, currentIp]);
        setCurrentIp('');
      } else {
        toast({ title: "Invalid IP", description: "Please enter a valid IP address.", variant: "destructive" });
      }
    }
  };

  const handleRemoveIp = (ipToRemove) => {
    setIpWhitelist(ipWhitelist.filter(ip => ip !== ipToRemove));
  };

const copyKioskUrl = () => {
  if (!navigator.clipboard) {
    toast({
      title: "Clipboard blocked",
      description: "Clipboard API is disabled on HTTP. Use HTTPS.",
      variant: "destructive"
    });
    return;
  }

  navigator.clipboard.writeText(kioskUrl);
  toast({
    title: "URL Copied!",
    description: "Kiosk access URL copied."
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-800 dark:text-white flex items-center justify-center md:justify-start">
            <Tv2 className="mr-3 h-8 w-8 text-primary" /> Kiosk Access Settings
          </h1>
          <p className="text-muted-foreground">Manage how the Kiosk interface is accessed and secured.</p>
        </div>

        <Card className="dark:bg-slate-800 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center dark:text-white"><KeyRound className="mr-2 h-5 w-5 text-primary" />Kiosk Credentials</CardTitle>
            <CardDescription>Set a unique username and password for accessing the Kiosk URL.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="kioskUsername" className="dark:text-gray-300">Kiosk Username</Label>
              <Input id="kioskUsername" value={kioskUsername} onChange={(e) => setKioskUsername(e.target.value)} className="dark:bg-slate-700 dark:text-white dark:border-slate-600" />
            </div>
            <div>
              <Label htmlFor="kioskPassword" className="dark:text-gray-300">Kiosk Password</Label>
              <div className="relative">
                <Input 
                  id="kioskPassword" 
                  type={showPassword ? 'text' : 'password'} 
                  value={kioskPassword} 
                  onChange={(e) => setKioskPassword(e.target.value)} 
                  className="dark:bg-slate-700 dark:text-white dark:border-slate-600 pr-10" 
                />
                <Button variant="ghost" size="icon" type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 dark:text-gray-400 dark:hover:text-gray-200">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center dark:text-white"><WifiOff className="mr-2 h-5 w-5 text-primary" />IP Whitelisting (Simulated)</CardTitle>
            <CardDescription>Restrict Kiosk access to specific IP addresses. This is a UI simulation; actual IP restriction requires server configuration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input 
                value={currentIp} 
                onChange={(e) => setCurrentIp(e.target.value)} 
                placeholder="Enter IP address (e.g., 192.168.1.100)"
                className="dark:bg-slate-700 dark:text-white dark:border-slate-600"
              />
              <Button onClick={handleAddIp} variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">
                <PlusCircle className="mr-2 h-4 w-4" /> Add IP
              </Button>
            </div>
            {ipWhitelist.length > 0 && (
              <ul className="space-y-2 pt-2">
                {ipWhitelist.map(ip => (
                  <li key={ip} className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-700 rounded-md">
                    <span className="font-mono dark:text-gray-300">{ip}</span>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveIp(ip)} className="text-red-500 hover:text-red-700 h-7 w-7">
                      <Trash2 size={16} />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        
        <Card className="dark:bg-slate-800 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center dark:text-white"><ShieldCheck className="mr-2 h-5 w-5 text-primary" />Additional Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enable2FA" className="dark:text-gray-300 font-medium">Enable Two-Factor Authentication (2FA)</Label>
                <p className="text-sm text-muted-foreground">Adds an extra layer of security to Kiosk login. (UI Simulation)</p>
              </div>
              <Switch id="enable2FA" checked={enable2FA} onCheckedChange={setEnable2FA} className="data-[state=checked]:bg-primary" />
            </div>
            <div>
              <Label className="dark:text-gray-300">Kiosk Access URL (Simulated Complex URL)</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input value={kioskUrl} readOnly className="dark:bg-slate-700 dark:text-gray-400 dark:border-slate-600 font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={copyKioskUrl} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">
                  <Copy size={16} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">This URL should only be accessible from whitelisted IPs and used on the Kiosk device. Do not share publicly.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center dark:text-white"><ListChecks className="mr-2 h-5 w-5 text-primary" />Access Logs (Simulated)</CardTitle>
            <CardDescription>View recent access attempts to the Kiosk interface.</CardDescription>
          </CardHeader>
          <CardContent>
            {accessLogs.length > 0 ? (
              <ul className="space-y-3 max-h-60 overflow-y-auto">
                {accessLogs.map(log => (
                  <li key={log.timestamp} className={`p-3 rounded-md text-sm ${log.status === 'Success' ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold ${log.status === 'Success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                        {log.status}
                      </span>
                      <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-muted-foreground">IP: <span className="font-mono">{log.ip}</span>, User: <span className="font-mono">{log.user}</span></p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">No access logs available.</p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSaveSettings} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Save className="mr-2 h-5 w-5" /> Save All Kiosk Settings
          </Button>
        </div>
      </motion.div>
    </Layout>
  );
};

export default KioskSettings;