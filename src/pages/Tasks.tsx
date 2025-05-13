import { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  CheckCircle, 
  Trash2, 
  Edit, 
  Filter, 
  Search,
  ArrowUp,
  ArrowDown,
  Calendar,
  Clock,
  X, 
  AlertTriangle
} from "lucide-react";
import { Task, TaskPriority } from "@/data/mock-data";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { getUserTasks, addTask, updateTask, deleteTask, ensureCollectionsExist } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Tasks = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending">("all");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">("all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Task form modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium" as TaskPriority,
    dueDate: format(new Date(), 'yyyy-MM-dd')
  });

  // Check authentication and redirect if needed
  useEffect(() => {
    const checkAuth = async () => {
      // Short delay to allow auth state to initialize
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!currentUser) {
        toast({
          title: "Authentication required",
          description: "Please sign in to view and manage your tasks",
          variant: "destructive"
        });
        navigate("/signin");
      }
    };
    
    checkAuth();
  }, [currentUser, navigate, toast]);

  // Ensure Firestore collections exist
  useEffect(() => {
    const init = async () => {
      try {
        await ensureCollectionsExist();
      } catch (err) {
        console.error("Failed to initialize collections:", err);
      }
    };
    
    init();
  }, []);

  // Load tasks from Firebase
  useEffect(() => {
    const loadTasks = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        setError(null);
        console.log("Loading tasks for user:", currentUser.uid); // Debug log
        const userTasks = await getUserTasks(currentUser.uid);
        console.log("Tasks loaded:", userTasks.length, userTasks); // Debug log
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
    
    if (currentUser) {
      loadTasks();
    }
  }, [currentUser, toast]);
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  const getPriorityLabel = (priority: TaskPriority): string => {
    switch (priority) {
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
    }
  };
  
  const getPriorityValue = (priority: TaskPriority): number => {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
    }
  };
  
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
  
  const handleDeleteTask = async (taskId: string) => {
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
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully",
      });
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
  
  const openEditTaskModal = (task: Task) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to manage tasks",
        variant: "destructive"
      });
      return;
    }
    
    setTaskForm({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate
    });
    setEditingTaskId(task.id);
    setIsTaskModalOpen(true);
  };
  
  const openAddTaskModal = () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to manage tasks",
        variant: "destructive"
      });
      navigate("/signin");
      return;
    }
    
    // Reset form to defaults
    setTaskForm({
      title: "",
      description: "",
      category: "",
      priority: "medium",
      dueDate: format(new Date(), 'yyyy-MM-dd')
    });
    setEditingTaskId(null);
    setIsTaskModalOpen(true);
  };
  
  const handleTaskFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePriorityChange = (value: string) => {
    setTaskForm(prev => ({ ...prev, priority: value as TaskPriority }));
  };
  
  const handleSaveTask = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to manage tasks",
        variant: "destructive"
      });
      return;
    }
    
    // Validate form
    if (!taskForm.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task title",
        variant: "destructive"
      });
      return;
    }
    
    setFormSubmitting(true);
    
    try {
      if (editingTaskId) {
        // Edit existing task
        await updateTask(editingTaskId, taskForm);
        
        // Update local state
        setTasks(prev => prev.map(task => 
          task.id === editingTaskId 
            ? { ...task, ...taskForm }
            : task
        ));
        
        toast({
          title: "Task updated",
          description: "The task has been updated successfully",
        });
      } else {
        // Add new task
        const newTaskId = await addTask({
          ...taskForm,
          completed: false,
          userId: currentUser.uid
        });
        
        // Update local state
        setTasks(prev => [
          ...prev, 
          {
            id: newTaskId,
            ...taskForm,
            completed: false
          }
        ]);
        
        toast({
          title: "Task created",
          description: "The new task has been created successfully",
        });
      }
      
      // Close modal
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error("Error saving task:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: `Failed to save task: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setFormSubmitting(false);
    }
  };
  
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };
  
  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(task => {
      // Filter by search term
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            task.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by status
      const matchesStatus = 
        filterStatus === "all" ||
        (filterStatus === "completed" && task.completed) ||
        (filterStatus === "pending" && !task.completed);
      
      // Filter by priority
      const matchesPriority = 
        filterPriority === "all" ||
        task.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      // Sort by priority
      const priorityDiff = getPriorityValue(b.priority) - getPriorityValue(a.priority);
      
      // If priorities are the same, sort by due date
      if (priorityDiff === 0) {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
      
      return sortDirection === "asc" ? priorityDiff : -priorityDiff;
    });

  const isToday = (dateString: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return dateString === today;
  };
  
  if (!currentUser) {
    return (
      <div className="animate-fade-in p-8 bg-[#eee7da] rounded-xl text-center">
        <p className="text-muted-foreground">Please sign in to view your tasks</p>
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
          <h1 className="text-3xl font-light mb-1">Tasks</h1>
          <p className="text-muted-foreground ubuntu-light">
            Manage and organize your daily tasks
          </p>
        </div>
        
        <button
          onClick={openAddTaskModal}
          className="mt-4 md:mt-0 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Add New Task</span>
        </button>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 rounded-full border bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground" />
          <select
            className="flex-1 px-3 py-2 rounded-full border bg-background"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "all" | "completed" | "pending")}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground" />
          <select
            className="flex-1 px-3 py-2 rounded-full border bg-background"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as TaskPriority | "all")}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
        
        <button
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-full border hover:bg-secondary transition-colors"
          onClick={toggleSortDirection}
        >
          <span>Sort by Date</span>
          {sortDirection === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
        </button>
      </div>
      
      {/* Task List */}
      <div className="rounded-lg overflow-hidden space-y-3 p-1">
        {loading ? (
          <div className="p-8 bg-[#eee7da] rounded-xl text-center">
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <div 
              key={task.id} 
              className={`p-4 rounded-xl ${task.completed ? 'opacity-70' : ''} bg-[#eee7da] hover:bg-[#e9e2d5] transition-colors`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleTaskComplete(task.id)}
                  className="text-gray-400 hover:text-primary transition-colors"
                >
                  <CheckCircle 
                    size={24} 
                    className={task.completed ? "text-green-500" : "text-gray-300"} 
                    fill={task.completed ? "currentColor" : "none"}
                  />
                </button>
                
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </h3>
                    {task.category && (
                      <span className="bg-[#f4b8dc] text-xs px-2 py-0.5 rounded-full text-gray-800">
                        {task.category}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">{task.description}</p>
                </div>
                
                <div className="text-sm flex items-center gap-2 whitespace-nowrap">
                  <Calendar size={14} className="text-gray-500" />
                  <div className={`font-medium ${isToday(task.dueDate) ? 'text-pink-600' : ''}`}>
                    {isToday(task.dueDate) ? 'Today' : format(new Date(task.dueDate), "MMM d, yyyy")}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditTaskModal(task)}
                    className="p-2 hover:bg-white rounded-full transition-colors"
                    title="Edit task"
                  >
                    <Edit size={16} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 hover:bg-white rounded-full transition-colors"
                    title="Delete task"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 bg-[#eee7da] rounded-xl text-center">
            <p className="text-muted-foreground">No tasks found matching your filters</p>
            <button 
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
                setFilterPriority("all");
              }}
              className="mt-2 text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
      
      {/* Task Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTaskId ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                name="title"
                value={taskForm.title}
                onChange={handleTaskFormChange}
                placeholder="Enter task title"
                disabled={formSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={taskForm.description}
                onChange={handleTaskFormChange}
                placeholder="Enter task description"
                rows={3}
                disabled={formSubmitting}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={taskForm.category}
                  onChange={handleTaskFormChange}
                  placeholder="E.g., Work, Study"
                  disabled={formSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={taskForm.priority}
                  onValueChange={handlePriorityChange}
                  disabled={formSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={taskForm.dueDate}
                onChange={handleTaskFormChange}
                disabled={formSubmitting}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskModalOpen(false)} disabled={formSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSaveTask} disabled={formSubmitting}>
              {formSubmitting 
                ? 'Saving...' 
                : editingTaskId ? 'Update Task' : 'Add Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tasks;
