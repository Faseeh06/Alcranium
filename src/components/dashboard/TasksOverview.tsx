import { useState, useEffect } from "react";
import { Calendar, CheckCircle, Clock, Plus, Trash2, FileText, Video, Clipboard, ChevronDown } from "lucide-react";
import { Task, TaskPriority } from "@/data/mock-data";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, isFuture, parseISO, differenceInDays, startOfDay, isThisWeek, isThisMonth } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { getUserTasks, updateTask, deleteTask } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TasksOverview = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Load tasks from Firebase
  useEffect(() => {
    const loadTasks = async () => {
      // Reset state before loading
      setLoading(true);
      setError(null);
      setTasks([]); // Clear previous tasks
      
      if (!currentUser) {
        setLoading(false); // Stop loading if no user
        return;
      }
      
      try {
        const userTasks = await getUserTasks(currentUser.uid);
        setTasks(userTasks);
      } catch (error) {
        console.error("Error loading tasks:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        setError(`Failed to load tasks: ${errorMessage}`);
        toast({
          title: "Error",
          description: "Failed to load tasks. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadTasks(); // Call loadTasks directly
    
  }, [currentUser, toast]); // Depend only on currentUser and toast

  const toggleTaskComplete = async (taskId: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to manage tasks",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const newStatus = !task.completed;
      
      // Update in Firebase
      await updateTask(taskId, { completed: newStatus });
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, completed: newStatus } 
            : task
        )
      );
      
      const action = newStatus ? "completed" : "marked as incomplete";
      toast({
        title: `Task ${action}`,
        description: task.title,
      });
    } catch (error) {
      console.error("Error toggling task status:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: `Failed to update task status: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  const removeTask = async (taskId: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to manage tasks",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Delete from Firebase
      await deleteTask(taskId);
      
      // Update local state
      const taskToRemove = tasks.find(t => t.id === taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      if (taskToRemove) {
        toast({
          title: "Task removed",
          description: taskToRemove.title,
        });
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: `Failed to delete task: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'math': return <Clipboard size={20} />;
      case 'biology': return <FileText size={20} />;
      case 'physics': return <Calendar size={20} />;
      case 'history': return <Clipboard size={20} />;
      case 'literature': return <FileText size={20} />;
      default: return <FileText size={20} />;
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'math': return 'bg-pink-100 text-pink-600';
      case 'biology': return 'bg-blue-100 text-blue-600';
      case 'physics': return 'bg-green-100 text-green-600';
      case 'history': return 'bg-yellow-100 text-yellow-600';
      case 'literature': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Format the due date to show day or date
  const formatDueDate = (dateString: string) => {
    try {
      // Ensure dateString is treated as UTC and compared to start of today UTC
      const dueDate = parseISO(dateString + 'T00:00:00Z'); 
      const today = startOfDay(new Date()); // Use startOfDay for accurate comparison
      
      if (isToday(dueDate)) {
        return 'Today';
      }
      
      // Always format future dates as 'MMM d'
      return format(dueDate, 'MMM d'); // Jan 1, Feb 15, etc.
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Due Soon'; // Fallback
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (task.completed) return false; // Always exclude completed tasks from this view
    
    try {
      const dueDate = parseISO(task.dueDate + 'T00:00:00Z');
      const today = startOfDay(new Date());
      
      switch (filter) {
        case 'today':
          return isToday(dueDate);
        case 'week':
          // Check if the date is within the current week (respecting locale)
          return isThisWeek(dueDate, { weekStartsOn: 1 }); // Assuming week starts on Monday
        case 'month':
          // Check if the date is within the current month
          return isThisMonth(dueDate);
        case 'all':
        default:
          return true; // Show all non-completed tasks
      }
    } catch (error) {
      console.error("Error filtering task by date:", error);
      return false; // Exclude if date is invalid
    }
  }).slice(0, 4); // Limit to 4 tasks for the overview
  
  const getFilterLabel = () => {
    switch (filter) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      default: return 'All Tasks';
    }
  };

  return (
    <div className="rounded-xl p-5 h-[478px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium">Task List</h3>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="px-3 py-1.5 rounded-full bg-[#222] text-white text-sm font-medium flex items-center gap-1 hover:bg-gray-800"
              >
                {getFilterLabel()} <ChevronDown size={14} className="ml-1" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilter('all')}>All Tasks</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('today')}>Today</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('week')}>This Week</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('month')}>This Month</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {loading ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-pulse">Loading tasks...</div>
        </div>
      ) : error ? (
        <div className="flex-grow flex items-center justify-center text-red-500">
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-3 flex-grow overflow-y-auto pr-1 transparent-scrollbar">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task, index) => (
              <div 
                key={task.id} 
                className={`flex items-center gap-3 p-3 ${index === 0 ? 'bg-[#f4b8dc]' : 'bg-[#eee7da]'} rounded-xl transition-all hover:bg-opacity-90 relative group`}
              >
                <div className={`${index === 0 ? 'bg-pink-50' : getCategoryColor(task.category)} p-2 rounded-full`}>
                  {getCategoryIcon(task.category)}
                </div>
                
                <div className="flex-grow">
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="text-sm text-gray-500 truncate">{task.description || 'No description'}</p>
                </div>
                
                <div className="text-right">
                  <div className="bg-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                    {formatDueDate(task.dueDate)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>{currentUser ? `No ${filter !== 'all' ? filter : 'pending'} tasks!` : "Sign in to view your tasks"}</p>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-5 flex justify-center">
        <button 
          className="w-full max-w-xs bg-black text-white py-2.5 px-4 rounded-full font-medium text-sm hover:bg-gray-800 transition-colors"
          onClick={() => navigate('/dashboard/tasks')}
        >
          View all tasks
        </button>
      </div>
    </div>
  );
};

export default TasksOverview;
