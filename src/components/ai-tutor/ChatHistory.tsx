import { useState } from 'react';
import { format } from 'date-fns';
import { ChatMessage as ChatMessageType } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Search, MessageCircle, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface ChatHistoryProps {
  messages: ChatMessageType[];
  onClear: () => void;
}

const ChatHistory = ({ messages, onClear }: ChatHistoryProps) => {
  // Group messages by date
  const groupedMessages: Record<string, ChatMessageType[]> = {};
  
  messages.forEach((message) => {
    const date = format(message.timestamp, 'yyyy-MM-dd');
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(
    Object.keys(groupedMessages).length > 0 ? Object.keys(groupedMessages)[0] : null
  );

  const [searchTerm, setSearchTerm] = useState('');

  const renderDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Today';
    } else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  const filteredDates = searchTerm ? 
    Object.keys(groupedMessages).filter(date => 
      groupedMessages[date].some(msg => 
        msg.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ) :
    Object.keys(groupedMessages);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium text-gray-800">Chat History</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClear} 
          className="h-8 px-2 bg-transparent border-none hover:bg-white/20"
        >
          <Trash2 size={16} className="text-gray-600" />
          <span className="sr-only">Clear</span>
        </Button>
      </div>
      
      <div className="px-3 py-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
          <Input
            placeholder="Search conversations"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-sm rounded-full border-gray-200 bg-white shadow-sm"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {filteredDates.length > 0 ? (
          <div className="p-3">
            {filteredDates
              .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
              .map((date) => {
                const filteredMessages = searchTerm ? 
                  groupedMessages[date].filter(msg => 
                    msg.content.toLowerCase().includes(searchTerm.toLowerCase())
                  ) : 
                  groupedMessages[date];
                
                if (filteredMessages.length === 0) return null;
                
                return (
                  <div key={date} className="mb-4">
                    <div className="mb-2 px-2 text-sm font-medium text-gray-600">
                      {renderDateLabel(date)}
                    </div>
                    
                    {filteredMessages.map((msg) => {
                      // Get first 30 characters of the content
                      const preview = msg.content.length > 40 
                        ? `${msg.content.substring(0, 40)}...` 
                        : msg.content;
                        
                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "p-3 mb-1.5 rounded-xl cursor-pointer text-sm transition-colors shadow-sm",
                            selectedDate === date ? "bg-white" : "bg-white/60 hover:bg-white/90"
                          )}
                          onClick={() => setSelectedDate(date)}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium flex items-center gap-1.5">
                              {msg.type === 'user' ? (
                                <>
                                  <User size={14} className="text-[#f4b8dc]" />
                                  <span>You</span>
                                </>
                              ) : (
                                <>
                                  <MessageCircle size={14} className="text-[#f4b8dc]" />
                                  <span>AI Tutor</span>
                                </>
                              )}
                            </span>
                            <span className="text-xs text-gray-500">
                              {format(msg.timestamp, 'h:mm a')}
                            </span>
                          </div>
                          <p className="text-gray-600 truncate mt-1">{preview}</p>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center py-4 text-gray-500">
              No chat history yet
            </div>
          </div>
        )}
      </ScrollArea>
      
      {/* "Coming Soon" Banner */}
      <div className="p-3 border-t border-gray-200 bg-[#f4f4f0]/50">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-2">
          <Clock size={14} />
          <span>This chat feature will be avaliable soon</span>
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
