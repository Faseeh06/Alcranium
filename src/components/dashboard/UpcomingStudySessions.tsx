import { useState, useEffect } from "react";
import { Calendar, Clock, UserCircle, Video, Stethoscope } from "lucide-react";
import { format, isToday, startOfDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getUserSessions } from "@/lib/firebase";
import { StudySession } from "@/data/mock-data";
import { useNavigate } from "react-router-dom";

const UpcomingStudySessions = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSessions = async () => {
      setLoading(true);
      setError(null);
      setSessions([]);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userSessions = await getUserSessions(currentUser.uid);
        const today = new Date();
        // Filter for upcoming sessions and sort them
        const upcoming = userSessions
          .filter(session => session.start > today)
          .sort((a, b) => a.start.getTime() - b.start.getTime())
          .slice(0, 3); // Take the first 3 upcoming sessions
        setSessions(upcoming);
      } catch (err) {
        console.error("Error loading study sessions:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(`Failed to load study sessions: ${errorMessage}`);
        toast({
          title: "Error",
          description: "Failed to load study sessions. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [currentUser, toast]);
  
  const getSubjectIcon = (subject: string) => {
    const icons: Record<string, JSX.Element> = {
      'Mathematics': <Stethoscope size={20} />,
      'Biology': <UserCircle size={20} />,
      'Physics': <Clock size={20} />,
      'History': <Calendar size={20} />,
      'Literature': <Video size={20} />,
    };
    return icons[subject] || <Calendar size={20} />;
  };

  const formatSessionDate = (sessionDate: Date) => {
    try {
      const today = startOfDay(new Date());
      const sessionDayStart = startOfDay(sessionDate);
      
      if (isToday(sessionDayStart)) {
        return 'Today';
      }
      return format(sessionDayStart, 'MMM d'); // Format as Jan 1, Feb 15, etc.
    } catch (error) {
      console.error("Error formatting session date:", error);
      return format(sessionDate, 'MMM d'); // Fallback format
    }
  };

  const getRandomTags = () => {
    const allTags = ["Fever", "Cough", "Heart Burn", "Headache", "Fatigue", "Stress"];
    const numTags = Math.floor(Math.random() * 3) + 1; // 1-3 tags
    const selectedTags = [];
    
    for (let i = 0; i < numTags; i++) {
      const randomIndex = Math.floor(Math.random() * allTags.length);
      selectedTags.push(allTags[randomIndex]);
      allTags.splice(randomIndex, 1); // Remove selected tag to avoid duplicates
    }
    
    return selectedTags;
  };
  
  const session = sessions[0];
  const tags = getRandomTags();
  const age = Math.floor(Math.random() * 20) + 18; // Random age between 18-38
  const months = Math.floor(Math.random() * 12); // Random months 0-11

  return (
    <div className="rounded-xl p-5 h-[478px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-medium">Upcoming Sessions</h3>
      </div>
      
      {loading ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-pulse">Loading sessions...</div>
        </div>
      ) : error ? (
        <div className="flex-grow flex items-center justify-center text-red-500">
          <p>{error}</p>
        </div>
      ) : sessions.length > 0 ? (
        <>
          <div className="space-y-4 flex-grow overflow-y-auto pr-1 transparent-scrollbar">
            {sessions.map((session, index) => (
              <div key={session.id} className="bg-[#eee7da] p-4 rounded-xl">
                <div className="mb-3">
                  <h2 className="text-lg font-medium">{session.title}</h2>
                  <div className="flex gap-1 items-center text-gray-700 text-sm">
                    <span>Subject: {session.subject}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-pink-200 text-pink-800 px-3 py-1 rounded-full text-xs">
                    Duration: {session.durationMinutes} mins
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Session Date</span>
                  <span>{formatSessionDate(session.start)}</span>
                </div>
                
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Time</span>
                  <span>{format(session.start, "h:mm a")} - {format(session.end, "h:mm a")}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-5 flex justify-center">
            <button 
              className="w-full max-w-xs bg-black text-white py-2.5 px-4 rounded-full font-medium text-sm hover:bg-gray-800 transition-colors"
              onClick={() => navigate('/dashboard/calendar')}
            >
              View full calendar
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-pink-50/50 rounded-xl flex-grow">
          <p className="text-gray-500">
            {currentUser ? "No upcoming sessions scheduled." : "Sign in to view your sessions."}
          </p>
        </div>
      )}
    </div>
  );
};

export default UpcomingStudySessions;
