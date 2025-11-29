import React from 'react';
import { Button } from '@/components/ui/button';
import { Languages, ShieldAlert, WifiOff, Wifi, Loader2 } from 'lucide-react';

const KioskPageHeader = ({ language, setLanguage, direction, t, mqttStatus, resetIdleTimerKiosk, addLog, toast }) => {
  const toggleLanguage = () => {
    resetIdleTimerKiosk();
    const newLang = language === 'en' ? 'fa' : 'en';
    setLanguage(newLang);
    addLog(`Language changed to ${newLang.toUpperCase()}.`);
  };

  const MqttStatusIndicator = () => {
    let IconComponent = WifiOff;
    let colorClass = "text-red-400";
    if (mqttStatus === 'Connected') {
      IconComponent = Wifi;
      colorClass = "text-green-400";
    } else if (mqttStatus === 'Connecting...' || mqttStatus === 'Reconnecting...') {
      IconComponent = Loader2;
      colorClass = "text-yellow-400 animate-spin";
    }
    return (
      <div className={`flex items-center space-x-1 text-xs ${colorClass}`}>
        <IconComponent className={`w-3 h-3 ${mqttStatus === 'Connecting...' || mqttStatus === 'Reconnecting...' ? 'animate-spin' : ''}`} />
        <span>{mqttStatus}</span>
      </div>
    );
  };

  return (
    <header className="flex justify-between items-center mb-3 md:mb-4">
      <h1 className="text-2xl md:text-4xl font-bold tracking-tight">{t('kioskTitle')}</h1>
      <div className="flex items-center space-x-2 md:space-x-3">
        <MqttStatusIndicator />
        <Button variant="ghost" onClick={toggleLanguage} className="text-sm md:text-lg p-1 md:p-2 hover:bg-white/10">
          <Languages className="w-5 h-5 md:w-7 md:h-7 mr-1 md:mr-2" /> {language === 'en' ? t('languageFA') : t('languageEN')}
        </Button>
        <Button variant="destructive" className="bg-red-600/80 hover:bg-red-700/80 p-1 md:p-2 text-sm md:text-base" onClick={() => { resetIdleTimerKiosk(); addLog("Emergency button clicked."); toast({ title: t('emergency'), description: t('emergencyContactingServices'), variant: 'destructive' }); }}>
          <ShieldAlert className="w-5 h-5 md:w-7 md:h-7 mr-1 md:mr-2" /> {t('emergency')}
        </Button>
      </div>
    </header>
  );
};

export default KioskPageHeader;