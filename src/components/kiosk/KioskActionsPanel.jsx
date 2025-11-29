import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { KeyRound, Phone } from 'lucide-react';

const KioskActionsPanel = ({ onPasscodeEntry, onCallFrontDesk, t, resetIdleTimerKiosk }) => {
  const KioskActionButton = ({ children, onClick, icon, className = '', disabled = false, size = "large" }) => (
    <motion.div whileHover={{ scale: disabled ? 1 : 1.05 }} whileTap={{ scale: disabled ? 1 : 0.95 }}>
      <Button
        className={`w-full font-semibold flex flex-col items-center justify-center p-4 shadow-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/25 transition-all duration-300 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${size === "large" ? "h-24 md:h-32 text-xl md:text-2xl" : "h-20 md:h-28 text-lg md:text-xl"}`}
        onClick={onClick}
        disabled={disabled}
      >
        {icon && React.cloneElement(icon, { className: `mb-2 ${size === "large" ? "w-8 h-8 md:w-10 md:h-10" : "w-7 h-7 md:w-8 md:h-8"}` })}
        {children}
      </Button>
    </motion.div>
  );

  return (
    <div className="space-y-3 md:space-y-4 flex flex-col justify-center">
      <KioskActionButton
        onClick={() => {
          resetIdleTimerKiosk();
          onPasscodeEntry();
        }}
        icon={<KeyRound />}
        size="large"
      >
        {t('passcodeEntry')}
      </KioskActionButton>
      <KioskActionButton onClick={() => { resetIdleTimerKiosk(); onCallFrontDesk(); }} icon={<Phone />} size="small">
        {t('callFrontDesk')}
      </KioskActionButton>
    </div>
  );
};

export default KioskActionsPanel;