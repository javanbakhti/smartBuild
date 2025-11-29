import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import { useTour } from '@/contexts/TourContext';

const PageTour = () => {
  const { currentTour, isTourActive, nextStep, previousStep, endTour, setHighlightedElement } = useTour();
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!isTourActive || !currentTour || !currentTour.steps[currentTour.currentStepIndex]) {
      return;
    }

    const currentStepDetails = currentTour.steps[currentTour.currentStepIndex];
    
    if (currentStepDetails.targetId) {
      const targetElement = document.getElementById(currentStepDetails.targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        targetElement.classList.add('tour-highlight');
        setHighlightedElement(targetElement); // Store the highlighted element in context

        const rect = targetElement.getBoundingClientRect();
        const tooltip = tooltipRef.current;
        if (tooltip) {
          let top = rect.bottom + 10; // Default bottom
          let left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2;

          if (currentStepDetails.placement === 'top') {
            top = rect.top - tooltip.offsetHeight - 10;
          } else if (currentStepDetails.placement === 'left') {
            left = rect.left - tooltip.offsetWidth - 10;
            top = rect.top + rect.height / 2 - tooltip.offsetHeight / 2;
          } else if (currentStepDetails.placement === 'right') {
            left = rect.right + 10;
            top = rect.top + rect.height / 2 - tooltip.offsetHeight / 2;
          }

          // Adjust if out of bounds
          if (left < 0) left = 10;
          if (top < 0) top = 10;
          if (left + tooltip.offsetWidth > window.innerWidth) left = window.innerWidth - tooltip.offsetWidth - 10;
          if (top + tooltip.offsetHeight > window.innerHeight) top = window.innerHeight - tooltip.offsetHeight - 10;
          
          tooltip.style.top = `${top}px`;
          tooltip.style.left = `${left}px`;
          tooltip.style.position = 'fixed'; // Ensure it's fixed relative to viewport
        }
      } else {
        // Fallback if targetId not found - center tooltip
        if (tooltipRef.current) {
            tooltipRef.current.style.top = '50%';
            tooltipRef.current.style.left = '50%';
            tooltipRef.current.style.transform = 'translate(-50%, -50%)';
            tooltipRef.current.style.position = 'fixed';
        }
      }
    } else {
        // Center tooltip if no targetId (e.g., welcome/end steps)
        if (tooltipRef.current) {
            tooltipRef.current.style.top = '50%';
            tooltipRef.current.style.left = '50%';
            tooltipRef.current.style.transform = 'translate(-50%, -50%)';
            tooltipRef.current.style.position = 'fixed';
        }
    }
    
    // Cleanup function to remove highlight when component unmounts or step changes
    return () => {
      const highlightedEl = document.querySelector('.tour-highlight');
      if (highlightedEl) {
        highlightedEl.classList.remove('tour-highlight');
      }
      setHighlightedElement(null); // Clear from context
    };
  }, [currentTour, isTourActive, setHighlightedElement]);


  if (!isTourActive || !currentTour) {
    return null;
  }

  const step = currentTour.steps[currentTour.currentStepIndex];
  const isFirstStep = currentTour.currentStepIndex === 0;
  const isLastStep = currentTour.currentStepIndex === currentTour.steps.length - 1;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[9990] backdrop-blur-sm" onClick={endTour}></div>
      <motion.div
        ref={tooltipRef}
        key={step.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="fixed z-[9999] p-5 bg-background dark:bg-slate-800 shadow-xl rounded-lg border border-border dark:border-slate-700 w-full max-w-sm"
        // Position will be set by useEffect
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-primary dark:text-purple-400 flex items-center">
            <Lightbulb className="mr-2 h-5 w-5" />
            {step.title}
          </h3>
          <Button variant="ghost" size="icon" onClick={endTour} className="text-muted-foreground hover:text-foreground h-7 w-7">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground dark:text-gray-300 mb-3">{step.description}</p>
        <div className="flex justify-between items-center mt-3">
          <Button variant="outline" onClick={previousStep} disabled={isFirstStep} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-slate-700 text-xs px-3 py-1.5 h-auto">
            <ChevronLeft className="mr-1 h-3 w-3" /> Prev
          </Button>
          <span className="text-xs text-muted-foreground">
            {currentTour.currentStepIndex + 1} / {currentTour.steps.length}
          </span>
          <Button onClick={nextStep} className="bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-purple-600 dark:hover:bg-purple-700 text-xs px-3 py-1.5 h-auto">
            {isLastStep ? 'Finish' : 'Next'} <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </motion.div>
    </>
  );
};

export default PageTour;