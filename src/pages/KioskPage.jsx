import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import KioskPasscodeEntryModal from '@/components/kiosk/KioskPasscodeEntryModal';
import KioskPageHeader from '@/components/kiosk/KioskPageHeader';
import ResidentDirectoryDisplay from '@/components/kiosk/ResidentDirectoryDisplay';
import KioskActionsPanel from '@/components/kiosk/KioskActionsPanel';
import SystemEventLogs from '@/components/kiosk/SystemEventLogs';
import { useLanguage } from '@/contexts/LanguageContext';
import { Phone, Video, MessageSquare, BellOff, Loader2, CheckCircle, DoorOpen } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import axiosClient from "@/api/axiosClient";

import mqtt from 'mqtt';

const KioskPage = () => {
  const { language, setLanguage, direction, t } = useLanguage();
  const { toast } = useToast();
  const hasLoadedResidents = useRef(false);  // 🔥 جلوگیری از loop

  const [searchTerm, setSearchTerm] = useState('');
  const [showKioskPasscodeModal, setShowKioskPasscodeModal] = useState(false);
  const [showCallOptionsModal, setShowCallOptionsModal] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [sortBy, setSortBy] = useState('unit');
  const [sortOrder, setSortOrder] = useState('asc');
  const [idleTimer, setIdleTimer] = useState(null);
  const [allResidents, setAllResidents] = useState([]);

  const [mqttClient, setMqttClient] = useState(null);
  const [mqttStatus, setMqttStatus] = useState('Disconnected');
  const [logs, setLogs] = useState([]);
  
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalContent, setStatusModalContent] = useState({ title: '', subtext: '', type: null });


  const logsEndRef = useRef(null);
  const doorOpenedTimerRef = useRef(null);


  const IDLE_TIMEOUT_DURATION = 120000; 

  const scrollToBottomLogs = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottomLogs();
  }, [logs]);

  const addLog = useCallback((message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [...prevLogs.slice(-100), { timestamp, message }]); 
  }, []);
  
  const resetIdleTimerKiosk = useCallback(() => {
    if (showKioskPasscodeModal || showStatusModal || showCallOptionsModal) {
        if (idleTimer) clearTimeout(idleTimer); 
        const newTimer = setTimeout(() => {
          if (!showKioskPasscodeModal && !showStatusModal && !showCallOptionsModal) {
             toast({ title: t('resetting'), description: t('idleTimeoutMessage'), variant: 'default', className: "bg-yellow-500 text-black" });
             resetKioskState();
             addLog('Kiosk reset due to inactivity while a modal was previously open.');
          } else {
            resetIdleTimerKiosk(); 
          }
        }, IDLE_TIMEOUT_DURATION);
        setIdleTimer(newTimer);
        return;
    }

    if (idleTimer) clearTimeout(idleTimer);
    const newTimer = setTimeout(() => {
      toast({ title: t('resetting'), description: t('idleTimeoutMessage'), variant: 'default', className: "bg-yellow-500 text-black" });
      resetKioskState();
      addLog('Kiosk reset due to inactivity.');
    }, IDLE_TIMEOUT_DURATION);
    setIdleTimer(newTimer);
  }, [idleTimer, t, IDLE_TIMEOUT_DURATION, addLog, toast, showKioskPasscodeModal, showStatusModal, showCallOptionsModal]);

    // ------------------------------------------------------------------
    // 🔥 NEW CODE: Load residents from API instead of only localStorage
    // ------------------------------------------------------------------
    const fetchResidentsFromAPI = async () => {
      try {
        addLog("KIOSK: Fetching residents from backend API...");
        
        // اگر buildingUid ذخیره شده:
        const buildingUid = localStorage.getItem("kiosk_buildingUid");

        const res = await axiosClient.get("/manager/residents");

        if (res.data?.residents?.length) {
          addLog(`KIOSK: ${res.data.residents.length} residents loaded from API.`);

          setAllResidents(
            res.data.residents.map(r => ({
              ...r,
              unitNumber: String(r.unitNumber || "").trim(),
              phoneNumber: r.phoneNumber || "1234567890",
              kioskDisplayName: r.kioskDisplayName || r.fullName,
              kioskPasscode: String(r.passcode || "0000").trim(),
            }))
          );
        } else {
          addLog("KIOSK: API returned zero residents.");
        }
      } catch (err) {
        addLog("KIOSK: Error fetching residents from API → " + err.message);
        console.error("KIOSK API ERROR:", err);
      }
    };

   
    // ------------------------------------------------------------------

  useEffect(() => {
      if (hasLoadedResidents.current) return;
  hasLoadedResidents.current = true;
    
const loadResidentsFromAPI = async () => {
    try {
      const res = await axiosClient.get("/manager/residents");  
      const list = res.data?.residents || []; 
      // ذخیره در localStorage
      // localStorage.setItem("residents", JSON.stringify(res.data));
      localStorage.setItem("residents", JSON.stringify(list));
      // آپدیت state Kiosk
      // setAllResidents(
      //   res.data.map(r => ({
      //     ...r,
      //     unitNumber: String(r.unitNumber || '').trim(),
      //     phoneNumber: r.phoneNumber || '1234567890',
      //     kioskPasscode: String(r.passcode || '0000').trim()
      //   }))
      // );
      setAllResidents(
  list.map(r => ({
    ...r,
    unitNumber: String(r.unitNumber || '').trim(),
    phoneNumber: r.phoneNumber || '1234567890',
    kioskDisplayName: r.kioskDisplayName || r.fullName,
    kioskPasscode: String(r.passcode || '0000').trim()
  }))
);

      addLog(`Loaded ${res.data.length} residents from API.`);
    } catch (err) {
      addLog("Failed to load residents from API. Using localStorage instead.");
    }
  };

  loadResidentsFromAPI();
    const client = mqtt.connect('wss://iot.ipfy.ca:8083', {
      username: 'reza',
      password: 'EgdfD#er!183!',
      clientId: `kiosk_client_${Math.random().toString(16).substring(2, 8)}`,
      reconnectPeriod: 5500, 
    });
    setMqttClient(client);
    setMqttStatus('Connecting...');
    addLog('MQTT: Attempting to connect to wss://iot.ipfy.ca:8083');

    client.on('connect', () => {
      setMqttStatus('Connected');
      addLog('MQTT: Connected successfully.');
      client.subscribe('door/relay/status', (err) => {
        if (!err) {
          addLog('MQTT: Subscribed to door/relay/status');
        } else {
          addLog(`MQTT: Subscription to door/relay/status failed: ${err.message}`);
        }
      });
    });

    client.on('error', (err) => {
      setMqttStatus('Error');
      addLog(`MQTT: Connection error: ${err.message}`);
    });

    client.on('reconnect', () => {
      setMqttStatus('Reconnecting...');
      addLog('MQTT: Reconnecting...');
    });

    client.on('close', () => {
      setMqttStatus('Disconnected');
      addLog('MQTT: Disconnected.');
    });
    
    client.on('offline', () => {
        setMqttStatus('Offline');
        addLog('MQTT: Client offline.');
    });

    client.on('message', (topic, message) => {
      const msgStr = message.toString();
      addLog(`MQTT: Received message on ${topic}: ${msgStr}`);
      if (topic === 'door/relay/status' && msgStr.includes('Relay ON')) {
        addLog('MQTT: Door opened command received (Relay ON).');
        
        let shouldShowConfirmedOpenModal = false;
        if (showStatusModal && statusModalContent.type === 'calling') {
            shouldShowConfirmedOpenModal = true; 
        } else if (!showStatusModal && !showKioskPasscodeModal && !showCallOptionsModal) {
            shouldShowConfirmedOpenModal = true;
        }

        if (shouldShowConfirmedOpenModal) {
             setStatusModalContent({ 
                title: t('doorOpenedModalTitle'), 
                subtext: t('doorOpenedModalSubtext'), 
                type: 'doorOpenedConfirmed' 
            });
            setShowStatusModal(true);
        }
        
        if (doorOpenedTimerRef.current) clearTimeout(doorOpenedTimerRef.current);
        doorOpenedTimerRef.current = setTimeout(() => {
          setShowStatusModal(false);
          resetKioskState(); 
        }, 5500);
      }
    });

    return () => {
      if (client) {
        addLog('MQTT: Cleaning up MQTT client.');
        client.end(true); 
      }
      if (doorOpenedTimerRef.current) clearTimeout(doorOpenedTimerRef.current);
    };
  }, [addLog, t, showStatusModal, statusModalContent.type, showKioskPasscodeModal, showCallOptionsModal]);
  
  useEffect(() => {
    resetIdleTimerKiosk();
    const activityEvents = ['click', 'keypress', 'touchstart', 'mousemove'];
    activityEvents.forEach(event => document.addEventListener(event, resetIdleTimerKiosk));
    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      activityEvents.forEach(event => document.removeEventListener(event, resetIdleTimerKiosk));
    };
  }, [resetIdleTimerKiosk]);


  const resetKioskState = () => {
    setSearchTerm('');
    setShowKioskPasscodeModal(false);
    setShowCallOptionsModal(false);
    setSelectedResident(null);
    setShowStatusModal(false);
    setStatusModalContent({ title: '', subtext: '', type: null });
  };

  const isCurrentlyDND = (resident) => {
    if (!resident.dndSettings || !resident.dndSettings.enabled) return false;
    if (!resident.dndSettings.scheduleActive) return true; 

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const parseTime = (timeStr) => { 
        if (!timeStr) return null;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const visibleFrom1 = parseTime(resident.dndSettings.workHoursStart1);
    const visibleTo1 = parseTime(resident.dndSettings.workHoursEnd1);
    const visibleFrom2 = parseTime(resident.dndSettings.workHoursStart2);
    const visibleTo2 = parseTime(resident.dndSettings.workHoursEnd2);

    let isWorkHour = false;
    if (visibleFrom1 !== null && visibleTo1 !== null && currentTime >= visibleFrom1 && currentTime < visibleTo1) {
        isWorkHour = true;
    }
    if (visibleFrom2 !== null && visibleTo2 !== null && currentTime >= visibleFrom2 && currentTime < visibleTo2) {
        isWorkHour = true;
    }
    
    return !isWorkHour; 
  };


  const filteredResidents = allResidents
    .map(r => ({ ...r, currentlyDND: isCurrentlyDND(r) }))
    .filter(r => {
        if (r.currentlyDND && r.dndSettings?.hideFromDirectory) {
            return false;
        }
        const searchLower = searchTerm.toLowerCase();
        const nameLower = (r.kioskDisplayName?.toLowerCase() || r.fullName.toLowerCase());
        return nameLower.includes(searchLower) || r.unitNumber.includes(searchLower);
    })
    .sort((a, b) => {
      const valA = sortBy === 'unit' ? a.unitNumber : (a.kioskDisplayName?.toLowerCase() || a.fullName.toLowerCase());
      const valB = sortBy === 'unit' ? b.unitNumber : (b.kioskDisplayName?.toLowerCase() || b.fullName.toLowerCase());
      let comparison = 0;
      if (valA > valB) comparison = 1;
      else if (valA < valB) comparison = -1;
      return sortOrder === 'asc' ? comparison : comparison * -1;
    });

  const handleSort = (field) => {
    resetIdleTimerKiosk();
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    addLog(`Sorted directory by ${field} (${sortOrder === 'asc' ? 'ascending' : 'descending'}).`);
  };
  
  const handleResidentSelect = (resident) => {
    resetIdleTimerKiosk();
    if (resident.currentlyDND && resident.dndSettings?.showDNDIcon) {
        addLog(`Selected resident ${resident.kioskDisplayName || resident.fullName} who is DND.`);
        toast({ title: resident.kioskDisplayName || resident.fullName, description: "Is currently in Do Not Disturb mode.", icon: <BellOff className="w-5 h-5 mr-2"/> });
        return;
    }
    setSelectedResident(resident);
    setShowCallOptionsModal(true);
    addLog(`Selected resident: ${resident.kioskDisplayName || resident.fullName} (Unit: ${resident.unitNumber})`);
  };

  const handleCallAction = (actionType) => {
    resetIdleTimerKiosk();
    if (!selectedResident && actionType !== 'callFrontDesk') { 
        addLog('Call action attempted without selecting a resident.');
        toast({ title: t('selectResident'), variant: "destructive" });
        return;
    }
    
    if (actionType === 'callFrontDesk') {
        addLog('Calling front desk.');
        setStatusModalContent({
            title: t('callingTitle') + " " + t('frontDesk'),
            subtext: t('connectingStatus'),
            type: 'calling' 
        });
        setShowStatusModal(true);
        return; 
    }

    addLog(`Initiating ${actionType} for ${selectedResident.kioskDisplayName || selectedResident.fullName}.`);
    
    if (actionType === 'voiceCall') {
      if (mqttClient && mqttClient.connected) {
        if (!selectedResident.phoneNumber) {
            addLog(`Error: Resident ${selectedResident.fullName} has no phone number.`);
            toast({ title: "Error", description: "Resident phone number is missing.", variant: "destructive"});
            return;
        }
        const topic = 'door/relay/call';
        const message = selectedResident.phoneNumber;
        
        setStatusModalContent({ 
            title: `${t('callingTitle')} ${selectedResident.kioskDisplayName || selectedResident.fullName}`,
            subtext: `${t('dialingUnitSubtext')} ${selectedResident.unitNumber}...`,
            type: 'calling'
        });
        setShowStatusModal(true);

        mqttClient.publish(topic, message, {}, (err) => {
          if (err) {
            addLog(`MQTT: Failed to publish call to ${topic}: ${err.message}`);
            toast({ title: "Call Failed", description: "Could not initiate call. Please try again.", variant: "destructive" });
            setShowStatusModal(false); 
          } else {
            addLog(`MQTT: Published call to ${topic} with number ${message.substring(0,3)}...`);
          }
        });
      } else {
        addLog('MQTT: Client not connected. Cannot initiate call.');
        toast({ title: "Connection Error", description: "Cannot connect to call service. Please try again later.", variant: "destructive" });
      }
    }
     else { 
      toast({ title: `${t(actionType)} ${selectedResident.kioskDisplayName || selectedResident.fullName}`, description: `${t('calling')} ${selectedResident.unitNumber}...` });
      setTimeout(() => resetKioskState(), 2000); 
    }
    setShowCallOptionsModal(false);
  };

  const handleCancelCall = () => {
    resetIdleTimerKiosk();
    setShowStatusModal(false);
    setStatusModalContent({ title: '', subtext: '', type: null });
    addLog('Call cancelled by user.');
  };

  const getStatusModalIcon = () => {
    switch(statusModalContent.type) {
        case 'calling':
            return <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-purple-400 animate-spin mx-auto" />;
        case 'doorOpenedConfirmed':
            return <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-400 mx-auto" />;
        default:
            return null;
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 text-white p-2 md:p-4 selection:bg-purple-500 selection:text-white" dir={direction}>
      <KioskPageHeader 
        language={language} 
        setLanguage={setLanguage} 
        direction={direction} 
        t={t} 
        mqttStatus={mqttStatus} 
        resetIdleTimerKiosk={resetIdleTimerKiosk}
        addLog={addLog}
        toast={toast}
      />

      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <ResidentDirectoryDisplay 
          residents={filteredResidents}
          onSelectResident={handleResidentSelect}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          sortOrder={sortOrder}
          handleSort={handleSort}
          t={t}
          resetIdleTimerKiosk={resetIdleTimerKiosk}
        />
        <KioskActionsPanel 
          onPasscodeEntry={() => setShowKioskPasscodeModal(true)}
          onCallFrontDesk={() => handleCallAction('callFrontDesk')}
          t={t}
          resetIdleTimerKiosk={resetIdleTimerKiosk}
        />
      </main>
      
      <SystemEventLogs logs={logs} logsEndRef={logsEndRef} />

      <KioskPasscodeEntryModal
        isOpen={showKioskPasscodeModal}
        onClose={() => {
          setShowKioskPasscodeModal(false);
          resetIdleTimerKiosk();
        }}
        mqttClient={mqttClient}
        addLog={addLog}
        resetIdleTimerKiosk={resetIdleTimerKiosk}
        t={t}
      />

      <Dialog open={showCallOptionsModal} onOpenChange={(isOpen) => { if(!isOpen) resetKioskState(); setShowCallOptionsModal(isOpen); resetIdleTimerKiosk();}}>
        <DialogContent className="bg-slate-800/80 backdrop-blur-lg border-teal-500/50 text-white shadow-2xl p-3 md:p-6 max-w-xs md:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl text-center font-semibold mb-1 md:mb-2">{t('callOptions')}</DialogTitle>
            {selectedResident && <p className="text-center text-base md:text-lg text-teal-300">{selectedResident.kioskDisplayName || selectedResident.fullName} - {t('unit')} {selectedResident.unitNumber}</p>}
          </DialogHeader>
          <div className="space-y-2 md:space-y-3 mt-3 md:mt-4">
            <Button className="w-full h-12 md:h-16 text-base md:text-lg bg-teal-600 hover:bg-teal-700" onClick={() => handleCallAction('voiceCall')}>
              <Phone className="mr-2 md:mr-3 w-5 h-5 md:w-6 md:h-6" /> {t('voiceCall')}
            </Button>
            <Button className="w-full h-12 md:h-16 text-base md:text-lg bg-sky-600 hover:bg-sky-700" onClick={() => handleCallAction('videoCall')}>
              <Video className="mr-2 md:mr-3 w-5 h-5 md:w-6 md:h-6" /> {t('videoCall')}
            </Button>
            <Button className="w-full h-12 md:h-16 text-base md:text-lg bg-amber-600 hover:bg-amber-700" onClick={() => handleCallAction('leaveMessage')}>
              <MessageSquare className="mr-2 md:mr-3 w-5 h-5 md:w-6 md:h-6" /> {t('leaveMessage')}
            </Button>
          </div>
          <DialogFooter className="mt-4 md:mt-6">
            <DialogClose asChild>
              <Button variant="outline" className="w-full bg-transparent hover:bg-white/10 border-white/30 text-white text-sm md:text-base py-2 md:py-2.5" onClick={() => resetIdleTimerKiosk()}>{t('close')}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {showStatusModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4"
            onClick={(e) => { 
                if(statusModalContent.type === 'doorOpenedConfirmed' && e.target === e.currentTarget) { 
                    setShowStatusModal(false); 
                    resetKioskState(); 
                    resetIdleTimerKiosk(); 
                }
            }}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-slate-800 text-white p-6 sm:p-8 rounded-xl shadow-2xl max-w-sm w-full text-center border border-purple-500/30"
            >
              <div className="space-y-4">
                {getStatusModalIcon()}
                <h2 className={`text-xl sm:text-2xl font-semibold ${statusModalContent.type === 'doorOpenedConfirmed' ? 'text-green-400' : 'text-white'}`}>
                  {statusModalContent.title}
                </h2>
                <p className="text-sm sm:text-base text-slate-300">{statusModalContent.subtext}</p>
                {statusModalContent.type === 'calling' && (
                  <Button variant="outline" onClick={handleCancelCall} className="mt-4 bg-transparent hover:bg-white/10 border-white/30 text-white w-full sm:w-auto">
                    {t('cancelCall')}
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KioskPage;