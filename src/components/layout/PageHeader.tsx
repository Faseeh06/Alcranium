import { useState, useRef } from "react";
import { Bell, Search, User, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChat } from "@/contexts/ChatContext";

const PageHeader = () => {
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const { addMessage, clearMessages, messages } = useChat();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchText.trim()) {
      // Store the search text temporarily
      const query = searchText.trim();
      
      // Clear the search field first
      setSearchText("");
      
      // Clear previous chat messages
      clearMessages();
      
      // Add the user's query as a message
      addMessage(query, 'user');
      
      // Navigate to AI Tutor page after adding the message
      navigate("/dashboard/ai-tutor");
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e as unknown as React.FormEvent);
    }
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto mb-6 flex items-center justify-between">
      <form onSubmit={handleSearchSubmit} className="flex items-center w-2/3">
        <div className="bg-[#e09cc1] rounded-full p-2 mr-2 flex-shrink-0">
          <Search className="text-white" size={18} />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask me anything..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-4 pr-4 py-2 rounded-full bg-[#f9f4e8] border border-[#e9e4d8] focus:outline-none focus:ring-1 focus:ring-[#e09cc1] ubuntu-regular text-lg"
        />
      </form>
      
      <div className="flex gap-2">
        <button className="p-2 rounded-full bg-black text-white hover:bg-gray-800">
          <Bell size={20} />
        </button>
        <button 
          className="p-2 rounded-full bg-black text-white hover:bg-gray-800"
          onClick={() => navigate("/dashboard/profile")}
        >
          <User size={20} />
        </button>
        <button 
          className="p-2 rounded-full bg-black text-white hover:bg-gray-800"
          onClick={() => navigate("/dashboard/settings")}
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
};

export default PageHeader; 