import React, { useState, useEffect, useRef } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Progress } from '@/components/ui/progress';
    import { X, ChevronLeft, ChevronRight, Lightbulb, CheckCircle } from 'lucide-react';

    const tutorialSteps = [
      {
        id: 'welcome',
        title: 'Welcome to Smart Intercom!',
        description: "Let's take a quick tour of the key features to get you started.",
        targetId: null, 
        placement: 'center',
      },
      {
        id: 'building-setup',
        title: 'Building Setup',
        description: 'Start by configuring your building details, floors, and manager information here. This is crucial for the system to function correctly.',
        targetId: 'nav-building-setup',
        placement: 'right',
      },
      {
        id: 'manage-units',
        title: 'Manage Units',
        description: 'Define individual units within your building. You can auto-generate them based on floor/unit counts or add them manually.',
        targetId: 'nav-manage-units',
        placement: 'right',
      },
      {
        id: 'manage-doors',
        title: 'Manage Doors',
        description: 'Set up and manage all access points like main entrances, garage gates, and service doors.',
        targetId: 'nav-manage-doors',
        placement: 'right',
      },
      {
        id: 'manage-devices',
        title: 'Manage Devices',
        description: 'Register your intercom devices (kiosks, keypads) and assign them to control specific doors.',
        targetId: 'nav-manage-devices',
        placement: 'right',
      },
      {
        id: 'manage-visitors',
        title: 'Manage Visitors',
        description: 'Pre-authorize visitors, generate temporary passcodes, and track visitor entries.',
        targetId: 'nav-manage-visitors',
        placement: 'right',
      },
      {
        id: 'kiosk-settings',
        title: 'Kiosk Settings',
        description: 'Configure the Kiosk interface, including access credentials and security options.',
        targetId: 'nav-kiosk-settings',
        placement: 'right',
      },
      {
        id: 'privacy-security',
        title: 'Privacy & Security',
        description: "Manage your account's security settings, including changing your password. You'll find the 'Change Password' option on this page.",
        targetId: 'nav-settings-privacy', 
        placement: 'right',
        navigateTo: '/manager/settings/privacy-security',
      },
      {
        id: 'end-tour',
        title: 'Tour Complete!',
        description: "You're all set! Explore the system and don't hesitate to check the 'Support & Help' section if you need assistance.",
        targetId: null,
        placement: 'center',
      }
    ];

    const InteractiveGuide = ({ onComplete, onShowLater, navigate }) => {
      const [currentStepIndex, setCurrentStepIndex] = useState(0);
      const [isVisible, setIsVisible] = useState(true);
      const [tooltipPosition, setTooltipPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
      const targetRef = useRef(null);

      const currentStep = tutorialSteps[currentStepIndex];
      const progressPercentage = ((currentStepIndex + 1) / tutorialSteps.length) * 100;

      useEffect(() => {
        if (!currentStep || !isVisible) return;

        if (currentStep.navigateTo && navigate) {
            navigate(currentStep.navigateTo);
        }

        if (currentStep.targetId) {
          const targetElement = document.getElementById(currentStep.targetId);
          if (targetElement) {
            targetRef.current = targetElement;
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            
            const rect = targetElement.getBoundingClientRect();
            let newPos = {};

            switch (currentStep.placement) {
              case 'top':
                newPos = { top: rect.top - 10, left: rect.left + rect.width / 2, transform: 'translate(-50%, -100%)' };
                break;
              case 'bottom':
                newPos = { top: rect.bottom + 10, left: rect.left + rect.width / 2, transform: 'translate(-50%, 0)' };
                break;
              case 'left':
                newPos = { top: rect.top + rect.height / 2, left: rect.left - 10, transform: 'translate(-100%, -50%)' };
                break;
              case 'right':
              default:
                newPos = { top: rect.top + rect.height / 2, left: rect.right + 10, transform: 'translate(0, -50%)' };
                break;
            }
            setTooltipPosition(newPos);
            targetElement.classList.add('tutorial-highlight');
          } else {
             setTooltipPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }); // Fallback to center
          }
        } else {
          targetRef.current = null;
          setTooltipPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
        }
        
        return () => {
          if (targetRef.current) {
            targetRef.current.classList.remove('tutorial-highlight');
          }
        };
      }, [currentStepIndex, currentStep, isVisible, navigate]);

      const handleNext = () => {
        if (targetRef.current) targetRef.current.classList.remove('tutorial-highlight');
        if (currentStepIndex < tutorialSteps.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
        } else {
          handleComplete();
        }
      };

      const handlePrevious = () => {
        if (targetRef.current) targetRef.current.classList.remove('tutorial-highlight');
        if (currentStepIndex > 0) {
          setCurrentStepIndex(prev => prev - 1);
        }
      };

      const handleComplete = () => {
        if (targetRef.current) targetRef.current.classList.remove('tutorial-highlight');
        setIsVisible(false);
        onComplete();
      };

      const handleSkip = () => {
        if (targetRef.current) targetRef.current.classList.remove('tutorial-highlight');
        setIsVisible(false);
        onShowLater();
      };

      if (!isVisible || !currentStep) return null;

      const isFinalStep = currentStepIndex === tutorialSteps.length - 1;

      return (
        <>
          <div className="fixed inset-0 bg-black/70 z-[1000] backdrop-blur-sm" onClick={handleSkip}></div>
          
          <style>{`
            .tutorial-highlight {
              outline: 3px solid #6366F1; /* Indigo-500 */
              box-shadow: 0 0 0 9999px rgba(0,0,0,0.0), 0 0 15px rgba(99, 102, 241, 0.7); /* Soft glow, clear overlay part */
              border-radius: 0.375rem; /* rounded-md */
              position: relative;
              z-index: 1001; /* Ensure target is above the dark overlay but below tooltip */
              transition: outline 0.3s ease, box-shadow 0.3s ease;
            }
          `}</style>

          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed z-[1001] p-6 bg-background dark:bg-slate-800 shadow-2xl rounded-lg border border-border dark:border-slate-700 w-full max-w-md"
            style={tooltipPosition}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold text-primary dark:text-purple-400 flex items-center">
                {currentStep.id === 'end-tour' ? <CheckCircle className="mr-2 h-6 w-6" /> : <Lightbulb className="mr-2 h-6 w-6" />}
                {currentStep.title}
              </h3>
              <Button variant="ghost" size="icon" onClick={handleSkip} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground dark:text-gray-300 mb-4">{currentStep.description}</p>
            
            <Progress value={progressPercentage} className="mb-4 h-2 bg-primary/20 dark:bg-purple-500/30" />
            <p className="text-xs text-muted-foreground text-center mb-4">
              Step {currentStepIndex + 1} of {tutorialSteps.length}
            </p>

            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={handlePrevious} disabled={currentStepIndex === 0} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700">
                <ChevronLeft className="mr-1 h-4 w-4" /> Previous
              </Button>
              <Button onClick={handleSkip} variant="link" className="text-xs text-muted-foreground hover:text-primary">
                Show Later
              </Button>
              <Button onClick={handleNext} className="bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-purple-600 dark:hover:bg-purple-700">
                {isFinalStep ? 'Finish Tour' : 'Next'} <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </>
      );
    };

    export default InteractiveGuide;