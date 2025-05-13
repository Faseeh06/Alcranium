
import { BookOpen } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { subjectDistribution } from "@/data/mock-data";

const COLORS = ['#9b87f5', '#F2FCE2', '#FEF7CD', '#D3E4FD', '#FFDEE2'];

const SubjectDistribution = () => {
  return (
    <div className="card-gradient stats-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-light">Subject Distribution</h3>
        <BookOpen className="text-study-purple" />
      </div>
      
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={subjectDistribution}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="percentage"
              nameKey="subject"
              label={({ name, value }) => `${name}: ${value}%`}
              labelLine={false}
            >
              {subjectDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value}%`, 'Percentage']}
              contentStyle={{
                backgroundColor: 'var(--background)',
                borderColor: 'var(--border)',
                borderRadius: 'var(--radius)',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SubjectDistribution;
