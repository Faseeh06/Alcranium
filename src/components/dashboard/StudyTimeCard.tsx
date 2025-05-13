import { Clock } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { weeklyStudyTime } from "@/data/mock-data";
import { useNavigate } from "react-router-dom";

// Get the current day of the week in the same format as our data
const getCurrentDayIndex = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Convert JavaScript's day of week (0-6, starting with Sunday)
  // to our data format (0-6, starting with Monday)
  // Monday (1 in JS) becomes 0, Sunday (0 in JS) becomes 6
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
};

// Create a new array with solid and dotted bars
const enhancedStudyTime = weeklyStudyTime.map((item, index) => ({
  ...item,
  // Only the current day will be dotted
  isDotted: index === getCurrentDayIndex()
}));

const StudyTimeCard = () => {
  const navigate = useNavigate();
  const totalHoursThisWeek = weeklyStudyTime.reduce((total, day) => total + day.hours, 0);
  
  const handleClick = () => {
    navigate('/dashboard/weeklytime');
  };
  
  return (
    <div 
      className="study-time-card h-[367px] cursor-pointer hover:shadow-lg transition-all" 
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-light">Weekly Study Time</h3>
        <Clock className="text-white" />
      </div>
      
      <div className="mb-4">
        <div className="text-2xl font-light">{totalHoursThisWeek} hours</div>
        <p className="text-sm text-muted-foreground">Total study time this week</p>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={enhancedStudyTime} margin={{ top: 20 }}>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              cursor={false}
              contentStyle={{ 
                backgroundColor: 'black',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
              labelStyle={{ color: 'white', fontWeight: 500, marginBottom: '4px' }}
              itemStyle={{ color: 'white', fontWeight: 300 }}
              formatter={(value) => [`${value} hours`, 'Study Time']}
            />
            <Bar 
              dataKey="hours" 
              radius={[3, 3, 0, 0]}
              barSize={20}
              shape={(props) => {
                const { x, y, width, height, isDotted } = props;
                return (
                  <rect 
                    x={x} 
                    y={y} 
                    width={width} 
                    height={height} 
                    fill={isDotted ? "transparent" : "black"}
                    stroke="black"
                    strokeWidth={isDotted ? 1.5 : 0}
                    strokeDasharray={isDotted ? "5,2" : "0"} 
                    rx={3}
                    ry={3}
                  />
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StudyTimeCard;
