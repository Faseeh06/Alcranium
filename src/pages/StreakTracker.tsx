import { useEffect, useState } from "react";
import { Award, Calendar, Flame, Trophy, Target, ArrowUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  StreakData, 
  calculateLevelProgress, 
  formatStreakDate, 
  getAndUpdateStreakData, 
  getPointsForLevel, 
  getStreakBenefit 
} from "@/utils/streakUtils";

const StreakTracker = () => {
  const { currentUser } = useAuth();
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastLoginDate: "",
    totalPoints: 0,
    level: 1,
    pointsToNextLevel: 100
  });

  // Get user's name from currentUser
  const getUserName = () => {
    if (!currentUser) return "User";
    
    // If displayName exists, try to extract the actual name
    if (currentUser.displayName) {
      // Check for format "Name (username)"
      const match = currentUser.displayName.match(/(.*)\s*\(.*\)/);
      if (match) {
        return match[1].trim();
      }
      return currentUser.displayName;
    }
    
    // Fallback to email if no display name
    if (currentUser.email) {
      return currentUser.email.split('@')[0];
    }
    
    return "User";
  };

  // Load streak data from localStorage on component mount
  useEffect(() => {
    const updatedData = getAndUpdateStreakData();
    setStreakData(updatedData);
  }, []);

  const progressPercent = calculateLevelProgress(streakData);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl  mb-2 flex items-center gap-2">
        <Trophy className="text-yellow-400" />
         Streak Tracker
      </h1>
      <p className="text-muted-foreground mb-6">Track your daily login streak and rewards</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Streak Overview Card */}
        <div className="bg-[#eee7da] border border-black/40 rounded-xl shadow-sm hover:shadow-md transition-all p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Flame className="text-red-500" />
            Streak Overview
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Current Streak</span>
              <span className="text-2xl font-bold flex items-center gap-1">
                {streakData.currentStreak} <Flame size={18} className="text-red-500" />
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Longest Streak</span>
              <span className="text-2xl font-bold">{streakData.longestStreak}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Last Login</span>
              <span className="text-lg">{formatStreakDate(streakData.lastLoginDate)}</span>
            </div>
            
            <div className="mt-4 p-4 bg-white/60 rounded-md border border-black/10">
              <p className="text-md italic">{getStreakBenefit(streakData.currentStreak)}</p>
            </div>
          </div>
        </div>
        
        {/* Progress and Levels Card */}
        <div className="bg-[#eee7da] border border-black/40 rounded-xl shadow-sm hover:shadow-md transition-all p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Award className="text-blue-500" />
            Progress & Rewards
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Points</span>
              <span className="text-2xl font-bold">{streakData.totalPoints}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Current Level</span>
              <span className="text-2xl font-bold flex items-center gap-1">
                {streakData.level} <Trophy size={18} className="text-yellow-500" />
              </span>
            </div>
            
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress to Level {streakData.level + 1}</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 bg-white/60 rounded-full overflow-hidden border border-black/10">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-white/60 rounded-md border border-black/10">
              <p className="text-md flex items-center gap-2">
                <Target size={18} />
                Next level in: {getPointsForLevel(streakData.level) - streakData.totalPoints} points
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Streak Rules & Benefits */}
      <div className="mt-8 bg-[#eee7da] border border-black/40 rounded-xl shadow-sm hover:shadow-md transition-all p-6">
        <h2 className="text-xl font-semibold mb-4">How Streaks Work</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 bg-white/60 rounded-md border border-black/10 flex flex-col items-center text-center">
            <Calendar className="text-green-500 mb-2" size={32} />
            <h3 className="font-semibold mb-1">Daily Login</h3>
            <p className="text-sm">Sign in each day to maintain your streak. Missing a day resets your streak to 1.</p>
          </div>
          
          <div className="p-4 bg-white/60 rounded-md border border-black/10 flex flex-col items-center text-center">
            <ArrowUp className="text-red-500 mb-2" size={32} />
            <h3 className="font-semibold mb-1">Increasing Rewards</h3>
            <p className="text-sm">Longer streaks earn more points per day: 10 × your current streak count!</p>
          </div>
          
          <div className="p-4 bg-white/60 rounded-md border border-black/10 flex flex-col items-center text-center">
            <Trophy className="text-yellow-500 mb-2" size={32} />
            <h3 className="font-semibold mb-1">Level Benefits</h3>
            <p className="text-sm">Higher levels unlock new features and badges to show off your dedication.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakTracker; 