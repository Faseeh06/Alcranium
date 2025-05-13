import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

// Define types for our time tracking data
export interface DailyUsage {
  date: string; // ISO string date (YYYY-MM-DD)
  hours: number;
  minutes: number;
  totalMinutes: number; // Total minutes for easier calculations
}

export interface WeeklyUsage {
  [key: string]: DailyUsage; // Map of date strings to daily usage
}

interface TimeTrackingContextType {
  currentSessionStart: Date | null;
  currentSessionDuration: number; // in minutes
  todayUsage: DailyUsage;
  weeklyUsage: WeeklyUsage;
  startTracking: () => void;
  stopTracking: () => void;
  isTracking: boolean;
  resetAllData: () => void;
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined);

// Format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Get empty daily usage object for a given date
const getEmptyDailyUsage = (date: Date): DailyUsage => {
  return {
    date: formatDate(date),
    hours: 0,
    minutes: 0,
    totalMinutes: 0
  };
};

// Check if two dates are on the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDate(date1) === formatDate(date2);
};

// Provider component
export const TimeTrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSessionStart, setCurrentSessionStart] = useState<Date | null>(null);
  const [currentSessionDuration, setCurrentSessionDuration] = useState<number>(0);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [weeklyUsage, setWeeklyUsage] = useState<WeeklyUsage>(() => {
    // Try to load from localStorage on init
    const savedData = localStorage.getItem('weeklyUsage');
    return savedData ? JSON.parse(savedData) : {};
  });
  
  // Create refs for tracking the current day
  const lastSaveRef = useRef<number>(Date.now());
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentDayRef = useRef<string>(formatDate(new Date()));
  
  // Get today's date and formatted string - recomputed each render
  const today = new Date();
  const todayString = formatDate(today);
  
  // Initialize today's usage data - should be reset to 0 for a new day
  const [todayUsage, setTodayUsage] = useState<DailyUsage>(() => {
    // Check if we have existing data for today
    if (weeklyUsage[todayString]) {
      return weeklyUsage[todayString];
    }
    // Create new empty usage data for today
    return getEmptyDailyUsage(today);
  });

  // Reset all time tracking data
  const resetAllData = () => {
    // Stop any active tracking
    if (isTracking) {
      stopTracking();
    }
    
    // Clear localStorage
    localStorage.removeItem('weeklyUsage');
    
    // Reset state
    const emptyUsage = getEmptyDailyUsage(new Date());
    setWeeklyUsage({});
    setTodayUsage(emptyUsage);
    setCurrentSessionDuration(0);
    
    // If tracking was active, restart it
    if (isTracking) {
      setCurrentSessionStart(new Date());
    }
    
    console.log('All time tracking data has been reset');
  };

  // Check for day change and update references
// Check for day change and update references
useEffect(() => {
  if (currentDayRef.current !== todayString) {
    console.log(`Day changed from ${currentDayRef.current} to ${todayString}`);
    
    // Save pending session data for the previous day
    if (isTracking) {
      stopTracking();
    }
    
    // Create brand new usage data for the new day
    const newDayUsage = getEmptyDailyUsage(today);
    
    // Save new empty day usage to weekly data
    setWeeklyUsage(prev => ({
      ...prev,
      [todayString]: newDayUsage
    }));
    
    // Update today's usage to empty for the new day
    setTodayUsage(newDayUsage);
    
    // Update current day reference to the new day
    currentDayRef.current = todayString;
    
    // If tracking is active, restart the session for the new day
    if (isTracking) {
      setCurrentSessionStart(new Date());
      setCurrentSessionDuration(0);
    }
  }
}, [todayString, isTracking]);


  // Save to localStorage whenever weekly usage changes
  useEffect(() => {
    localStorage.setItem('weeklyUsage', JSON.stringify(weeklyUsage));
  }, [weeklyUsage]);

  // Start tracking time
  const startTracking = () => {
    if (!isTracking) {
      const now = new Date();
      setCurrentSessionStart(now);
      setIsTracking(true);
      
      // Start the save interval when tracking begins
      if (saveIntervalRef.current === null) {
        saveIntervalRef.current = setInterval(() => {
          updateUsageData();
        }, 10000); // Save data every 10 seconds
      }
    }
  };

  // Update usage data without stopping tracking
  const updateUsageData = () => {
    if (currentSessionStart && isTracking) {
      const now = new Date();
      
      // Check if the day has changed during this session
      const sessionStartDay = formatDate(currentSessionStart);
      const currentDay = formatDate(now);
      
      if (sessionStartDay !== currentDay) {
        // Day changed during tracking - handle special case
        console.log(`Day changed during active session from ${sessionStartDay} to ${currentDay}`);
        
        // First, calculate time until midnight for the previous day
        const midnight = new Date(sessionStartDay);
        midnight.setDate(midnight.getDate() + 1);
        midnight.setHours(0, 0, 0, 0);
        
        const minutesUntilMidnight = Math.floor((midnight.getTime() - currentSessionStart.getTime()) / 60000);
        
        // Update previous day usage with time until midnight
        if (minutesUntilMidnight > 0) {
          const prevDayUsage = weeklyUsage[sessionStartDay] || getEmptyDailyUsage(currentSessionStart);
          const updatedPrevDayUsage = {
            ...prevDayUsage,
            totalMinutes: prevDayUsage.totalMinutes + minutesUntilMidnight,
            hours: Math.floor((prevDayUsage.totalMinutes + minutesUntilMidnight) / 60),
            minutes: (prevDayUsage.totalMinutes + minutesUntilMidnight) % 60
          };
          
          setWeeklyUsage(prev => ({
            ...prev,
            [sessionStartDay]: updatedPrevDayUsage
          }));
        }
        
        // For the new day, create new empty usage data, not carrying over minutes
        const newDayUsage = getEmptyDailyUsage(now);
        
        // Calculate minutes since midnight for the current day
        const minutesSinceMidnight = Math.floor((now.getTime() - midnight.getTime()) / 60000);
        
        // Only add minutes since midnight to the new day's usage
        if (minutesSinceMidnight > 0) {
          newDayUsage.totalMinutes = minutesSinceMidnight;
          newDayUsage.hours = Math.floor(minutesSinceMidnight / 60);
          newDayUsage.minutes = minutesSinceMidnight % 60;
        }
        
        // Save new day's usage data
        setWeeklyUsage(prev => ({
          ...prev,
          [currentDay]: newDayUsage
        }));
        
        // If this is today, update todayUsage to the new empty usage plus any time today
        if (currentDay === todayString) {
          setTodayUsage(newDayUsage);
        }
        
        // Reset session start to current time
        setCurrentSessionStart(now);
        setCurrentSessionDuration(0);
        return;
      }
      
      // Normal case - same day
      const durationMs = now.getTime() - currentSessionStart.getTime();
      const durationMinutes = Math.max(Math.floor(durationMs / 60000), 1); // At least 1 minute if active
      
      // Only update if some time has passed
      if (durationMinutes > 0) {
        // Update today's usage
        const updatedTodayUsage = {
          ...todayUsage,
          totalMinutes: todayUsage.totalMinutes + durationMinutes,
          hours: Math.floor((todayUsage.totalMinutes + durationMinutes) / 60),
          minutes: (todayUsage.totalMinutes + durationMinutes) % 60
        };
        
        setTodayUsage(updatedTodayUsage);
        
        // Update weekly usage
        setWeeklyUsage(prev => ({
          ...prev,
          [todayString]: updatedTodayUsage
        }));
        
        // Reset session start to current time to avoid double counting
        setCurrentSessionStart(now);
        setCurrentSessionDuration(0);
      }
    }
  };

  // Stop tracking time and update usage
  const stopTracking = () => {
    if (isTracking) {
      updateUsageData();
      setIsTracking(false);
      setCurrentSessionStart(null);
      
      // Clear the save interval when tracking stops
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = null;
      }
    }
  };

  // Auto-track when component mounts/unmounts
  useEffect(() => {
    startTracking();
    
    // Handle beforeunload to save tracking data when user closes the page
    const handleBeforeUnload = () => {
      updateUsageData();
      localStorage.setItem('weeklyUsage', JSON.stringify(weeklyUsage));
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Clean up on unmount
    return () => {
      stopTracking();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Track visibility changes to detect when user switches tabs or minimizes window
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When becoming visible, check if the day has changed
        const currentDay = formatDate(new Date());
        if (currentDayRef.current !== currentDay) {
          // Day has changed while window was not visible
          // This will be handled by the day change useEffect
          // Just update the reference to trigger that effect
          currentDayRef.current = currentDay;
        }
        startTracking();
      } else {
        stopTracking();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Periodically update the current session duration without saving
  // Periodically update the current session duration without saving
  useEffect(() => {
    if (!isTracking || !currentSessionStart) return;

    const updateIntervalId = setInterval(() => {
      const now = new Date();
      
      if (!isSameDay(now, currentSessionStart)) {
        updateUsageData(); // This already handles day rollover
      } else {
        const durationMs = now.getTime() - currentSessionStart.getTime();
        const durationMinutes = Math.floor(durationMs / 60000);
        setCurrentSessionDuration(durationMinutes);
      }
    }, 1000 * 60); // update every minute

    return () => clearInterval(updateIntervalId);
  }, [isTracking, currentSessionStart]);


  // Periodically check for day changes (at midnight)
  useEffect(() => {
    const checkDayChangeIntervalId = setInterval(() => {
      const now = new Date();
      const currentDay = formatDate(now);
      
      // If the day has changed, update tracking
      if (currentDay !== currentDayRef.current) {
        console.log(`Day changed to ${currentDay} during interval check`);
        
        // Create empty new day usage data
        const newDayUsage = getEmptyDailyUsage(now);
        
        // Save new empty day usage to weekly data
        setWeeklyUsage(prev => ({
          ...prev,
          [currentDay]: newDayUsage
        }));
        
        // Update today's usage to empty for new day
        if (currentDay === todayString) {
          setTodayUsage(newDayUsage);
        }
        
        // Update the current day reference
        currentDayRef.current = currentDay;
        
        // If tracking is active, handle day change
        if (isTracking) {
          updateUsageData();
          
          // Reset session to start fresh on the new day
          setCurrentSessionStart(now);
          setCurrentSessionDuration(0);
        }
      }
    }, 30000); // Check every 30 seconds for faster detection

    return () => clearInterval(checkDayChangeIntervalId);
  }, [weeklyUsage, isTracking, todayString]);

  // Value provided by the context
  const value = {
    currentSessionStart,
    currentSessionDuration,
    todayUsage,
    weeklyUsage,
    startTracking,
    stopTracking,
    isTracking,
    resetAllData
  };

  return (
    <TimeTrackingContext.Provider value={value}>
      {children}
    </TimeTrackingContext.Provider>
  );
};

// Custom hook to use the time tracking context
export const useTimeTracking = () => {
  const context = useContext(TimeTrackingContext);
  if (context === undefined) {
    throw new Error('useTimeTracking must be used within a TimeTrackingProvider');
  }
  return context;
}; 