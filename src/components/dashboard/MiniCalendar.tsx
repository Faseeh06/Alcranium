import { useState } from "react";
import { ChevronLeft, ChevronRight, FilePlus, RefreshCw } from "lucide-react";
import { format, addMonths, subMonths, getWeek, getDay, isSameDay, isToday } from "date-fns";
import { useNavigate } from "react-router-dom";

const MiniCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date(2024, 4, 15)); // May 15, 2024 for the example
  const navigate = useNavigate();
  
  // Day headers are now "MO", "TU", etc. as shown in the image
  const dayHeaders = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
  
  // Getting all dates for the current month view
  const getCalendarDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Calculate day of week (0 = Sunday, 6 = Saturday)
    // But we need Monday as 0, so we adjust
    const firstDayOfWeek = getDay(firstDay) === 0 ? 6 : getDay(firstDay) - 1;
    
    // Total days in the month
    const daysInMonth = lastDay.getDate();
    
    // Create array for week numbers
    const weekNumbers: number[] = [];
    
    // Create array of date objects for the month
    const dates: (Date | null)[] = [];
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      dates.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      dates.push(date);
      
      // If this is a Monday (getDay() = 1) or it's the first day of the month
      if (getDay(date) === 1 || i === 1) {
        weekNumbers.push(getWeek(date));
      }
    }
    
    return { dates, weekNumbers };
  };
  
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const isSelected = (date: Date | null): boolean => {
    if (!date) return false;
    return date.getDate() === selectedDate.getDate() && 
           date.getMonth() === selectedDate.getMonth() && 
           date.getFullYear() === selectedDate.getFullYear();
  };
  
  const { dates, weekNumbers } = getCalendarDates();
  
  // Calculate weeks based on dates array
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }
  
  const handleAddEvent = () => {
    // Navigate to the calendar page
    navigate("/dashboard/calendar");
  };
  
  return (
    <div className="shadow-sm transition-all bg-[#f6f1e3] p-6 rounded-xl -mt-40 z-10">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={goToPreviousMonth}
          className="text-gray-600 hover:text-black"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className="text-center bg-[#f0bfdc] px-6 py-1 rounded-full text-base font-medium">
          {format(currentMonth, "MMMM yyyy")}
        </div>
        
        <button 
          onClick={goToNextMonth}
          className="text-gray-600 hover:text-black"
        >
          <ChevronRight size={24} />
        </button>
      </div>
      
      <div className="grid grid-cols-8 gap-2 mb-1">
        {/* Empty cell for the corner */}
        <div className=""></div>
        
        {/* Day headers */}
        {dayHeaders.map((day, index) => (
          <div key={index} className="text-center text-gray-500 font-medium text-sm">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid with week numbers */}
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-8 gap-2 mb-1">
          {/* Week number */}
          <div className="text-right pr-1 text-xs bg-gray-200 rounded-md flex items-center justify-center text-gray-600 font-medium">
            W{weekNumbers[weekIndex]}
          </div>
          
          {/* Days in the week */}
          {week.map((date, dayIndex) => (
            <div 
              key={`${weekIndex}-${dayIndex}`} 
              className={`
                text-center py-2 text-base relative cursor-pointer
                ${!date ? 'opacity-0' : ''}
                ${isSelected(date) ? 'bg-[#f0bfdc] rounded-full text-black font-bold' : ''}
                ${date && isToday(date) && !isSelected(date) ? 'border-2 border-[#f0bfdc] rounded-full text-black font-bold' : ''}
                ${date && !isToday(date) && !isSelected(date) ? 'hover:bg-gray-100 rounded-full' : ''}
              `}
              onClick={() => date && setSelectedDate(date)}
            >
              {date?.getDate()}
            </div>
          ))}
        </div>
      ))}
      
      {/* Add event button and action buttons */}
      <div className="mt-6 flex items-center justify-between">
        <button 
          className="bg-black text-white rounded-full py-2 px-20 font-medium flex items-center justify-center hover:bg-gray-800 transition-colors"
          onClick={handleAddEvent}
        >
          <span>Add event</span>
        </button>
        
        <div className="flex gap-4">
          <button className="p-2 rounded-full bg-gray-200">
            <RefreshCw size={20} />
          </button>
          <button className="p-2 rounded-full bg-gray-200">
            <FilePlus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniCalendar; 