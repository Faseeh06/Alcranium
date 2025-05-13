import { Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InspirationWidget = () => {
  const navigate = useNavigate();
  
  const randomTip = () => {
    const tips = [
      "Take short breaks to maintain focus",
      "Stay hydrated for better brain function",
      "Connect new concepts to things you already know",
      "Test yourself often - it improves recall",
      "Get enough sleep for better memory consolidation",
      "Set specific goals for each study session",
      "Try teaching the material to someone else",
      "Use visual aids and mind maps",
      "Create a dedicated study environment"
    ];
    
    return tips[Math.floor(Math.random() * tips.length)];
  };

  const handleClick = () => {
    navigate("/dashboard/inspiration");
  };

  return (
    <div 
      className="p-5 rounded-xl cursor-pointer transition-all bg-[#eee7da] border border-black/40 hover:shadow-md"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-light text-black">Inspiration</h3>
        <Lightbulb className="text-yellow-500" />
      </div>
      
      <div className="flex flex-col gap-3">
        <p className="text-gray-700 text-sm italic">"{randomTip()}"</p>
        
        <div className="bg-black/5 p-3 rounded-lg">
          <p className="text-sm text-gray-700">
            Need motivation? Visit our inspiration page for quotes, goal templates, and study strategies.
          </p>
        </div>
        
        <button 
          className="w-full mt-2 py-2 bg-black text-white rounded-lg hover:bg-black/80 transition-colors text-sm font-medium"
        >
          Get Inspired
        </button>
      </div>
    </div>
  );
};

export default InspirationWidget; 