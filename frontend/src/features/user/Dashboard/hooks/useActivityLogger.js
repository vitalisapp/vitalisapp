import { apiGet, apiPost } from '../../../../lib/apiClient.js';
import { useToastStore } from '../../../../stores/toastStore.js';
import { localTodayIso } from '../lib/dashboardFormat.js';

export const useActivityLogger = (
  USER_ID,
  { setData, generateAiInsight = undefined, generateFitnessInsight, generateClinicalInsight = undefined, mergeData }
) => {
  const generateInsight = generateAiInsight || generateFitnessInsight || generateClinicalInsight;

  const handleLogActivity = async (formData = {}) => {
    try {
      const calories = formData.calories ? parseInt(formData.calories) : 0;
      const steps    = formData.steps    ? parseInt(formData.steps)    : 0;
      const minutes  = formData.minutes  ? parseInt(formData.minutes)  : 0;

      if (!(calories > 0 || steps > 0 || minutes > 0)) return;

      await apiPost(`/api/logs/${USER_ID}`, { calories, steps, minutes });

      const updatedData = await apiGet(`/api/dashboard/${USER_ID}?today=${localTodayIso()}`);
      setData(mergeData(updatedData));

      if (typeof generateInsight === 'function') {
        generateInsight(updatedData.stats);
      }

    } catch (error) {
      useToastStore.getState().addToast('Could not log activity. Please try again.', 'error');
      if (import.meta.env.DEV) console.error('Error logging activity:', error);
    }
  };

  return { handleLogActivity };
};