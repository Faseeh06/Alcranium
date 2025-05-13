import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCw, Settings, Clock, Calendar, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type TimerMode = "work" | "shortBreak" | "longBreak";

interface TimerSettings {
  work: number; // minutes
  shortBreak: number; // minutes
  longBreak: number; // minutes
  longBreakInterval: number; // sessions
}

const DEFAULT_SETTINGS: TimerSettings = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
};

const PomodoroTimer = () => {
  const { toast } = useToast();
  const [settings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(settings.work * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  
  // Format study time as HH:MM
  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Reset timer based on current mode
  const resetTimer = (newMode?: TimerMode) => {
    const timerMode = newMode || mode;
    setIsActive(false);
    setTimeLeft(settings[timerMode] * 60);
    if (newMode) setMode(newMode);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
  };
  
  // Toggle timer
  const toggleTimer = () => {
    if (!isActive) {
      setIsActive(true);
      startTimeRef.current = Date.now() - ((settings[mode] * 60 - timeLeft) * 1000);
    } else {
      setIsActive(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };
  
  // Change timer mode
  const changeMode = (newMode: TimerMode) => {
    resetTimer(newMode);
  };

  // Timer logic
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer complete
            clearInterval(intervalRef.current!);
            
            // Update stats based on completed mode
            if (mode === "work") {
              setSessionsCompleted(prev => prev + 1);
              setTotalStudyTime(prev => prev + settings.work);
              
              // Determine next break type
              const nextSession = sessionsCompleted + 1;
              if (nextSession % settings.longBreakInterval === 0) {
                // Time for a long break
                setTimeout(() => resetTimer("longBreak"), 500);
                toast({
                  title: "Work session complete!",
                  description: "Time for a long break. Good job!",
                });
              } else {
                // Time for a short break
                setTimeout(() => resetTimer("shortBreak"), 500);
                toast({
                  title: "Work session complete!",
                  description: "Take a short break.",
                });
              }
            } else {
              // Break is over, back to work
              setTimeout(() => resetTimer("work"), 500);
              toast({
                title: "Break time over",
                description: "Ready to get back to work?",
              });
            }
            
            // Play notification sound in a real implementation
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isActive, mode, settings, sessionsCompleted, toast]);

  // Update streak if study time exceeds 20 minutes
  useEffect(() => {
    if (totalStudyTime >= 20 && totalStudyTime - settings.work < 20) {
      toast({
        title: "Streak updated!",
        description: "You've studied for more than 20 minutes today. Keep it up!",
      });
      // In a real app, this would update the streak in the backend
    }
  }, [totalStudyTime, settings.work, toast]);
  
  // Calculate progress percentage
  const calculateProgress = () => {
    const totalSeconds = settings[mode] * 60;
    const percentage = ((totalSeconds - timeLeft) / totalSeconds) * 100;
    return `${Math.min(percentage, 100)}%`;
  };
  
  // Get mode specific colors
  const getModeColors = () => {
    switch (mode) {
      case "work":
        return {
          bg: "bg-[#f4b8dc]/20",
          text: "text-[#f4b8dc]",
          progress: "bg-[#f4b8dc]",
          lighter: "bg-[#f4b8dc]/10",
          darker: "bg-[#f4b8dc]",
        };
      case "shortBreak":
        return {
          bg: "bg-green-100",
          text: "text-green-600",
          progress: "bg-green-500",
          lighter: "bg-green-50",
          darker: "bg-green-500",
        };
      case "longBreak":
        return {
          bg: "bg-blue-100",
          text: "text-blue-600",
          progress: "bg-blue-500",
          lighter: "bg-blue-50",
          darker: "bg-blue-500",
        };
    }
  };
  
  const colors = getModeColors();
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-light mb-1">Pomodoro Timer</h1>
          <p className="text-muted-foreground ubuntu-light">
            Focus on your work using the Pomodoro Technique
          </p>
        </div>
        
        <button
          onClick={() => {
            toast({
              title: "Settings",
              description: "This would open the timer settings dialog",
            });
          }}
          className="mt-4 md:mt-0 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2">
          {/* Timer Card */}
          <div className="bg-[#eee7da] rounded-xl p-6 shadow-sm">
            {/* Mode Selector */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-full bg-white p-1 shadow-sm">
                <button
                  onClick={() => changeMode("work")}
                  className={cn(
                    "px-5 py-2 text-sm rounded-full transition-colors font-medium",
                    mode === "work" ? "bg-[#f4b8dc] text-white" : "hover:bg-gray-100"
                  )}
                >
                  Focus
                </button>
                <button
                  onClick={() => changeMode("shortBreak")}
                  className={cn(
                    "px-5 py-2 text-sm rounded-full transition-colors font-medium",
                    mode === "shortBreak" ? "bg-green-500 text-white" : "hover:bg-gray-100"
                  )}
                >
                  Short Break
                </button>
                <button
                  onClick={() => changeMode("longBreak")}
                  className={cn(
                    "px-5 py-2 text-sm rounded-full transition-colors font-medium",
                    mode === "longBreak" ? "bg-blue-500 text-white" : "hover:bg-gray-100"
                  )}
                >
                  Long Break
                </button>
              </div>
            </div>
            
            {/* Timer Display */}
            <div className="relative w-72 h-72 mx-auto mb-8">
              {/* Progress Circle */}
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle
                  className="text-gray-200"
                  strokeWidth="6"
                  stroke="currentColor"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                />
                {/* Progress Circle */}
                <circle
                  className={colors.text}
                  strokeWidth="6"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="42"
                  cx="50"
                  cy="50"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * parseInt(calculateProgress())) / 100}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-white flex flex-col items-center justify-center shadow-md">
                {/* Time Display */}
                <div className="flex flex-col items-center justify-center">
                  <div className="text-6xl font-light text-gray-800">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-lg mt-2 capitalize text-gray-500">
                    {mode === "work" ? "Focus Time" : mode === "shortBreak" ? "Short Break" : "Long Break"}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Timer Controls */}
            <div className="flex justify-center gap-4">
              <button
                onClick={toggleTimer}
                className={`p-4 ${isActive ? 'bg-gray-800' : 'bg-[#f4b8dc]'} text-white rounded-full shadow-md hover:shadow-lg transition-all`}
              >
                {isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
              </button>
              
              <button
                onClick={() => resetTimer()}
                className="p-4 bg-white text-gray-700 rounded-full shadow-md hover:shadow-lg hover:bg-gray-100 transition-all"
              >
                <RotateCw size={28} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Stats Card */}
        <div>
          <div className="bg-[#eee7da] rounded-xl p-6 h-full flex flex-col shadow-sm">
            <h2 className="text-xl font-medium mb-6">Today's Progress</h2>
            
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={18} className="text-[#f4b8dc]" />
                    <h3 className="font-medium">Sessions Completed</h3>
                  </div>
                  <div className="flex justify-between text-2xl font-light mb-2">
                    <span>{sessionsCompleted}</span>
                    <span className="text-gray-400 text-sm self-end">/ {settings.longBreakInterval}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#f4b8dc]" 
                      style={{ width: `${Math.min((sessionsCompleted % settings.longBreakInterval) * (100 / settings.longBreakInterval), 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={18} className="text-green-500" />
                    <h3 className="font-medium">Total Study Time</h3>
                  </div>
                  <div className="text-2xl font-light mb-2">
                    {formatStudyTime(totalStudyTime)}
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500" 
                      style={{ width: `${Math.min(totalStudyTime * 2, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                {totalStudyTime >= 20 && (
                  <div className="p-4 bg-green-50 text-green-800 rounded-xl shadow-sm border border-green-100">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        <CheckCircle2 size={18} className="text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">Daily Goal Achieved!</p>
                        <p className="text-sm">You've studied for more than 20 minutes today.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Calendar size={18} className={colors.text} />
                    Current Session
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Mode</p>
                      <p className="font-medium capitalize">{mode === "work" ? "Focus" : mode === "shortBreak" ? "Short Break" : "Long Break"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Time Left</p>
                      <p className="font-medium">{formatTime(timeLeft)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
