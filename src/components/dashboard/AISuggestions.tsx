import { Lightbulb, Stethoscope, Syringe, Users } from "lucide-react";
import { mockAISuggestions } from "@/data/mock-data";
import { useNavigate } from "react-router-dom";

const AISuggestions = () => {
  const navigate = useNavigate();

  // Function to get icon based on subject
  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'Mathematics':
        return <Lightbulb className="text-white" size={18} />;
      case 'Biology':
        return <Syringe className="text-white" size={18} />;
      case 'Physics':
        return <Users className="text-white" size={18} />;
      default:
        return <Stethoscope className="text-white" size={18} />;
    }
  };

  // Function to get background color for icon circle
  const getIconBackground = (subject: string) => {
    switch (subject) {
      case 'Mathematics':
        return 'bg-[#f0bfdc]'; // Pink
      case 'Biology':
        return 'bg-[#a8cde9]'; // Light blue
      case 'Physics':
        return 'bg-[#f9d776]'; // Yellow
      default:
        return 'bg-[#f0bfdc]'; // Pink
    }
  };

  // Function to get priority label
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'High Priority';
      case 'medium':
        return 'Medium Priority';
      case 'low':
        return 'Low Priority';
      default:
        return 'Normal Priority';
    }
  };

  const handleViewDetails = () => {
    navigate('/dashboard/ai-tutor');
  };

  return (
    <div className="shadow-sm transition-all bg-[#f6f1e3] p-6 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-medium text-gray-800">AI Study Suggestions</h3>
        <div className="bg-black text-white text-sm px-4 py-1 rounded-full">
          All
        </div>
      </div>
      
      <div className="space-y-6">
        {mockAISuggestions.map((suggestion, index) => (
          <div key={suggestion.id} className={`relative ${index > 0 ? 'pt-2' : ''}`}>
            {index > 0 && (
              <div className="absolute top-0 left-6 h-6 border-l-2 border-dashed border-gray-300" />
            )}
            <div className={`flex items-start gap-4 ${index === 1 ? 'bg-[#f9f7f0] p-4 rounded-xl' : ''}`}>
              <div className={`${getIconBackground(suggestion.subject)} w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0`}>
                {getSubjectIcon(suggestion.subject)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 text-base">{suggestion.title}</h4>
                <p className="text-sm text-gray-500 mb-1">{suggestion.description}</p>
                
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-medium bg-white px-2 py-1 rounded-full">
                    {suggestion.subject}
                  </span>
                  <span className="text-xs text-gray-500">
                    {getPriorityLabel(suggestion.priority)}
                  </span>
                </div>
                
                {index === 1 && (
                  <div className="mt-3 bg-[#e7e2d4] p-2 rounded-lg">
                    <p className="text-xs text-gray-700">
                      This suggestion is based on your recent study patterns and upcoming assignments.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <button 
          onClick={handleViewDetails}
          className="w-full bg-black text-white rounded-full py-2 font-medium flex items-center justify-center"
        >
          View all details
        </button>
      </div>
    </div>
  );
};

export default AISuggestions;
