// import React, { useState, useEffect } from 'react';
// import { Navigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { KeyRound, Eye, EyeOff, Tv2 } from 'lucide-react';
// import { useToast } from '@/components/ui/use-toast';
// import { useLanguage } from '@/contexts/LanguageContext';
// import axiosClient from "@/api/axiosClient";

// const KioskAuthGate = ({ children, setKioskAuthTime, kioskAuthTime, authTimeout }) => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState('');
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const { toast } = useToast();
//   const { t, language, direction } = useLanguage(); 
//   useEffect(() => {
//     const checkAuth = () => {
//       if (kioskAuthTime && (Date.now() - kioskAuthTime < authTimeout)) {
//         setIsAuthenticated(true);
//       } else {
//         localStorage.removeItem('kioskAuthTime'); 
//         setIsAuthenticated(false);
//       }
//       setLoading(false);
//     };
//     checkAuth();
//   }, [kioskAuthTime, authTimeout]);

//   const logAttempt = (status, userAttempted) => {
//     const kioskSettings = JSON.parse(localStorage.getItem('kioskSettings')) || {};
//     const newLog = {
//       timestamp: new Date().toISOString(),
//       ip: 'N/A (Client-Side)', 
//       status,
//       user: userAttempted,
//     };
//     const updatedLogs = [newLog, ...(kioskSettings.accessLogs || [])].slice(0, 20); // Keep last 20 logs
//     localStorage.setItem('kioskSettings', JSON.stringify({ ...kioskSettings, accessLogs: updatedLogs }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setError('');
// const kioskSettings = window.__kioskSettings;

// if (!kioskSettings) {
//   setError('Kiosk access is not configured.');
//   return;
// }
    // const kioskSettings = JSON.parse(localStorage.getItem('kioskSettings'));
    // if (!kioskSettings || !kioskSettings.kioskUsername || !kioskSettings.kioskPassword) {
    //   setError('Kiosk access is not configured. Please contact the building manager.');
    //   logAttempt('Failed - Not Configured', username);
    //   return;
    // }

    // IP Whitelisting check (Simulated)
    // In a real app, this would be done server-side before even serving the login page.
    // if (kioskSettings.ipWhitelist && kioskSettings.ipWhitelist.length > 0) {
      // This is a placeholder. Actual IP checking is complex and server-side.
      // For simulation, we could deny if a specific "test" IP isn't "currentIp"
      // console.log("Simulated IP Whitelist check. For now, allowing all.");
    // }


  //   if (username === kioskSettings.kioskUsername && password === kioskSettings.kioskPassword) {
  //     const now = Date.now();
  //     localStorage.setItem('kioskAuthTime', now.toString());
  //     setKioskAuthTime(now);
  //     setIsAuthenticated(true);
  //     toast({ title: 'Access Granted', description: 'Welcome to the Kiosk Interface.' });
  //     logAttempt('Success', username);
  //   } else {
  //     setError('Invalid username or password.');
  //     toast({ title: 'Access Denied', description: 'Invalid credentials.', variant: 'destructive' });
  //     logAttempt('Failed - Invalid Credentials', username);
  //   }
  // };

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900">
  //       <Tv2 className="w-24 h-24 text-white animate-pulse" />
  //     </div>
  //   );
  // }

  // if (isAuthenticated) {
  //   return children;
  // }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 p-4" dir={direction}>
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.5, ease: "easeOut" }}
//       >
//         <Card className="w-full max-w-md glassmorphism-card border-purple-500/30 shadow-purple-500/20 shadow-2xl">
//           <CardHeader className="text-center">
//             <Tv2 className="w-16 h-16 mx-auto text-purple-400" />
//             <CardTitle className="text-3xl font-bold text-white">{t('kioskAccessLogin') || 'Kiosk Access Login'}</CardTitle>
//             <CardDescription className="text-purple-300">
//               {t('kioskAccessDescription') || 'Please enter credentials to access the Kiosk interface.'}
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="space-y-2">
//                 <Label htmlFor="username" className="text-purple-300">{t('username') || 'Username'}</Label>
//                 <Input
//                   id="username"
//                   type="text"
//                   placeholder={t('enterUsername') || "Enter username"}
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   required
//                   className="bg-slate-800/50 border-purple-500/50 text-white placeholder-purple-400/70 focus:border-purple-400"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="password" className="text-purple-300">{t('password') || 'Password'}</Label>
//                 <div className="relative">
//                   <Input
//                     id="password"
//                     type={showPassword ? 'text' : 'password'}
//                     placeholder="••••••••"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required
//                     className="bg-slate-800/50 border-purple-500/50 text-white placeholder-purple-400/70 focus:border-purple-400 pr-10"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute inset-y-0 right-0 px-3 flex items-center text-purple-400 hover:text-purple-300"
//                     aria-label={showPassword ? (t('hidePassword') || "Hide password") : (t('showPassword') || "Show password")}
//                   >
//                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                   </button>
//                 </div>
//               </div>
//               {error && <p className="text-sm text-red-400 text-center">{error}</p>}
//               <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 text-lg transition-all duration-300 transform hover:scale-105 neumorphism-button border-none">
//                 <KeyRound className="mr-2 h-5 w-5" /> {t('login') || 'Login'}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>
//       </motion.div>
//     </div>
//   );
// };

// export default KioskAuthGate;


import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, Eye, EyeOff, Tv2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import axiosClient from "@/api/axiosClient";

const KioskAuthGate = ({ children, setKioskAuthTime, kioskAuthTime, authTimeout }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t, language, direction } = useLanguage();

  // ❌ این stateها در نسخه تو نبود و باعث خطا می‌شد
  // 🔧 FIXED – اضافه شدن stateهای واقعی kiosk settings
  const [kioskUsername, setKioskUsername] = useState("");
  const [kioskPassword, setKioskPassword] = useState("");
  const [ipWhitelist, setIpWhitelist] = useState([]);
  const [kioskUrl, setKioskUrl] = useState("");

useEffect(() => {
  // 1) AUTH CHECK
  const checkAuth = () => {
    if (kioskAuthTime && (Date.now() - kioskAuthTime < authTimeout)) {
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("kioskAuthTime");
      setIsAuthenticated(false);
    }
    setLoading(false);
  };
  checkAuth();

  // 2) LOAD KIOSK SETTINGS FROM BACKEND
  async function loadSettings() {
    try {
      const response = await axiosClient.get("/kiosk/settings");
      // 🔴 بک‌اند می‌فرسته: { success: true, settings }
      const settings = response.data?.settings || {};

      setKioskUsername(settings.kioskUsername || "kiosk_admin");
      setKioskPassword(settings.kioskPassword || "password123");
      setIpWhitelist(settings.ipWhitelist || []);
      setKioskUrl(settings.kioskUrl || "");

      // بهتره خودِ settings ذخیره شود نه کل data
      localStorage.setItem("kioskSettings", JSON.stringify(settings));
    } catch (err) {
      console.error("Failed to load kiosk settings", err);
      // اینجا هم می‌تونی fallback لوکال بذاری اگر خواستی
      const saved = JSON.parse(localStorage.getItem("kioskSettings") || "{}");
      if (saved.kioskUsername && saved.kioskPassword) {
        setKioskUsername(saved.kioskUsername);
        setKioskPassword(saved.kioskPassword);
        setIpWhitelist(saved.ipWhitelist || []);
        setKioskUrl(saved.kioskUrl || "");
      }
    }
  }

  loadSettings();
}, [kioskAuthTime, authTimeout]);


  const logAttempt = (status, userAttempted) => {
    const kioskSettings = JSON.parse(localStorage.getItem('kioskSettings')) || {};
    const newLog = {
      timestamp: new Date().toISOString(),
      ip: 'N/A (Client-Side)',
      status,
      user: userAttempted,
    };
    const updatedLogs = [newLog, ...(kioskSettings.accessLogs || [])].slice(0, 20);
    localStorage.setItem('kioskSettings', JSON.stringify({ ...kioskSettings, accessLogs: updatedLogs }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

   
    const kioskSettings = {
      kioskUsername,
      kioskPassword,
      ipWhitelist,
      kioskUrl,
    };

    if (!kioskSettings.kioskUsername || !kioskSettings.kioskPassword) {
      setError('Kiosk access is not configured.');
      return;
    }

    // Password Check
    if (username === kioskSettings.kioskUsername && password === kioskSettings.kioskPassword) {
      const now = Date.now();
      localStorage.setItem('kioskAuthTime', now.toString());
      setKioskAuthTime(now);
      setIsAuthenticated(true);
      toast({ title: 'Access Granted', description: 'Welcome to the Kiosk Interface.' });
      logAttempt('Success', username);
    } else {
      setError('Invalid username or password.');
      toast({ title: 'Access Denied', description: 'Invalid credentials.', variant: 'destructive' });
      logAttempt('Failed - Invalid Credentials', username);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900">
        <Tv2 className="w-24 h-24 text-white animate-pulse" />
      </div>
    );
  }

  if (isAuthenticated) {
    return children;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 p-4" dir={direction}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="w-full max-w-md glassmorphism-card border-purple-500/30 shadow-purple-500/20 shadow-2xl">
          <CardHeader className="text-center">
            <Tv2 className="w-16 h-16 mx-auto text-purple-400" />
            <CardTitle className="text-3xl font-bold text-white">{t('kioskAccessLogin') || 'Kiosk Access Login'}</CardTitle>
            <CardDescription className="text-purple-300">
              {t('kioskAccessDescription') || 'Please enter credentials to access the Kiosk interface.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-purple-300">{t('username') || 'Username'}</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={t('enterUsername') || "Enter username"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-slate-800/50 border-purple-500/50 text-white placeholder-purple-400/70 focus:border-purple-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-purple-300">{t('password') || 'Password'}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-slate-800/50 border-purple-500/50 text-white placeholder-purple-400/70 focus:border-purple-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-purple-400 hover:text-purple-300"
                    aria-label={showPassword ? (t('hidePassword') || "Hide password") : (t('showPassword') || "Show password")}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-red-400 text-center">{error}</p>}
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 text-lg transition-all duration-300 transform hover:scale-105 neumorphism-button border-none">
                <KeyRound className="mr-2 h-5 w-5" /> {t('login') || 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default KioskAuthGate;
