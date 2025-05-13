import { Award, Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  StreakData, 
  calculateLevelProgress, 
  getAndUpdateStreakData 
} from "@/utils/streakUtils";

const StreakCard = () => {
  const navigate = useNavigate();
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastLoginDate: "",
    totalPoints: 0,
    level: 1,
    pointsToNextLevel: 100
  });

  useEffect(() => {
    // Load and update streak data from localStorage
    const updatedData = getAndUpdateStreakData();
    setStreakData(updatedData);
  }, []);

  // Navigate to streak tracker page when clicked
  const handleCardClick = () => {
    navigate("/dashboard/streak-tracker");
  };

  // Calculate progress percentage
  const progressPercent = calculateLevelProgress(streakData);

  return (
    <div className="progress-card cursor-pointer hover:opacity-90 transition-opacity" onClick={handleCardClick}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-light">Your Progress</h3>
        <Award className="text-white" />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-xl font-light text-white">
            <Flame size={20} className="animate-pulse-gentle" />
            {streakData.currentStreak}
          </div>
          <p className="text-sm text-white/80">Day Streak</p>
        </div>
        
        <div className="text-center">
          <div className="text-xl font-light text-white">{streakData.totalPoints}</div>
          <p className="text-sm text-white/80">Total Points</p>
        </div>
        
        <div className="text-center">
          <div className="text-xl font-light text-white">Level {streakData.level}</div>
          <p className="text-sm text-white/80">Scholar Rank</p>
        </div>
      </div>
      
      {/* Progress bar to next level */}
      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1">
          <span>Progress to Level {streakData.level + 1}</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-study-purple to-blue-400" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default StreakCard;
