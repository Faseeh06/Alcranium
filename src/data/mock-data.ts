import { format, addDays, subDays, addHours, subHours } from 'date-fns';

// Generate today's date
const today = new Date();
const todayFormatted = format(today, 'yyyy-MM-dd');

// Task priority types
export type TaskPriority = 'low' | 'medium' | 'high';

// Task interface
export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate: string;
  category: string;
}

// Study session interface
export interface StudySession {
  id: string;
  title: string;
  subject: string;
  start: Date;
  end: Date;
  durationMinutes: number;
}

// User progress interface
export interface UserProgress {
  streak: number;
  totalPoints: number;
  level: number;
  totalStudyHours: number;
  weeklyStudyHours: number[];
  badges: Badge[];
}

// Badge interface
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  date?: Date;
}

// AI suggestion interface
export interface AISuggestion {
  id: string;
  title: string;
  description: string;
  subject: string;
  priority: TaskPriority;
  suggestedDate: string;
}

// Mock tasks
export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Complete Math Assignment",
    description: "Solve problems 1-20 in Chapter 5",
    completed: false,
    priority: "high",
    dueDate: todayFormatted,
    category: "Math"
  },
  {
    id: "2",
    title: "Read Biology Chapter",
    description: "Chapter 8: Cell Division",
    completed: true,
    priority: "medium",
    dueDate: format(subDays(today, 1), 'yyyy-MM-dd'),
    category: "Biology"
  },
  {
    id: "3",
    title: "Prepare Physics Lab Report",
    description: "Write introduction and methodology sections",
    completed: false,
    priority: "high",
    dueDate: format(addDays(today, 2), 'yyyy-MM-dd'),
    category: "Physics"
  },
  {
    id: "4",
    title: "Study for History Test",
    description: "Focus on World War II section",
    completed: false,
    priority: "medium",
    dueDate: format(addDays(today, 3), 'yyyy-MM-dd'),
    category: "History"
  },
  {
    id: "5",
    title: "Complete Literature Essay Outline",
    description: "Outline for Shakespeare analysis",
    completed: false,
    priority: "low",
    dueDate: format(addDays(today, 1), 'yyyy-MM-dd'),
    category: "Literature"
  }
];

// Mock study sessions
export const mockStudySessions: StudySession[] = [
  {
    id: "1",
    title: "Math Revision",
    subject: "Mathematics",
    start: subHours(today, 3),
    end: subHours(today, 1),
    durationMinutes: 120
  },
  {
    id: "2",
    title: "Biology Notes",
    subject: "Biology",
    start: addDays(today, 1),
    end: addDays(addHours(today, 2), 1),
    durationMinutes: 120
  },
  {
    id: "3",
    title: "Physics Problem Solving",
    subject: "Physics",
    start: subDays(today, 1),
    end: subDays(addHours(today, 2), 1),
    durationMinutes: 120
  },
  {
    id: "4",
    title: "History Research",
    subject: "History",
    start: addDays(today, 2),
    end: addDays(addHours(today, 1), 2),
    durationMinutes: 60
  },
  {
    id: "5",
    title: "Literature Essay Writing",
    subject: "Literature",
    start: addDays(today, 3),
    end: addDays(addHours(today, 3), 3),
    durationMinutes: 180
  }
];

// Mock user progress
export const mockUserProgress: UserProgress = {
  streak: 5,
  totalPoints: 1250,
  level: 4,
  totalStudyHours: 56,
  weeklyStudyHours: [2, 3.5, 4, 2.5, 3, 0, 0],
  badges: [
    {
      id: "1",
      name: "Early Bird",
      description: "Completed 5 study sessions before 9 AM",
      icon: "sun",
      earned: true,
      date: subDays(today, 5)
    },
    {
      id: "2",
      name: "Night Owl",
      description: "Completed 3 study sessions after 9 PM",
      icon: "moon",
      earned: true,
      date: subDays(today, 2)
    },
    {
      id: "3",
      name: "Consistency King",
      description: "Maintained a 5-day study streak",
      icon: "calendar",
      earned: true,
      date: today
    },
    {
      id: "4",
      name: "Math Master",
      description: "Completed 10 math assignments",
      icon: "calculator",
      earned: false
    },
    {
      id: "5",
      name: "Speed Reader",
      description: "Read 5 chapters in a single day",
      icon: "book",
      earned: false
    }
  ]
};

// Mock AI suggestions
export const mockAISuggestions: AISuggestion[] = [
  {
    id: "1",
    title: "Review Calculus Concepts",
    description: "Your upcoming math test will likely cover integral calculus. Schedule a review session.",
    subject: "Mathematics",
    priority: "high",
    suggestedDate: format(addDays(today, 1), 'yyyy-MM-dd')
  },
  {
    id: "2",
    title: "Biology Lab Preparation",
    description: "Based on your syllabus, there's a lab coming up. Prepare by reviewing cell structures.",
    subject: "Biology",
    priority: "medium",
    suggestedDate: format(addDays(today, 2), 'yyyy-MM-dd')
  },
  {
    id: "3",
    title: "Physics Formula Review",
    description: "Your performance pattern shows you might need to review kinetics formulas.",
    subject: "Physics",
    priority: "low",
    suggestedDate: format(addDays(today, 3), 'yyyy-MM-dd')
  }
];

// Mock weekly study time data
export const weeklyStudyTime = [
  { day: 'Mon', hours: 2 },
  { day: 'Tue', hours: 3.5 },
  { day: 'Wed', hours: 4 },
  { day: 'Thu', hours: 2.5 },
  { day: 'Fri', hours: 3 },
  { day: 'Sat', hours: 1.5 },
  { day: 'Sun', hours: 2 }
];

// Subject distribution data for chart
export const subjectDistribution = [
  { subject: "Math", percentage: 35 },
  { subject: "Biology", percentage: 20 },
  { subject: "Physics", percentage: 15 },
  { subject: "History", percentage: 20 },
  { subject: "Literature", percentage: 10 },
];
