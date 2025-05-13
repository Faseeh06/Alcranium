import { useState, useRef, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Send, MessageCircle } from 'lucide-react';
import ChatMessage from '@/components/ai-tutor/ChatMessage';
import ChatInput from '@/components/ai-tutor/ChatInput';
import ChatHistory from '@/components/ai-tutor/ChatHistory';
import SuggestedPrompts from '@/components/ai-tutor/SuggestedPrompts';
import { useChat } from '@/contexts/ChatContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAIResponse } from '@/services/aiTutorService';
import { useLocation } from 'react-router-dom';

const AITutor = () => {
  const { theme } = useTheme();
  const { messages, addMessage, clearMessages, isLoading, setIsLoading } = useChat();
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialResponseSent = useRef(false);
  const location = useLocation();
  
  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle any existing message that may have been set from the search bar
  useEffect(() => {
    const shouldRespondToMessage = 
      !initialResponseSent.current && // We haven't already responded
      messages.length > 0 && // There are messages
      messages[messages.length - 1].type === 'user' && // Last message is from user
      !isLoading; // Not currently loading
    
    if (shouldRespondToMessage) {
      // Get the latest user message
      const userQuery = messages[messages.length - 1].content;
      // Mark that we've started processing
      initialResponseSent.current = true;
      // Respond to the user's query
      handleAIResponse(userQuery);
    }
  }, [messages, isLoading, location.pathname]);
  
  // Reset the initialResponseSent when messages are cleared
  useEffect(() => {
    if (messages.length === 0) {
      initialResponseSent.current = false;
    }
  }, [messages.length]);
  
  const handleAIResponse = async (content: string) => {
    setIsLoading(true);
    
    try {
      const response = await getAIResponse(content);
      addMessage(response, 'bot');
    } catch (error) {
      console.error('Error getting AI response:', error);
      addMessage("Sorry, there was an error processing your request. Please try again later.", 'bot');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Add user message
    addMessage(content, 'user');
    
    // Get AI response
    await handleAIResponse(content);
  };

  const handleRefreshPrompts = () => {
    // This would typically fetch new prompts from an API
    console.log('Refreshing prompts...');
  };

  return (
    <div className="h-full animate-fade-in flex flex-col">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-light mb-1">AI Study Tutor</h1>
          <p className="text-muted-foreground ubuntu-light">
            Ask questions and get personalized learning assistance
          </p>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        <div className={`flex-1 flex flex-col ${showHistory ? 'hidden md:flex' : 'flex'} bg-[#eee7da] rounded-xl shadow-sm overflow-hidden`}>
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#eee7da] flex items-center justify-center rounded-full">
                <MessageCircle size={18} className="text-gray-800" />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">AI Study Tutor</h3>
                <p className="text-xs text-gray-500">Always ready to help</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowHistory(!showHistory)} 
              className="md:hidden rounded-full hover:bg-white/50"
            >
              {showHistory ? 'Back' : 'History'}
            </Button>
          </div>
          
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-hidden">
              <div className="max-w-md text-center">
                <h2 className="text-2xl font-light mb-3">Welcome to AI Study Tutor</h2>
                <p className="text-gray-600 mb-8">
                  Ask me anything about your studies, and I'll help you understand concepts, create summaries, or provide practice questions.
                </p>
                
                <div className="mb-4">
                  <h3 className="font-medium mb-4 text-gray-700">Try asking:</h3>
                  <SuggestedPrompts
                    onSelectPrompt={handleSendMessage}
                    onRefresh={handleRefreshPrompts}
                  />
                </div>
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1 px-5 py-6">
              <div className="space-y-6 pb-4">
                {messages.map((msg, index) => (
                  <ChatMessage
                    key={msg.id}
                    content={msg.content}
                    type={msg.type}
                    timestamp={msg.timestamp}
                    showAvatar={index === 0 || messages[index - 1]?.type !== msg.type}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}
          
          <div className="p-4 border-t border-gray-200 bg-white/30">
            <ChatInput 
              onSend={handleSendMessage} 
              isDisabled={isLoading} 
            />
          </div>
        </div>
        
        <div className={`w-full md:w-80 ${showHistory ? 'flex' : 'hidden md:flex'} flex-col h-full bg-[#eee7da] rounded-xl shadow-sm overflow-hidden`}>
          <ChatHistory messages={messages} onClear={clearMessages} />
        </div>
      </div>
    </div>
  );
};

export default AITutor;
