import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Edit, Trash2, Clock, BookOpen } from "lucide-react";
import { format, addMonths, subMonths, isSameDay, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, parseISO, addMinutes } from "date-fns";
import { StudySession } from "@/data/mock-data";
import { useToast } from "@/hooks/use-toast";
import { getUserSessions, addSession, updateSession, deleteSession } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

// Available subjects for the dropdown
const SUBJECTS = [
  "Mathematics",
  "Biology",
  "Physics",
  "Chemistry",
  "History",
  "Literature",
  "Computer Science",
  "Economics",
  "Geography",
  "Languages",
  "Art",
  "Music",
  "Physical Education",
  "Other"
];

// Duration options in minutes
const DURATION_OPTIONS = [
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
  { value: 180, label: "3 hours" },
  { value: 240, label: "4 hours" }
];

const Calendar = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Session form modal state
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    title: "",
    subject: SUBJECTS[0],
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: "09:00",
    durationMinutes: 60
  });
  
  // Confirmation modal for deletion
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = monthStart;
  const endDate = monthEnd;

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });
  
  // Check authentication and redirect if needed
  useEffect(() => {
    const checkAuth = async () => {
      // Short delay to allow auth state to initialize
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!currentUser) {
        toast({
          title: "Authentication required",
          description: "Please sign in to view and manage your study sessions",
          variant: "destructive"
        });
        navigate("/signin");
      }
    };
    
    checkAuth();
  }, [currentUser, navigate, toast]);
  
  // Load sessions from Firebase
  useEffect(() => {
    const loadSessions = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        setError(null);
        console.log("Loading sessions for user:", currentUser.uid);
        const userSessions = await getUserSessions(currentUser.uid);
        console.log("Sessions loaded:", userSessions.length, userSessions);
        setSessions(userSessions);
      } catch (error) {
        console.error("Error loading sessions:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        setError(`Failed to load sessions: ${errorMessage}`);
        toast({
          title: "Error",
          description: "Failed to load study sessions. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      loadSessions();
    }
  }, [currentUser, toast]);
  
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const openAddSessionModal = () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to manage study sessions",
        variant: "destructive"
      });
      navigate("/signin");
      return;
    }
    
    // Set default values with selected date
    setSessionForm({
      title: "",
      subject: SUBJECTS[0],
      date: format(selectedDate, 'yyyy-MM-dd'),
      startTime: "09:00",
      durationMinutes: 60
    });
    setEditingSessionId(null);
    setIsSessionModalOpen(true);
  };
  
  const openEditSessionModal = (session: StudySession) => {
    if (!currentUser) {
    toast({
        title: "Authentication required",
        description: "Please sign in to manage study sessions",
        variant: "destructive"
      });
      return;
    }
    
    setSessionForm({
      title: session.title,
      subject: session.subject,
      date: format(session.start, 'yyyy-MM-dd'),
      startTime: format(session.start, 'HH:mm'),
      durationMinutes: session.durationMinutes
    });
    setEditingSessionId(session.id);
    setIsSessionModalOpen(true);
  };
  
  const confirmDeleteSession = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setIsDeleteModalOpen(true);
  };
  
  const handleDeleteSession = async () => {
    if (!sessionToDelete || !currentUser) return;
    
    try {
      setFormSubmitting(true);
      await deleteSession(sessionToDelete);
      
      // Update local state
      setSessions(prev => prev.filter(session => session.id !== sessionToDelete));
      
      toast({
        title: "Session deleted",
        description: "The study session has been deleted successfully",
      });
      
      setIsDeleteModalOpen(false);
      setSessionToDelete(null);
    } catch (error) {
      console.error("Error deleting session:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: `Failed to delete session: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setFormSubmitting(false);
    }
  };
  
  const handleSessionFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSessionForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubjectChange = (value: string) => {
    setSessionForm(prev => ({ ...prev, subject: value }));
  };
  
  const handleDurationChange = (value: string) => {
    setSessionForm(prev => ({ ...prev, durationMinutes: parseInt(value) }));
  };
  
  const handleSaveSession = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to manage study sessions",
        variant: "destructive"
      });
      return;
    }
    
    // Validate form
    if (!sessionForm.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a session title",
        variant: "destructive"
      });
      return;
    }
    
    if (!sessionForm.date || !sessionForm.startTime) {
      toast({
        title: "Error",
        description: "Please select a date and time",
        variant: "destructive"
      });
      return;
    }
    
    setFormSubmitting(true);
    
    try {
      // Combine date and time
      const startDate = new Date(`${sessionForm.date}T${sessionForm.startTime}`);
      const endDate = addMinutes(startDate, sessionForm.durationMinutes);
      
      if (editingSessionId) {
        // Edit existing session
        await updateSession(editingSessionId, {
          title: sessionForm.title,
          subject: sessionForm.subject,
          start: startDate,
          end: endDate,
          durationMinutes: sessionForm.durationMinutes
        });
        
        // Update local state
        setSessions(prev => prev.map(session => 
          session.id === editingSessionId 
            ? {
                ...session,
                title: sessionForm.title,
                subject: sessionForm.subject,
                start: startDate,
                end: endDate,
                durationMinutes: sessionForm.durationMinutes
              } 
            : session
        ));
        
        toast({
          title: "Session updated",
          description: "The study session has been updated successfully",
        });
      } else {
        // Add new session
        const newSessionId = await addSession({
          title: sessionForm.title,
          subject: sessionForm.subject,
          start: startDate,
          end: endDate,
          durationMinutes: sessionForm.durationMinutes,
          userId: currentUser.uid
        });
        
        // Update local state
        setSessions(prev => [
          ...prev,
          {
            id: newSessionId,
            title: sessionForm.title,
            subject: sessionForm.subject,
            start: startDate,
            end: endDate,
            durationMinutes: sessionForm.durationMinutes
          }
        ]);
        
        toast({
          title: "Session created",
          description: "The new study session has been created successfully",
        });
      }
      
      // Close modal
      setIsSessionModalOpen(false);
    } catch (error) {
      console.error("Error saving session:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: `Failed to save session: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setFormSubmitting(false);
    }
  };
  
  // Get sessions for the selected date
  const sessionsForSelectedDate = sessions.filter(session => 
    isSameDay(session.start, selectedDate)
  );
  
  // Get sessions for a specific day
  const getSessionsForDay = (date: Date) => {
    return sessions.filter(session => isSameDay(session.start, date));
  };
  
  // Get the color for a subject
  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      'Mathematics': 'bg-blue-500',
      'Biology': 'bg-green-500',
      'Physics': 'bg-purple-500',
      'Chemistry': 'bg-cyan-500',
      'History': 'bg-amber-500',
      'Literature': 'bg-[#f4b8dc]',
      'Computer Science': 'bg-indigo-500',
      'Economics': 'bg-orange-500',
      'Geography': 'bg-emerald-500',
      'Languages': 'bg-rose-500',
      'Art': 'bg-fuchsia-500',
      'Music': 'bg-sky-500',
      'Physical Education': 'bg-lime-500',
      'Other': 'bg-gray-500'
    };
    return colors[subject] || 'bg-gray-500';
  };
  
  if (!currentUser) {
    return (
      <div className="animate-fade-in p-8 bg-[#eee7da] rounded-xl text-center">
        <p className="text-muted-foreground">Please sign in to view your study calendar</p>
        <Button 
          onClick={() => navigate("/signin")}
          className="mt-4"
        >
          Sign In
        </Button>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-light mb-1">Study Calendar</h1>
          <p className="text-muted-foreground ubuntu-light">
            Plan and manage your study sessions
          </p>
        </div>
        
        <button
          onClick={openAddSessionModal}
          className="mt-4 md:mt-0 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Add Session</span>
        </button>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2">
          <div className="bg-[#eee7da] rounded-xl p-6 shadow-sm h-[560px] flex flex-col">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-light">{format(currentMonth, "MMMM yyyy")}</h3>
              <div className="flex items-center">
                <button
                  onClick={goToPreviousMonth}
                  className="p-1 rounded-full hover:bg-white/50 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-3 py-1 mx-2 text-sm bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={goToNextMonth}
                  className="p-1 rounded-full hover:bg-white/50 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">Loading calendar...</p>
              </div>
            ) : (
              /* Calendar Grid */
            <div className="grid grid-cols-7 gap-1.5 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center p-2 text-gray-600 font-medium">
                  {day}
                </div>
              ))}
              
              {/* Placeholder cells for days before the start of the month */}
              {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                <div key={`empty-start-${index}`} className="p-2"></div>
              ))}
              
              {/* Calendar days */}
              {days.map((day) => {
                  const sessionsOnDay = getSessionsForDay(day);
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentMonth);
                
                return (
                  <button
                    key={day.toString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      p-2 h-24 rounded-xl border transition-all
                      ${isSelected ? "border-[#f4b8dc] bg-[#f4b8dc]/10 shadow-sm" : "border-transparent hover:bg-white/50"}
                      ${isToday ? "bg-white shadow-sm" : ""}
                      ${!isCurrentMonth ? "opacity-40" : ""}
                    `}
                  >
                    <div className="flex flex-col h-full">
                      <div className={`
                        text-right mb-1 font-medium
                        ${isToday ? "text-[#f4b8dc]" : ""}
                      `}>
                        {format(day, "d")}
                      </div>
                      <div className="flex-1 overflow-hidden">
                          {sessionsOnDay.slice(0, 2).map((session) => (
                          <div
                            key={session.id}
                            className={`
                              text-xs mb-1 truncate px-1.5 py-0.5 rounded-full text-white
                              ${getSubjectColor(session.subject)}
                            `}
                          >
                            {session.title}
                          </div>
                        ))}
                          {sessionsOnDay.length > 2 && (
                          <div className="text-xs text-gray-600 px-1">
                              +{sessionsOnDay.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
              
              {/* Placeholder cells for days after the end of the month */}
              {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
                <div key={`empty-end-${index}`} className="p-2"></div>
              ))}
            </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="bg-[#eee7da] rounded-xl p-6 shadow-sm h-[560px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-light">
                {format(selectedDate, "MMMM d, yyyy")}
              </h3>
              <CalendarIcon className="text-[#f4b8dc]" size={20} />
            </div>
            
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">Loading sessions...</p>
              </div>
            ) : (
            <div className="space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent flex-1">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Sessions for this day</h4>
              {sessionsForSelectedDate.length > 0 ? (
                sessionsForSelectedDate.map(session => (
                    <div key={session.id} className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow relative group">
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditSessionModal(session);
                          }}
                          className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          title="Edit session"
                        >
                          <Edit size={14} className="text-gray-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDeleteSession(session.id);
                          }}
                          className="p-1.5 rounded-full bg-gray-100 hover:bg-red-100 transition-colors ml-1"
                          title="Delete session"
                        >
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </div>
                    <div className="flex justify-between items-start">
                      <div>
                          <h4 className="font-medium pr-14">{session.title}</h4>
                        <div className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs text-white ${getSubjectColor(session.subject)}`}>
                          {session.subject}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {format(session.start, "h:mm a")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {session.durationMinutes} min
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 bg-white/50 rounded-xl">
                  <p className="mb-2">No sessions scheduled</p>
                  <button
                      onClick={openAddSessionModal}
                    className="text-[#f4b8dc] hover:underline text-sm flex items-center gap-1 mx-auto"
                  >
                    <Plus size={14} />
                    <span>Add session</span>
                  </button>
                </div>
              )}
            </div>
            )}
            
            <div className="mt-6">
              <h3 className="font-medium mb-3 text-gray-700">Upcoming Sessions</h3>
              {loading ? (
                <p className="text-muted-foreground text-center py-4">Loading...</p>
              ) : (
              <div className="space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent max-h-[180px]">
                  {sessions
                  .filter(session => session.start > new Date())
                  .sort((a, b) => a.start.getTime() - b.start.getTime())
                  .slice(0, 3)
                  .map(session => (
                    <div 
                      key={session.id} 
                        className="flex justify-between items-start p-3 bg-white rounded-xl hover:shadow-sm transition-shadow cursor-pointer"
                        onClick={() => {
                          // Navigate to the date of this session
                          setSelectedDate(session.start);
                          setCurrentMonth(session.start);
                        }}
                    >
                      <div>
                        <h4 className="font-medium">{session.title}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <div className={`w-2 h-2 rounded-full ${getSubjectColor(session.subject)}`}></div>
                          <div className="text-xs text-gray-600">
                            {session.subject} • {session.durationMinutes} min
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-[#f4b8dc]">
                        {format(session.start, "MMM d, h:mm a")}
                      </div>
                    </div>
                  ))}
                  
                  {sessions.filter(session => session.start > new Date()).length === 0 && (
                    <div className="text-center py-4 text-gray-500 bg-white/50 rounded-xl">
                      <p>No upcoming sessions</p>
                    </div>
                  )}
              </div>
              )}
              
              {sessions.filter(session => session.start > new Date()).length > 3 && (
              <div className="text-center mt-4">
                <button
                  onClick={() => {
                    toast({
                      title: "View All Sessions",
                      description: "This would navigate to a full session list view",
                    });
                  }}
                  className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors inline-flex items-center gap-2 text-sm"
                >
                  View all sessions
                </button>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Session Form Modal */}
      <Dialog open={isSessionModalOpen} onOpenChange={setIsSessionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSessionId ? 'Edit Study Session' : 'Add Study Session'}</DialogTitle>
            <DialogDescription>
              {editingSessionId 
                ? 'Update the details of your study session'
                : 'Schedule a new study session for your calendar'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Session Title</Label>
              <Input
                id="title"
                name="title"
                value={sessionForm.title}
                onChange={handleSessionFormChange}
                placeholder="What are you studying?"
                disabled={formSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={sessionForm.subject}
                onValueChange={handleSubjectChange}
                disabled={formSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={sessionForm.date}
                  onChange={handleSessionFormChange}
                  disabled={formSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={sessionForm.startTime}
                  onChange={handleSessionFormChange}
                  disabled={formSubmitting}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Duration</Label>
              <Select
                value={sessionForm.durationMinutes.toString()}
                onValueChange={handleDurationChange}
                disabled={formSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSessionModalOpen(false)} disabled={formSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSaveSession} disabled={formSubmitting} className="bg-black hover:bg-black/80">
              {formSubmitting 
                ? 'Saving...' 
                : editingSessionId ? 'Update Session' : 'Add Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Study Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this study session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={formSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSession} disabled={formSubmitting}>
              {formSubmitting ? 'Deleting...' : 'Delete Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
