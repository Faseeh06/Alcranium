import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  ListChecks, 
  Calendar, 
  BookOpen, 
  Settings,
  Clock,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  User,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const sidebarItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Tasks", icon: ListChecks, path: "/dashboard/tasks" },
    { name: "Pomodoro", icon: Clock, path: "/dashboard/pomodoro" },
    { name: "Calendar", icon: Calendar, path: "/dashboard/calendar" },
    { name: "Study Material", icon: BookOpen, path: "/dashboard/materials" },
    { name: "AI Tutor", icon: MessageCircle, path: "/dashboard/ai-tutor" },
    { name: "Inspiration", icon: Lightbulb, path: "/dashboard/inspiration" },
    { name: "Settings", icon: Settings, path: "/dashboard/settings" },
  ];

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <div className="ml-[0.7%] mt-[0.7%] mb-[0.7%]">
      <div className={cn(
        "flex flex-col h-full transition-all duration-300 border-r z-10 relative bg-sidebar rounded-xl shadow-lg",
        collapsed ? "w-16" : "w-64"
      )}>
        <div className={cn(
          "flex items-center p-4",
          collapsed ? "justify-center" : "justify-between"
        )}>
          <div className={cn("flex items-center", collapsed && "justify-center")}>          
            <img 
              src="https://i.postimg.cc/ZnZMWhxb/image.png" 
              alt="Alcranium Logo" 
              className="h-8 w-8"
            />
            <span className={cn(
              "ml-2 text-2xl text-white transition-all unbounded-logo",
              collapsed && "hidden"
            )}>
              Alcranium
            </span>
          </div>
          
          {!collapsed && (
            <button 
              className="text-white p-1 rounded hover:bg-sidebar-accent"
              onClick={toggleSidebar}
            >
              <ChevronLeft size={20} />
            </button>
          )}
        </div>

        <div className="flex flex-col flex-1 py-4">
          {sidebarItems.map((item) => (
            <button
              key={item.name}
              className={cn(
                "sidebar-link mx-2 mb-1 ubuntu-light text-lg",
                location.pathname === item.path && "active"
              )}
              onClick={() => navigate(item.path)}
            >
              <item.icon size={20} />
              <span className={cn("transition-all", collapsed && "hidden")}>
                {item.name}
              </span>
            </button>
          ))}
        </div>

        {/* Profile link at the bottom */}
        <div className="mt-auto py-4">
          <button
            className={cn(
              "sidebar-link mx-2 mb-1 ubuntu-light text-lg",
              location.pathname === "/profile" && "active"
            )}
            onClick={() => navigate("/dashboard/profile")}
          >
            <User size={20} />
            <span className={cn("transition-all", collapsed && "hidden")}>
              Profile
            </span>
          </button>
        </div>

        {collapsed && (
          <button 
            className="absolute -right-3 top-8 bg-[#e09cc1] text-white p-1 rounded-full border border-white shadow-md"
            onClick={toggleSidebar}
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
