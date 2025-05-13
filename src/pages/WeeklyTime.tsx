import { useState, useEffect } from "react";
import { useTimeTracking, DailyUsage } from "@/contexts/TimeTrackingContext";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns";
import { Clock, Calendar, Activity, RefreshCw, AlertTriangle } from "lucide-react";

// Format minutes to hours and minutes string
const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

// Get days of current week
const getDaysOfWeek = () => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start with Monday
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    return {
      date,
      label: format(date, 'EEE'),
      fullDate: format(date, 'yyyy-MM-dd')
    };
  });
};

// Define types for our chart data
interface ChartDataItem {
  day: string;
  date: string;
  minutes: number;
  hours: number;
  isToday: boolean;
}

// Define types for tooltip props
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataItem;
    value?: number;
    dataKey?: string;
  }>;
  label?: string;
}

// Define types for bar shape props
interface BarShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  isToday?: boolean;
}

const WeeklyTime = () => {
  const { weeklyUsage, todayUsage, isTracking, currentSessionDuration, resetAllData } = useTimeTracking();
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Get current date in YYYY-MM-DD format for today's checking
  const todayDate = format(new Date(), 'yyyy-MM-dd');
  
  useEffect(() => {
    const weekDays = getDaysOfWeek();
    
    // Create chart data with all days of the week
    const data = weekDays.map(day => {
      // Find usage data for this day if it exists
      const usage = Object.values(weeklyUsage).find(usage => 
        usage.date === day.fullDate
      );
      
      const isToday = day.fullDate === todayDate;
      
      return {
        day: day.label,
        date: day.fullDate,
        minutes: usage ? usage.totalMinutes : 0,
        hours: usage ? usage.totalMinutes / 60 : 0,
        isToday
      };
    });
    
    setChartData(data);
  }, [weeklyUsage, todayDate]);
  
  // Handle reset confirmation
  const handleResetClick = () => {
    setShowResetConfirm(true);
  };
  
  // Handle reset confirmation
  const handleConfirmReset = () => {
    resetAllData();
    setShowResetConfirm(false);
    setResetSuccess(true);
    
    // Hide the success message after 3 seconds
    setTimeout(() => {
      setResetSuccess(false);
    }, 3000);
  };
  
  // Handle cancel reset
  const handleCancelReset = () => {
    setShowResetConfirm(false);
  };

  // Calculate total usage for the current week
  const totalWeeklyMinutes = Object.values(weeklyUsage)
    .filter(usage => {
      const usageDate = parseISO(usage.date);
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);
      return usageDate >= weekStart && usageDate <= weekEnd;
    })
    .reduce((total, day) => total + day.totalMinutes, 0);

  // Find the day with the highest usage
  const mostProductiveDay = [...chartData].sort((a, b) => b.minutes - a.minutes)[0];
  
  // Format chart tooltip
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black text-white p-3 rounded-lg shadow-lg">
          <p className="font-medium">{data.day}</p>
          <p>{formatDuration(data.minutes)}</p>
          {data.isToday && (
            <p className="text-xs mt-1 text-gray-300">Current day</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-light">Study Time Tracker</h1>
          <p className="text-muted-foreground text-lg">Monitor your daily app usage and study habits</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
            <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span className="font-medium text-sm">
              {isTracking 
                ? `Tracking: ${currentSessionDuration} ${currentSessionDuration === 1 ? 'minute' : 'minutes'}`
                : 'Not tracking'}
            </span>
            <span className="text-gray-400 text-xs">
              {format(currentTime, 'p')}
            </span>
          </div>
          
          {/* Reset Button */}
          <button 
            onClick={handleResetClick}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <RefreshCw size={16} />
            <span>Reset Data</span>
          </button>
        </div>
      </div>
      
      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle size={20} />
            <p>Are you sure you want to reset all time tracking data? This cannot be undone.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleCancelReset}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirmReset}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reset All Data
            </button>
          </div>
        </div>
      )}
      
      {/* Success Message */}
      {resetSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          Time tracking data has been successfully reset.
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main chart */}
        <div className="md:col-span-2 bg-[#e8c84d] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-light">Weekly Usage</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{format(new Date(), 'MMMM yyyy')}</span>
              <Calendar className="text-black" />
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 14 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${Math.floor(value / 60)}h`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="minutes" 
                  fill="#000000"
                  radius={[3, 3, 0, 0]}
                  barSize={40}
                  shape={(props: BarShapeProps) => {
                    const { x, y, width, height, isToday } = props;
                    return (
                      <rect 
                        x={x} 
                        y={y} 
                        width={width} 
                        height={height} 
                        fill={isToday ? "transparent" : "black"}
                        stroke="black"
                        strokeWidth={isToday ? 1.5 : 0}
                        strokeDasharray={isToday ? "5,2" : "0"} 
                        rx={3}
                        ry={3}
                      />
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Stats cards */}
        <div className="space-y-6">
          {/* Today's usage */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="text-[#f4b8dc]" />
              <h3 className="text-xl font-medium">Today's Usage</h3>
              <span className="text-xs text-gray-500">
                {format(new Date(), 'MMM d')}
              </span>
            </div>
            <div className="text-3xl font-light mb-2">
              {formatDuration(todayUsage.totalMinutes)}
              {isTracking && (
                <span className="text-sm font-normal text-green-500 ml-2">
                  +{currentSessionDuration}m active
                </span>
              )}
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#f4b8dc]" 
                style={{ width: `${Math.min(todayUsage.totalMinutes / 4, 100)}%` }}
              ></div>
            </div>
          </div>
          
          {/* Weekly total */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="text-[#9bab64]" />
              <h3 className="text-xl font-medium">Weekly Total</h3>
            </div>
            <div className="text-3xl font-light mb-2">
              {formatDuration(totalWeeklyMinutes)}
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              Average: {formatDuration(Math.round(totalWeeklyMinutes / 7))} per day
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#9bab64]" 
                style={{ width: `${Math.min(totalWeeklyMinutes / 20, 100)}%` }}
              ></div>
            </div>
          </div>
          
          {/* Most productive day */}
          {mostProductiveDay && mostProductiveDay.minutes > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-medium">Most Productive Day</h3>
              </div>
              <div className="text-2xl font-light mb-1">
                {mostProductiveDay.day}
              </div>
              <div className="text-muted-foreground mb-2">
                {formatDuration(mostProductiveDay.minutes)} of usage
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Usage by day detail */}
      <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-medium mb-4">Daily Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {chartData.map((day) => (
            <div 
              key={day.date} 
              className={`p-4 rounded-lg ${
                day.isToday 
                  ? 'bg-[#f4b8dc]/10 border border-[#f4b8dc]' 
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{day.day}</span>
                <span className="text-sm text-gray-500">
                  {format(parseISO(day.date), 'MMM d')}
                </span>
              </div>
              <div className="text-xl font-light">
                {formatDuration(day.minutes)}
                {day.isToday && isTracking && (
                  <span className="text-xs text-green-500 ml-2">
                    +{currentSessionDuration}m
                  </span>
                )}
              </div>
              {day.isToday && (
                <div className="text-sm text-[#f4b8dc] mt-1 flex items-center">
                  <span>Current day</span>
                  {isTracking && (
                    <span className="flex items-center gap-1 ml-2 text-green-500 text-xs">
                      <Activity size={12} /> Active
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Data storage info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
        <p>Time tracking data is stored locally in your browser's localStorage.</p>
        <p className="mt-1">Current day: {format(new Date(), 'PPPP')}</p>
        <p className="mt-1">Last updated: {format(currentTime, 'PPp')}</p>
      </div>
    </div>
  );
};

export default WeeklyTime; 