import StreakCard from "@/components/dashboard/StreakCard";
import StudyTimeCard from "@/components/dashboard/StudyTimeCard";
import TasksOverview from "@/components/dashboard/TasksOverview";
import AISuggestions from "@/components/dashboard/AISuggestions";
import UpcomingStudySessions from "@/components/dashboard/UpcomingStudySessions";
import RandomQuote from "@/components/dashboard/RandomQuote";
import MiniCalendar from "@/components/dashboard/MiniCalendar";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { currentUser } = useAuth();
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };
  
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

  return (
    <div className="animate-fade-in relative">
      {/* Greeting Section */}
      <div className="mb-6 flex justify-between">
        <div>
          <h1 className="text-5xl font-light">{getGreeting()}, {getUserName()}!</h1>
          <p className="text-muted-foreground ubuntu-light text-lg">Your actions today will shape the tomorrow you want</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* First column: Progress + Inspirational Quote + Tasks */}
        <div className="flex flex-col gap-6">
          <StreakCard />
          <RandomQuote />
          <TasksOverview />
        </div>
        
        {/* Second column: Weekly Study Time + Upcoming Sessions */}
        <div className="flex flex-col gap-6">
          <StudyTimeCard />
          <UpcomingStudySessions />
        </div>
        
        {/* Third column: Calendar and AI Suggestions */}
        <div className="flex flex-col">
          <div className="relative lg:mt-8 xl:mt-12">
            <MiniCalendar />
          </div>
          <div className="-mt-6 z-10">
            <AISuggestions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
