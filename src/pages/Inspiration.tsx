import { useState, useEffect } from 'react';
import { Quote, ThumbsUp, Award, Brain, BookOpen, Crown, Target, Flame } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface MotivationalQuote {
  text: string;
  author: string;
}

interface GoalTemplate {
  title: string;
  description: string;
  icon: JSX.Element;
}

const Inspiration = () => {
  const { currentUser } = useAuth();
  const [quotes, setQuotes] = useState<MotivationalQuote[]>([
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
    { text: "The beautiful thing about learning is that nobody can take it away from you.", author: "B.B. King" },
    { text: "Don't let what you cannot do interfere with what you can do.", author: "John Wooden" },
    { text: "Learning is not attained by chance, it must be sought for with ardor and diligence.", author: "Abigail Adams" }
  ]);
  const [currentQuote, setCurrentQuote] = useState<MotivationalQuote>(quotes[0]);

  // Get user's name from currentUser
  const getUserName = () => {
    if (!currentUser) return "Student";
    
    // If displayName exists, try to extract the actual name
    if (currentUser.displayName) {
      // Check for format "Name (username)"
      const match = currentUser.displayName.match(/(.*)\s*\(.*\)/);
      if (match) {
        return match[1].trim();
      }
      return currentUser.displayName;
    }
    
    // Fallback to email if no display name
    if (currentUser.email) {
      return currentUser.email.split('@')[0];
    }
    
    return "Student";
  };

  // Goal templates
  const goalTemplates: GoalTemplate[] = [
    {
      title: "Master a Subject",
      description: "Focus on deeply understanding one challenging subject that's been giving you trouble.",
      icon: <Brain className="text-purple-500" size={24} />
    },
    {
      title: "Consistent Study Schedule",
      description: "Study for at least 25 minutes daily for the next 30 days.",
      icon: <Flame className="text-orange-500" size={24} />
    },
    {
      title: "Complete a Course",
      description: "Finish an entire course or textbook from start to finish.",
      icon: <BookOpen className="text-blue-500" size={24} />
    },
    {
      title: "Achieve Top Grade",
      description: "Work towards achieving an A or top grade in your most challenging class.",
      icon: <Crown className="text-yellow-500" size={24} />
    },
    {
      title: "Learn a New Skill",
      description: "Master a new skill that complements your main field of study.",
      icon: <Target className="text-green-500" size={24} />
    }
  ];

  // Change quote randomly
  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setCurrentQuote(quotes[randomIndex]);
  };

  useEffect(() => {
    getRandomQuote();
  }, []);

  return (
    <div className="animate-fade-in container mx-auto py-8">
      <h1 className="text-3xl font-light mb-2">Your Daily Inspiration</h1>
      <p className="text-muted-foreground mb-8">Fuel your motivation and achieve your learning goals</p>
      
      {/* Featured Quote */}
      <Card className="p-8 mb-10 bg-[#eee7da] border border-black/40 rounded-xl shadow-sm hover:shadow-md transition-all relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] opacity-5">
          <Quote size={180} />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-light italic mb-4">{currentQuote.text}</h2>
          <p className="text-right font-medium">— {currentQuote.author}</p>
          
          <Button 
            variant="outline" 
            className="mt-4 border-black/20 hover:bg-black/5"
            onClick={getRandomQuote}
          >
            <ThumbsUp className="mr-2 h-4 w-4" /> New Quote
          </Button>
        </div>
      </Card>
      
      {/* Personal Message */}
      <div className="mb-10">
        <h2 className="text-2xl font-light mb-5">Hello, {getUserName()}</h2>
        <Card className="p-6 bg-[#eee7da] border border-black/40 rounded-xl shadow-sm hover:shadow-md transition-all">
          <p className="text-lg">
            Remember why you started this journey. Every moment of study brings you closer to your goals.
            Each challenge you overcome makes you stronger and more capable.
          </p>
          <p className="text-lg mt-4">
            Today is a new opportunity to grow, learn, and progress.
            Your dedication and perseverance will lead to success.
          </p>
        </Card>
      </div>
      
      {/* Goal Templates */}
      <div className="mb-10">
        <h2 className="text-2xl font-light mb-5">Set Inspiring Goals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goalTemplates.map((goal, index) => (
            <Card key={index} className="p-6 bg-[#eee7da] border border-black/40 rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="bg-white/70 rounded-full p-3">
                  {goal.icon}
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">{goal.title}</h3>
                  <p className="text-gray-700">{goal.description}</p>
                </div>
              </div>
              <Button className="w-full mt-4 bg-black text-white hover:bg-black/80">
                Adopt This Goal
              </Button>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Inspirational Tips */}
      <div>
        <h2 className="text-2xl font-light mb-5">Study Motivation Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-[#eee7da] border border-black/40 rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <Award className="text-blue-500" />
              <h3 className="text-lg font-medium">Reward Yourself</h3>
            </div>
            <p>Create a reward system for your study achievements. For every hour of focused study, give yourself a small reward. For major milestones, plan something special.</p>
          </Card>
          
          <Card className="p-6 bg-[#eee7da] border border-black/40 rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <Target className="text-green-500" />
              <h3 className="text-lg font-medium">Visualize Success</h3>
            </div>
            <p>Take a moment each day to visualize achieving your academic goals. Imagine the satisfaction, opportunities, and growth that will come from your hard work.</p>
          </Card>
          
          <Card className="p-6 bg-[#eee7da] border border-black/40 rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="text-purple-500" />
              <h3 className="text-lg font-medium">Break It Down</h3>
            </div>
            <p>Divide large tasks into smaller, manageable chunks. Focus on completing one small part at a time rather than getting overwhelmed by the whole project.</p>
          </Card>
          
          <Card className="p-6 bg-[#eee7da] border border-black/40 rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <Flame className="text-red-500" />
              <h3 className="text-lg font-medium">Find Your Why</h3>
            </div>
            <p>Connect your studies to your deeper purpose. When motivation wanes, remind yourself why this education matters to your future, values, and goals.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Inspiration; 