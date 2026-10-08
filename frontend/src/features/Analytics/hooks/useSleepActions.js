import { useEffect } from 'react';
import { saveSleepData } from '../services/sleepService.js';


export const useSleepActions = ({
  USER_ID,
  sleepHours,
  sleepQuality,
  waterIntake,
  sleepStatus,
  setSaveStatus,
  loadSleepAndScatter,
  saveTimerRef
}) => {

  const handleSaveSleep = async () => {
    setSaveStatus('saving');
    try {
      await saveSleepData(USER_ID, {
        sleep_duration:  sleepHours,
        sleep_quality:   sleepQuality,
        recovery_score:  sleepStatus.score,
        water_intake_ml: waterIntake,
      });

      setSaveStatus('saved');
      loadSleepAndScatter();

      saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      if (import.meta.env.DEV) console.error('Sleep save error:', err);
      setSaveStatus('error');

      saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  useEffect(() => {
    return () => clearTimeout(saveTimerRef.current);
  }, [saveTimerRef]);

  return { handleSaveSleep };
};