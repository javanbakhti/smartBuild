import React, { createContext, useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const TourContext = createContext();

export const useTour = () => useContext(TourContext);

export const TourProvider = ({ children }) => {
  const [currentTour, setCurrentTour] = useState(null); // { tourId: 'pageName', steps: [], currentStepIndex: 0 }
  const [isTourActive, setIsTourActive] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState(null); // DOM element
  const navigate = useNavigate();

  const startTour = useCallback((tourId, steps) => {
    const tourSeen = localStorage.getItem(`tourSeen_${tourId}`);
    if (tourSeen) {
      return; // Don't start if already seen
    }

    setCurrentTour({
      tourId,
      steps,
      currentStepIndex: 0,
    });
    setIsTourActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (!currentTour) return;

    if (highlightedElement) {
      highlightedElement.classList.remove('tour-highlight');
      setHighlightedElement(null);
    }

    const nextIndex = currentTour.currentStepIndex + 1;
    if (nextIndex < currentTour.steps.length) {
      const nextStepDetails = currentTour.steps[nextIndex];
      if (nextStepDetails.navigateTo) {
        navigate(nextStepDetails.navigateTo);
      }
      // Delay highlighting slightly to allow navigation to complete if needed
      setTimeout(() => {
        if (nextStepDetails.targetId) {
          const element = document.getElementById(nextStepDetails.targetId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            element.classList.add('tour-highlight');
            setHighlightedElement(element);
          }
        }
      }, nextStepDetails.navigateTo ? 300 : 50); 

      setCurrentTour(prev => ({ ...prev, currentStepIndex: nextIndex }));
    } else {
      // End tour
      setIsTourActive(false);
      localStorage.setItem(`tourSeen_${currentTour.tourId}`, 'true');
      setCurrentTour(null);
    }
  }, [currentTour, navigate, highlightedElement]);

  const previousStep = useCallback(() => {
    if (!currentTour || currentTour.currentStepIndex === 0) return;

    if (highlightedElement) {
      highlightedElement.classList.remove('tour-highlight');
      setHighlightedElement(null);
    }
    
    const prevIndex = currentTour.currentStepIndex - 1;
    const prevStepDetails = currentTour.steps[prevIndex];

    if (prevStepDetails.navigateTo) {
      navigate(prevStepDetails.navigateTo);
    }
    setTimeout(() => {
      if (prevStepDetails.targetId) {
        const element = document.getElementById(prevStepDetails.targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
          element.classList.add('tour-highlight');
          setHighlightedElement(element);
        }
      }
    }, prevStepDetails.navigateTo ? 300 : 50);

    setCurrentTour(prev => ({ ...prev, currentStepIndex: prevIndex }));
  }, [currentTour, navigate, highlightedElement]);

  const endTour = useCallback(() => {
    if (highlightedElement) {
      highlightedElement.classList.remove('tour-highlight');
      setHighlightedElement(null);
    }
    if (currentTour) {
      localStorage.setItem(`tourSeen_${currentTour.tourId}`, 'true');
    }
    setIsTourActive(false);
    setCurrentTour(null);
  }, [currentTour, highlightedElement]);

  const value = {
    currentTour,
    isTourActive,
    startTour,
    nextStep,
    previousStep,
    endTour,
    setHighlightedElement, // To allow PageTour component to clear highlight on unmount
  };

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  );
};