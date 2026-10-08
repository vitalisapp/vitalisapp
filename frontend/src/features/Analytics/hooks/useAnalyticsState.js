import { useState, useRef } from 'react';

export const useAnalyticsState = () => {
  const [timeframe, setTimeframe]       = useState('Weekly');
  const [sleepHours, setSleepHours]     = useState(7);
  const [sleepQuality, setSleepQuality] = useState(7);
  const [waterIntake, setWaterIntake]   = useState(0);

  const [scatterData, setScatterData]   = useState([]);
  const [zones, setZones]               = useState([]);
  const [zonesLoading, setZonesLoading] = useState(false);

  const [saveStatus, setSaveStatus]     = useState('idle');

  const saveTimerRef = useRef(null);

  return {
    timeframe, setTimeframe,
    sleepHours, setSleepHours,
    sleepQuality, setSleepQuality,
    waterIntake, setWaterIntake,

    scatterData, setScatterData,
    zones, setZones,
    zonesLoading, setZonesLoading,

    saveStatus, setSaveStatus,
    saveTimerRef
  };
};