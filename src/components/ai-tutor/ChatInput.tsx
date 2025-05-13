import { useState } from 'react';
import { Send, PaperclipIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  isDisabled?: boolean;
  onRefreshPrompts?: () => void;
}

const ChatInput = ({ onSend, isDisabled = false }: ChatInputProps) => {
  const [input, setInput] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isDisabled) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="relative flex-1">
        <Input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isDisabled}
          className={cn(
            "pr-12 py-3 pl-4 min-h-[50px] resize-none rounded-full border-gray-200 bg-white shadow-sm",
            isDisabled && "opacity-50 cursor-not-allowed"
          )}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            disabled={!input.trim() || isDisabled}
            className="h-8 w-8 rounded-full hover:bg-[#f4b8dc]/20"
          >
            <Send size={18} className="text-gray-600" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
      
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-[50px] w-[50px] rounded-full bg-white border-gray-200 shadow-sm hover:bg-[#f4b8dc]/10"
      >
        <PaperclipIcon size={18} className="text-gray-600" />
        <span className="sr-only">Attach file</span>
      </Button>
    </form>
  );
};

export default ChatInput;
