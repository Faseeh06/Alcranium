import { Button } from '@/components/ui/button';
import { FileText, Sparkles, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromptCardProps {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
}

const PromptCard = ({ title, icon, onClick, className }: PromptCardProps) => (
  <Button
    variant="outline"
    className={cn(
      "h-auto py-3 px-4 flex items-center gap-3 rounded-full hover:bg-white/70 transition-colors text-sm border-gray-200 bg-white shadow-sm w-full justify-start",
      className
    )}
    onClick={onClick}
  >
    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#f4b8dc]/30 flex items-center justify-center text-[#f4b8dc]">
      {icon}
    </div>
    <span className="text-sm font-medium text-gray-800">{title}</span>
  </Button>
);

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  onRefresh?: () => void;
}

const SuggestedPrompts = ({ onSelectPrompt }: SuggestedPromptsProps) => {
  const prompts = [
    {
      title: "Explain a concept",
      icon: <Sparkles size={14} />,
      prompt: "Explain the concept of machine learning algorithms and how they work."
    },
    {
      title: "Create study notes",
      icon: <FileText size={14} />,
      prompt: "Create comprehensive study notes on the American Civil War."
    },
    
  ];

  return (
    <div className="flex flex-col gap-2">
      {prompts.map((prompt, index) => (
        <PromptCard
          key={index}
          title={prompt.title}
          icon={prompt.icon}
          onClick={() => onSelectPrompt(prompt.prompt)}
        />
      ))}
    </div>
  );
};

export default SuggestedPrompts;
