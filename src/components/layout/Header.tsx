import { useState } from "react";
import { Bell, Search, Sun, Moon, User, Settings } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [searchText, setSearchText] = useState("");
  
  const currentDate = format(new Date(), "MMMM d, yyyy");
  
  return (
    <header className={cn(
      "border-b p-4 transition-colors duration-200", 
      theme === "light" ? "bg-gray-900" : "bg-background"
    )}>
      {/* Search bar at the top */}
      <div className="w-full max-w-5xl mx-auto mb-4 flex items-center justify-between">
        <div className="flex items-center w-2/3">
          <div className="bg-[#e09cc1] rounded-full p-2 mr-2 flex-shrink-0">
            <Search className="text-white" size={18} />
          </div>
          <input
            type="text"
            placeholder="Ask me anything..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-4 pr-4 py-2 rounded-full bg-[#f9f4e8] border border-[#e9e4d8] focus:outline-none focus:ring-1 focus:ring-[#e09cc1] ubuntu-regular text-lg"
          />
        </div>
        
        <div className="flex gap-2">
          <button className="p-2 rounded-full bg-black text-white hover:bg-gray-800">
            <Bell size={20} />
          </button>
          <button className="p-2 rounded-full bg-black text-white hover:bg-gray-800">
            <User size={20} />
          </button>
          <button 
            className="p-2 rounded-full bg-black text-white hover:bg-gray-800"
            onClick={toggleTheme}
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button className="p-2 rounded-full bg-black text-white hover:bg-gray-800">
            <Settings size={20} />
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-light">Good Morning, Alcranium!</h1>
          <p className="text-muted-foreground ubuntu-light text-lg">Your actions today will shape the tomorrow you want</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
