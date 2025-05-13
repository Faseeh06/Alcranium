// Define the streak data interface
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string;
  totalPoints: number;
  level: number;
  pointsToNextLevel: number;
}

// Get points required for a specific level
export const getPointsForLevel = (level: number): number => {
  return 100 * level;
};

// Calculate progress percentage to next level
export const calculateLevelProgress = (streakData: StreakData): number => {
  const pointsForCurrentLevel = getPointsForLevel(streakData.level - 1);
  const pointsForNextLevel = getPointsForLevel(streakData.level);
  const pointsEarnedInCurrentLevel = streakData.totalPoints - pointsForCurrentLevel;
  const pointsNeededForNextLevel = pointsForNextLevel - pointsForCurrentLevel;
  
  return Math.min(Math.floor((pointsEarnedInCurrentLevel / pointsNeededForNextLevel) * 100), 100);
};

// Format date to be more readable
export const formatStreakDate = (dateString: string): string => {
  if (!dateString) return "Never";
  
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Get streak benefit message based on current streak
export const getStreakBenefit = (currentStreak: number): string => {
  if (currentStreak <= 1) return "Sign in tomorrow to start your streak!";
  if (currentStreak < 5) return `Earning ${currentStreak * 10} points per day!`;
  if (currentStreak < 10) return "Achievement unlocked: Consistency King!";
  return "Maximum streak bonus achieved! Amazing dedication!";
};

// Initialize streak data if not exists
export const initializeStreakData = (): StreakData => {
  const today = new Date().toISOString().split("T")[0];
  
  return {
    currentStreak: 1,
    longestStreak: 1,
    lastLoginDate: today,
    totalPoints: 10,
    level: 1,
    pointsToNextLevel: 100
  };
};

// Update streak data on login - modified to always increment streak
export const updateStreakOnLogin = (streakData: StreakData): StreakData => {
  const today = new Date().toISOString().split("T")[0];
  const newStreakData = { ...streakData };
  
  // If last login date is not today, increment streak and add points
  if (streakData.lastLoginDate !== today) {
    // Increment streak by 1 for every login
    newStreakData.currentStreak += 1;
    
    // Award points based on streak length
    newStreakData.totalPoints += 10 * newStreakData.currentStreak;
    
    // Update longest streak if needed
    if (newStreakData.currentStreak > newStreakData.longestStreak) {
      newStreakData.longestStreak = newStreakData.currentStreak;
    }
  }
  
  // Always set the last login date to today
  newStreakData.lastLoginDate = today;
  
  // Check for level up
  const pointsForNextLevel = getPointsForLevel(newStreakData.level);
  if (newStreakData.totalPoints >= pointsForNextLevel) {
    newStreakData.level += 1;
    newStreakData.pointsToNextLevel = getPointsForLevel(newStreakData.level);
  }
  
  return newStreakData;
};

// Get and update streak data from localStorage
export const getAndUpdateStreakData = (): StreakData => {
  const storedData = localStorage.getItem("streakData");
  let streakData: StreakData;
  
  if (storedData) {
    streakData = JSON.parse(storedData);
  } else {
    streakData = initializeStreakData();
  }
  
  // Update the streak data for today's login
  const updatedStreakData = updateStreakOnLogin(streakData);
  
  // Save back to localStorage
  localStorage.setItem("streakData", JSON.stringify(updatedStreakData));
  
  return updatedStreakData;
}; 