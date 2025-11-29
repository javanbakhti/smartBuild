import React, { useState, useEffect, useRef } from 'react';
    import Layout from '@/components/Layout';
    import { Button } from '@/components/ui/button';
    import { Label } from '@/components/ui/label';
    import { Input } from '@/components/ui/input';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Palette, UploadCloud, Save, Image as ImageIcon, Globe } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';

    const availableLanguages = [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español (Spanish)' },
      { code: 'fr', name: 'Français (French)' },
    ];

    const kioskThemes = [
      { id: 'modern-dark', name: 'Modern Dark', colors: { bg: 'bg-slate-800', text: 'text-white', primary: 'bg-blue-600' } },
      { id: 'classic-light', name: 'Classic Light', colors: { bg: 'bg-gray-100', text: 'text-gray-800', primary: 'bg-indigo-600' } },
      { id: 'vibrant-blue', name: 'Vibrant Blue', colors: { bg: 'bg-blue-700', text: 'text-white', primary: 'bg-sky-500' } },
      { id: 'elegant-gold', name: 'Elegant Gold', colors: { bg: 'bg-neutral-900', text: 'text-amber-50', primary: 'bg-amber-400' } },
    ];

    const ThemeBrandingPage = () => {
      const { toast } = useToast();
      const [settings, setSettings] = useState({
        managerLanguage: 'en',
        residentLanguage: 'en',
        kioskLanguage: 'en',
        kioskTheme: 'modern-dark',
        logoUrl: '', // Will store Data URL for preview
      });
      const [logoFile, setLogoFile] = useState(null);
      const fileInputRef = useRef(null);

      useEffect(() => {
        const storedSettings = JSON.parse(localStorage.getItem('themeBrandingSettings'));
        if (storedSettings) {
          setSettings(prev => ({ ...prev, ...storedSettings }));
        }
        // Also load language settings from languageTimezoneSettings if they exist, to keep consistency
        const langTimeSettings = JSON.parse(localStorage.getItem('languageTimezoneSettings'));
        if (langTimeSettings) {
            setSettings(prev => ({
                ...prev,
                managerLanguage: langTimeSettings.managerLanguage || prev.managerLanguage,
                residentLanguage: langTimeSettings.residentLanguage || prev.residentLanguage,
                kioskLanguage: langTimeSettings.kioskLanguage || prev.kioskLanguage,
            }));
        }
      }, []);

      const handleSelectChange = (name, value) => {
        setSettings(prev => ({ ...prev, [name]: value }));
      };

      const handleLogoUpload = (event) => {
        const file = event.target.files[0];
        if (file && (file.type === "image/png" || file.type === "image/svg+xml")) {
          if (file.size > 2 * 1024 * 1024) { // Max 2MB
            toast({ title: "Error", description: "Logo file size should not exceed 2MB.", variant: "destructive" });
            return;
          }
          setLogoFile(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            setSettings(prev => ({ ...prev, logoUrl: reader.result }));
          };
          reader.readAsDataURL(file);
        } else {
          toast({ title: "Invalid File", description: "Please upload a PNG or SVG file for the logo.", variant: "destructive" });
          setLogoFile(null);
          setSettings(prev => ({ ...prev, logoUrl: JSON.parse(localStorage.getItem('themeBrandingSettings'))?.logoUrl || '' })); // Revert to saved or empty
        }
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, logoFile would be uploaded to a server, and settings.logoUrl would store the server URL.
        // For localStorage, we are already storing the Data URL in settings.logoUrl.
        localStorage.setItem('themeBrandingSettings', JSON.stringify(settings));
        
        // Optionally update languageTimezoneSettings if languages changed here
        const langTimeSettings = JSON.parse(localStorage.getItem('languageTimezoneSettings')) || {};
        localStorage.setItem('languageTimezoneSettings', JSON.stringify({
            ...langTimeSettings,
            managerLanguage: settings.managerLanguage,
            residentLanguage: settings.residentLanguage,
            kioskLanguage: settings.kioskLanguage,
        }));

        toast({
          title: 'Settings Saved',
          description: 'Theme, branding, and language configurations have been updated.',
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
                  <Palette className="mr-3 h-8 w-8 text-primary" /> Theme & Branding
                </h1>
                <p className="text-muted-foreground">Customize the look and feel of the system and Kiosk.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <Card className="dark:bg-slate-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="dark:text-white flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-purple-500"/>Logo Customization</CardTitle>
                  <CardDescription>Upload your building or company logo (transparent PNG or SVG recommended, max 2MB).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="logoUpload" className="dark:text-gray-300">Upload Logo</Label>
                    <Input 
                      id="logoUpload" 
                      type="file" 
                      accept=".png, .svg" 
                      onChange={handleLogoUpload} 
                      ref={fileInputRef}
                      className="dark:bg-slate-700 dark:text-white dark:border-slate-600 file:text-primary file:font-medium file:mr-2"
                    />
                  </div>
                  {settings.logoUrl && (
                    <div className="mt-4 p-4 border rounded-md dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 inline-block">
                      <p className="text-sm text-muted-foreground mb-2">Logo Preview:</p>
                      <img-replace src={settings.logoUrl} alt="Uploaded Logo Preview" className="max-h-20 max-w-xs bg-contain bg-center bg-no-repeat p-2" style={{ backgroundColor: 'rgba(128,128,128,0.1)' }} />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="dark:bg-slate-800 shadow-lg mt-6">
                <CardHeader>
                  <CardTitle className="dark:text-white flex items-center"><Globe className="mr-2 h-5 w-5 text-green-500"/>Language Settings</CardTitle>
                  <CardDescription>Set default languages for different system interfaces.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="managerLanguage" className="dark:text-gray-300">Manager Language</Label>
                    <Select value={settings.managerLanguage} onValueChange={(value) => handleSelectChange('managerLanguage', value)}>
                      <SelectTrigger id="managerLanguage" className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:text-white dark:border-slate-600">
                        {availableLanguages.map(lang => <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                   <div>
                    <Label htmlFor="residentLanguage" className="dark:text-gray-300">Resident Language</Label>
                    <Select value={settings.residentLanguage} onValueChange={(value) => handleSelectChange('residentLanguage', value)}>
                      <SelectTrigger id="residentLanguage" className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:text-white dark:border-slate-600">
                        {availableLanguages.map(lang => <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="kioskLanguage" className="dark:text-gray-300">Kiosk Language</Label>
                    <Select value={settings.kioskLanguage} onValueChange={(value) => handleSelectChange('kioskLanguage', value)}>
                      <SelectTrigger id="kioskLanguage" className="dark:bg-slate-700 dark:text-white dark:border-slate-600">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:text-white dark:border-slate-600">
                        {availableLanguages.map(lang => <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-slate-800 shadow-lg mt-6">
                <CardHeader>
                  <CardTitle className="dark:text-white">Kiosk Theme Selection</CardTitle>
                  <CardDescription>Choose a predefined theme for the Kiosk interface.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {kioskThemes.map(theme => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => handleSelectChange('kioskTheme', theme.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left
                                    ${settings.kioskTheme === theme.id ? 'border-primary ring-2 ring-primary shadow-lg' : 'border-muted hover:border-primary/50 dark:border-slate-700 dark:hover:border-primary/50'}
                                    ${theme.colors.bg} ${theme.colors.text}`}
                      >
                        <div className={`w-full h-12 rounded mb-2 ${theme.colors.primary}`}></div>
                        <p className="font-semibold text-sm">{theme.name}</p>
                        <p className="text-xs opacity-80">Example Text</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end mt-6">
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Save className="mr-2 h-4 w-4" /> Save Theme & Branding
                </Button>
              </div>
            </form>
          </motion.div>
        </Layout>
      );
    };

    export default ThemeBrandingPage;