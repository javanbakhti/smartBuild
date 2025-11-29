import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff, UserCircle, DoorOpen } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const CallPage = () => {
  const { unitId } = useParams(); // unitId could be 'frontdesk', 'visitor-gate', or an actual unit number
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callStatus, setCallStatus] = useState('connecting'); // 'connecting', 'ringing', 'active', 'ended'
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const callerName = unitId === 'frontdesk' ? 'Front Desk' : unitId === 'visitor-gate' ? 'Visitor Gate' : `Unit ${unitId}`;

  useEffect(() => {
    // Simulate call connection
    setTimeout(() => setCallStatus('ringing'), 1500);
    setTimeout(() => {
      setCallStatus('active');
      startCallTimer();
      // Attempt to get user media
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then(stream => {
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
            // In a real WebRTC call, you'd send this stream to the peer
            // and receive their stream for remoteVideoRef.current.srcObject
            toast({ title: "Media Access", description: "Camera and microphone accessed." });
          })
          .catch(err => {
            console.error("Error accessing media devices.", err);
            toast({ title: "Media Error", description: "Could not access camera/microphone. Video call features limited.", variant: "destructive" });
            setIsCameraOff(true); // Assume camera off if error
          });
      } else {
        toast({ title: "Unsupported", description: "Your browser doesn't support video calls.", variant: "destructive" });
      }
    }, 3000);

    return () => {
      clearInterval(timerRef.current);
      // Clean up media stream
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCallTimer = () => {
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleToggleMic = () => {
    setIsMicMuted(!isMicMuted);
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getAudioTracks().forEach(track => track.enabled = isMicMuted);
    }
    toast({ title: isMicMuted ? "Microphone Unmuted" : "Microphone Muted" });
  };

  const handleToggleCamera = () => {
    setIsCameraOff(!isCameraOff);
     if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getVideoTracks().forEach(track => track.enabled = isCameraOff);
    }
    toast({ title: isCameraOff ? "Camera On" : "Camera Off" });
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    clearInterval(timerRef.current);
    toast({ title: "Call Ended", description: `Call with ${callerName} ended.` });
    setTimeout(() => navigate(-1), 1500); // Go back to previous page
  };
  
  const handleOpenDoor = () => {
    toast({ title: "Door Opened", description: `Door access granted for ${callerName}. (Simulated)` });
    // In a real app, this would send a command to the intercom system
  };

  return (
    <Layout role={JSON.parse(localStorage.getItem('user'))?.role || 'resident'}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center h-full p-4"
      >
        <Card className="w-full max-w-2xl shadow-2xl dark:bg-slate-800">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold dark:text-white">Call with {callerName}</CardTitle>
            <p className="text-muted-foreground">
              {callStatus === 'active' ? `Duration: ${formatDuration(callDuration)}` : callStatus.charAt(0).toUpperCase() + callStatus.slice(1) + '...'}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 aspect-[16/9] md:aspect-auto">
              <div className="bg-slate-900 rounded-lg overflow-hidden relative flex items-center justify-center">
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" muted={callStatus !== 'active'}></video>
                {!remoteVideoRef.current?.srcObject && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                    <UserCircle size={64} />
                    <p className="mt-2">{callerName}</p>
                  </div>
                )}
                 <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">{callerName}</div>
              </div>
              <div className="bg-slate-700 rounded-lg overflow-hidden relative flex items-center justify-center">
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]"></video>
                 {isCameraOff && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 bg-slate-800">
                    <VideoOff size={64} />
                    <p className="mt-2">Camera Off</p>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">You</div>
              </div>
            </div>

            <div className="flex justify-center space-x-4 pt-4">
              <Button variant="outline" size="lg" onClick={handleToggleMic} className={`neumorphism-button dark:neumorphism-button ${isMicMuted ? 'border-yellow-500 text-yellow-500' : 'dark:text-gray-300'}`}>
                {isMicMuted ? <MicOff size={24} /> : <Mic size={24} />}
                <span className="sr-only">{isMicMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
              </Button>
              <Button variant="outline" size="lg" onClick={handleToggleCamera} className={`neumorphism-button dark:neumorphism-button ${isCameraOff ? 'border-yellow-500 text-yellow-500' : 'dark:text-gray-300'}`}>
                {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
                <span className="sr-only">{isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}</span>
              </Button>
              {(unitId === 'visitor-gate' || callerName.toLowerCase().includes('visitor')) && (
                 <Button variant="outline" size="lg" onClick={handleOpenDoor} className="neumorphism-button dark:neumorphism-button text-green-500 border-green-500">
                    <DoorOpen size={24} />
                    <span className="ml-2 hidden sm:inline">Open Door</span>
                 </Button>
              )}
              <Button variant="destructive" size="lg" onClick={handleEndCall} className="neumorphism-button bg-red-500 hover:bg-red-600 text-white border-none">
                <PhoneOff size={24} />
                 <span className="ml-2 hidden sm:inline">End Call</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Layout>
  );
};

export default CallPage;