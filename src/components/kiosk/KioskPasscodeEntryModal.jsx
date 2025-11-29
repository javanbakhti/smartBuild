import React, { useState, useEffect, useCallback } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { X, Delete, Loader2, Hash, ShieldAlert, CheckCircle } from 'lucide-react';
    import { useLanguage } from '@/contexts/LanguageContext';
    import { isPast } from 'date-fns';

    const KioskPasscodeEntryModal = ({ isOpen, onClose, mqttClient, addLog, resetIdleTimerKiosk, t: translate }) => {
      const { t: langHookT } = useLanguage();
      const t = translate || langHookT;

      const [currentStep, setCurrentStep] = useState('unitEntry');
      const [unitNumberInput, setUnitNumberInput] = useState('');
      const [passcodeInput, setPasscodeInput] = useState('');
      const [displayValue, setDisplayValue] = useState('');
      const [isProcessing, setIsProcessing] = useState(false);
      const [feedback, setFeedback] = useState({ message: '', type: '' });

      const MAX_UNIT_LENGTH = 5;
      const MAX_PASSCODE_LENGTH = 8;
      const MIN_PASSCODE_LENGTH = 4;

      useEffect(() => {
        if (isOpen) {
          addLog('Debug: KioskPasscodeEntryModal is open and attempting to render.');
          resetIdleTimerKiosk?.();
        } else {
          setCurrentStep('unitEntry');
          setUnitNumberInput('');
          setPasscodeInput('');
          setDisplayValue('');
          setIsProcessing(false);
          setFeedback({ message: '', type: '' });
        }
      }, [isOpen, addLog, resetIdleTimerKiosk]);

      const updateDisplayValue = useCallback(() => {
        if (currentStep === 'unitEntry') {
          setDisplayValue(unitNumberInput);
        } else {
          setDisplayValue('●'.repeat(passcodeInput.length));
        }
      }, [currentStep, unitNumberInput, passcodeInput]);

      useEffect(() => {
        updateDisplayValue();
      }, [unitNumberInput, passcodeInput, currentStep, updateDisplayValue]);

      const handleKeyPress = (key) => {
        resetIdleTimerKiosk?.();
        if (isProcessing) return;
        setFeedback({ message: '', type: '' });

        if (currentStep === 'unitEntry') {
          if (unitNumberInput.length < MAX_UNIT_LENGTH) {
            setUnitNumberInput(prev => prev + key);
          }
        } else {
          if (passcodeInput.length < MAX_PASSCODE_LENGTH) {
            setPasscodeInput(prev => prev + key);
          }
        }
      };

      const handleBackspace = () => {
        resetIdleTimerKiosk?.();
        if (isProcessing) return;
        setFeedback({ message: '', type: '' });

        if (currentStep === 'unitEntry') {
          setUnitNumberInput(prev => prev.slice(0, -1));
        } else {
          setPasscodeInput(prev => prev.slice(0, -1));
        }
      };

      const handleClear = () => {
        resetIdleTimerKiosk?.();
        if (isProcessing) return;
        setFeedback({ message: '', type: '' });

        if (currentStep === 'unitEntry') {
          setUnitNumberInput('');
        } else {
          setPasscodeInput('');
        }
      };

      const grantAccess = () => {
        addLog(`Passcode Modal: Access Granted for unit ${unitNumberInput}.`);
        setFeedback({ message: t('kioskPasscodeAccessGranted'), type: 'success' });

        if (mqttClient && mqttClient.connected) {
          mqttClient.publish('door/relay/unlock', 'open', {}, (err) => {
            if (err) {
              addLog(`Passcode Modal: MQTT failed to publish to door/relay/unlock: ${err.message}`);
              setFeedback({ message: t('kioskPasscodeErrorMQTT'), type: 'error' });
              setIsProcessing(false);
            } else {
              addLog('Passcode Modal: MQTT door/relay/unlock "open" command published.');
              setTimeout(() => {
                setIsProcessing(false);
                onClose();
              }, 2000);
            }
          });
        } else {
          addLog('Passcode Modal: MQTT client not connected. Cannot publish to door/relay/unlock.');
          setFeedback({ message: t('kioskPasscodeErrorMQTT'), type: 'error' });
          setIsProcessing(false);
        }
      };
      
      const denyAccess = (reason) => {
        addLog(`Passcode Modal: Access Denied for unit ${unitNumberInput}. Reason: ${reason}`);
        setFeedback({ message: reason, type: 'error' });
        setPasscodeInput(''); 
        setIsProcessing(false);
      };

      const handleSubmitStep = () => {
        resetIdleTimerKiosk?.();
        if (isProcessing) return;
        setFeedback({ message: '', type: '' });

        if (currentStep === 'unitEntry') {
          if (unitNumberInput.trim() === '') {
            setFeedback({ message: t('kioskPasscodeErrorUnitEmpty'), type: 'error' });
            addLog('Passcode Modal: Unit number cannot be empty.');
            return;
          }
          setCurrentStep('passcodeEntry');
          setDisplayValue('');
          addLog(`Passcode Modal: Unit number entered: ${unitNumberInput}`);
        } else {
          if (passcodeInput.length < MIN_PASSCODE_LENGTH || passcodeInput.length > MAX_PASSCODE_LENGTH) {
            denyAccess(t('kioskPasscodeErrorLength', { min: MIN_PASSCODE_LENGTH, max: MAX_PASSCODE_LENGTH }));
            return;
          }

          setIsProcessing(true);
          setFeedback({ message: t('kioskPasscodeProcessing'), type: 'info' });

          const unitToCompare = String(unitNumberInput).trim();
          const passcodeToCompare = String(passcodeInput).trim();

          const storedResidentsString = localStorage.getItem('residents');
          const storedResidents = storedResidentsString ? JSON.parse(storedResidentsString) : [];
          const resident = storedResidents.find(r => String(r.unitNumber).trim() === unitToCompare);
          const residentPasscode = resident ? String(resident.passcode).trim() : null;

          if (resident && residentPasscode === passcodeToCompare) {
            grantAccess();
            return;
          }

          const storedVisitorsString = localStorage.getItem('visitors'); 
          const activeVisitors = storedVisitorsString ? JSON.parse(storedVisitorsString) : [];
          let visitorMatch = activeVisitors.find(v => 
            String(v.unitNumber).trim() === unitToCompare && 
            String(v.passcode).trim() === passcodeToCompare
          );
          
          if (visitorMatch) {
            if (['departed', 'denied', 'expired', 'archived'].includes(visitorMatch.status)) {
              denyAccess(t('kioskPasscodeErrorStatusInvalid'));
              return;
            }
            if (visitorMatch.passcodeExpiresAt && isPast(new Date(visitorMatch.passcodeExpiresAt))) {
              denyAccess(t('kioskPasscodeErrorExpired'));
              const updatedVisitors = activeVisitors.map(v => v.id === visitorMatch.id ? {...v, status: 'expired'} : v);
              localStorage.setItem('visitors', JSON.stringify(updatedVisitors));
              return;
            }
            if (visitorMatch.accessType === 'multiple' && visitorMatch.usageLimit) {
              const currentCount = visitorMatch.entryCount || 0;
              if (currentCount >= parseInt(visitorMatch.usageLimit, 10)) {
                denyAccess(t('kioskPasscodeErrorUsageLimit'));
                return;
              }
              visitorMatch.entryCount = currentCount + 1;
              const updatedVisitors = activeVisitors.map(v => v.id === visitorMatch.id ? visitorMatch : v);
              localStorage.setItem('visitors', JSON.stringify(updatedVisitors));
            }
            grantAccess();
            return;
          }
          
          denyAccess(t('kioskPasscodeErrorInvalid'));
        }
      };

      const promptText = () => {
        if (feedback.message) return feedback.message;
        if (currentStep === 'unitEntry') return t('kioskPasscodeEnterUnit');
        return t('kioskPasscodeEnterPasscode');
      };
      
      const getPromptIcon = () => {
        if (feedback.type === 'error') return <ShieldAlert className="w-5 h-5 mr-2 text-red-400" />;
        if (feedback.type === 'success') return <CheckCircle className="w-5 h-5 mr-2 text-green-400" />;
        if (isProcessing && feedback.type === 'info') return <Loader2 className="w-5 h-5 animate-spin mr-2" />;
        return null;
      };

      const numericKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

      const KeyButton = ({ children, onClick, className = '', fullSpan = false, icon = null }) => (
        <Button
          variant="outline"
          className={`h-14 sm:h-16 text-xl sm:text-2xl font-semibold bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-colors focus:ring-purple-500 focus:ring-2 ${className} ${fullSpan ? 'col-span-full' : ''}`}
          onClick={onClick}
          disabled={isProcessing && feedback.type !== 'error'}
        >
          {icon || children}
        </Button>
      );

      return (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9998] p-4"
              style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998 }}
              onClick={(e) => { if (e.target === e.currentTarget && !(isProcessing && feedback.type !== 'error')) onClose(); }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="bg-slate-800/90 text-white p-5 sm:p-6 rounded-xl shadow-2xl w-full max-w-xs sm:max-w-sm border border-purple-500/30"
              >
                <div className="text-center mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold mb-1">{t('kioskPasscodeEntryTitle')}</h2>
                  <div className={`text-xs sm:text-sm h-10 flex items-center justify-center px-2 ${feedback.type === 'error' ? 'text-red-400' : feedback.type === 'success' ? 'text-green-400' : 'text-slate-300'}`}>
                    {getPromptIcon()}
                    <span>{promptText()}</span>
                  </div>
                </div>

                <Input
                  type="text"
                  value={displayValue}
                  readOnly
                  className="text-center text-2xl sm:text-3xl tracking-widest h-12 sm:h-14 bg-slate-700/50 border-purple-500/50 pointer-events-none mb-4 selection:bg-transparent"
                  placeholder={currentStep === 'unitEntry' ? "UNIT" : "••••"}
                />

                <div className="grid grid-cols-3 gap-2">
                  {numericKeys.slice(0, 9).map((key) => (
                    <KeyButton key={key} onClick={() => handleKeyPress(key)}>
                      {key}
                    </KeyButton>
                  ))}
                  <KeyButton onClick={handleClear} className="bg-red-500/50 hover:bg-red-600/50">
                    <X className="w-6 h-6 sm:w-7 sm:h-7" />
                  </KeyButton>
                  <KeyButton onClick={() => handleKeyPress(numericKeys[9])}>
                    {numericKeys[9]}
                  </KeyButton>
                  <KeyButton onClick={handleBackspace} className="bg-yellow-500/50 hover:bg-yellow-600/50">
                    <Delete className="w-6 h-6 sm:w-7 sm:h-7" />
                  </KeyButton>
                </div>
                <Button
                    variant="outline"
                    className="w-full mt-3 h-14 sm:h-16 text-xl sm:text-2xl font-semibold bg-green-500/70 hover:bg-green-600/70 transition-colors text-white border-green-400/50 focus:ring-green-500"
                    onClick={handleSubmitStep}
                    disabled={isProcessing && feedback.type !== 'error'}
                >
                    <Hash className="w-6 h-6 sm:w-7 sm:h-7 mr-2" /> {t('submitPound')}
                </Button>
                <Button
                    variant="ghost"
                    onClick={onClose}
                    className="w-full mt-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 text-sm"
                    disabled={isProcessing && feedback.type === 'info'} 
                >
                  {t('cancel')}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      );
    };

    export default KioskPasscodeEntryModal;