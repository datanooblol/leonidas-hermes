import { useState, useEffect, useCallback } from 'react';
import { Stage } from '@/types';

export const useTeleSaleSimulation = () => {
  const [currentStage, setCurrentStage] = useState<Stage>('Greet');
  const [isRecording, setIsRecording] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [progress, setProgress] = useState(0);

  const TOTAL_CYCLE_TIME = 15000;
  const UPDATE_INTERVAL = 50;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (showWarning) return prev;
          if (prev >= 100) {
            setIsRecording(false);
            setCurrentStage('Closing');
            return 100;
          }
          const increment = (100 / TOTAL_CYCLE_TIME) * UPDATE_INTERVAL; 
          const nextProgress = prev + increment;

          if (prev < 66.6 && nextProgress >= 66.6) {
             setShowWarning(true);
             return 66.6;
          }
          return nextProgress;
        });
      }, UPDATE_INTERVAL);
    }
    return () => clearInterval(interval);
  }, [isRecording, showWarning]);

  useEffect(() => {
    if (progress < 33.3 && currentStage !== 'Greet') setCurrentStage('Greet');
    else if (progress >= 33.3 && progress < 66.6 && currentStage !== 'Discover') setCurrentStage('Discover');
    else if (progress >= 66.6 && progress < 99.9 && currentStage !== 'Pitch') setCurrentStage('Pitch');
    else if (progress >= 99.9 && currentStage !== 'Closing') setCurrentStage('Closing');
  }, [progress]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      if (progress >= 100) {
        setProgress(0);
        setCurrentStage('Greet');
      }
    }
  }, [isRecording, progress]);

  const handleStageChange = useCallback((stage: Stage) => {
    let newProgress = 0;
    switch(stage) {
      case 'Greet': newProgress = 0; break;
      case 'Discover': newProgress = 34; break; 
      case 'Pitch': newProgress = 67; break; 
      case 'Closing': newProgress = 100; break;
    }
    setProgress(newProgress);
    setCurrentStage(stage);
    if (stage === 'Closing') setIsRecording(false);
    if (stage === 'Pitch') setShowWarning(true);
  }, []);

  // ✅ เพิ่มฟังก์ชันนี้
  const resetSimulation = useCallback(() => {
      setIsRecording(false);
      setProgress(0);
      setCurrentStage('Greet');
      setShowWarning(false);
  }, []);

  return {
    currentStage,
    isRecording,
    showWarning,
    setShowWarning,
    progress,
    toggleRecording,
    handleStageChange,
    resetSimulation // ✅ อย่าลืมส่งค่าออกไปตรงนี้
  };
};