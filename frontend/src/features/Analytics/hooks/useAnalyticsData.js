import { useEffect } from 'react';
import { fetchZonesFromAPI, fetchScatterData, fetchTodaySleep, DEFAULT_ZONES } from '../services/sleepService.js';

export const useAnalyticsData = ({
  USER_ID,
  timeframe,
  setZones,
  setZonesLoading,
  setScatterData,
  setSleepHours,
  setSleepQuality,
  setWaterIntake
}) => {

  const loadZones = async () => {
    setZonesLoading(true);
    try {
      const data = await fetchZonesFromAPI(USER_ID, timeframe);
      setZones(data);
    } catch (err) {
      if (import.meta.env.DEV) console.error('[Zones] Fetch error:', err);
      setZones(DEFAULT_ZONES);
    } finally {
      setZonesLoading(false);
    }
  };

  const loadSleepAndScatter = async () => {
    try {
      const [scatterRaw, todayData] = await Promise.all([
        fetchScatterData(USER_ID, timeframe),
        fetchTodaySleep(USER_ID),
      ]);

      setScatterData(scatterRaw);

      if (todayData?.sleep_duration) {
        setSleepHours(parseFloat(todayData.sleep_duration));
        if (todayData.sleep_quality)
          setSleepQuality(todayData.sleep_quality);
        if (todayData.water_intake_ml !== undefined)
          setWaterIntake(todayData.water_intake_ml);
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error('Fetch error:', err);
    }
  };

  // load* are re-created per render; listing them would refetch in a loop.
  // They only depend on USER_ID/timeframe below.
  useEffect(() => {
    if (!USER_ID) return;
    loadSleepAndScatter();
    loadZones();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe, USER_ID]);

  // FIX: expose these so callers (e.g. the Sync button) can trigger a
  // manual refresh after a save, instead of only refetching on mount/timeframe change.
  return { loadZones, loadSleepAndScatter };
};