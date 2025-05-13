import { format } from 'date-fns';
import { MessageType } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import { MessageCircle, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github.css';

interface ChatMessageProps {
  content: string;
  type: MessageType;
  timestamp: Date;
  showAvatar?: boolean;
}

const ChatMessage = ({ content, type, timestamp, showAvatar = true }: ChatMessageProps) => {
  const isUser = type === 'user';

  // Clean up any markdown artifacts that might be showing raw
  const cleanContent = content
    .replace(/@@(.*?)@@/g, '$1') // For any custom formatting
    .replace(/\*\*/g, '**')      // Keep bold as is for markdown
    .replace(/\*\*/g, '**');     // Keep bold as is for markdown

  return (
    <div className={cn(
      "flex items-start gap-3",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && showAvatar && (
        <div className="h-8 w-8 mt-0.5 flex items-center justify-center rounded-full">
          <MessageCircle size={16} className="text-gray-800" />
        </div>
      )}
      
      {!isUser && !showAvatar && <div className="w-8" />}
      
      <div className={cn(
        "max-w-[80%] rounded-xl p-3 relative shadow-sm",
        isUser ? 
          "bg-[#f4b8dc] text-gray-800 rounded-tr-none" : 
          "bg-white text-gray-800 rounded-tl-none"
      )}>
        <div className="prose prose-sm max-w-none break-words text-sm">
          <ReactMarkdown
            rehypePlugins={[
              rehypeRaw, 
              [rehypeHighlight, { detect: true, ignoreMissing: true }]
            ]}
            components={{
              // Style elements
              p: ({ children }) => <p className="mb-2">{children}</p>,
              h1: ({ children }) => <h1 className="text-xl font-bold my-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-lg font-bold my-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-md font-bold my-2">{children}</h3>,
              h4: ({ children }) => <h4 className="text-base font-bold my-2">{children}</h4>,
              strong: ({ children }) => <strong className="font-bold">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              ul: ({ children }) => <ul className="list-disc pl-5 my-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-5 my-2">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              a: ({ href, children }) => <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
              code: ({ node, inline, className, children, ...props }) => {
                if (inline) {
                  return <code className="bg-gray-100 rounded px-1 py-0.5 text-sm">{children}</code>
                }
                return (
                  <pre className="bg-gray-100 rounded p-2 text-sm overflow-auto my-2">
                    <code className={className}>{children}</code>
                  </pre>
                )
              },
              blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2">{children}</blockquote>,
              table: ({ children }) => <table className="min-w-full divide-y divide-gray-200 my-2">{children}</table>,
              thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
              tbody: ({ children }) => <tbody className="divide-y divide-gray-200">{children}</tbody>,
              tr: ({ children }) => <tr>{children}</tr>,
              th: ({ children }) => <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>,
              td: ({ children }) => <td className="px-2 py-1 text-sm text-gray-500">{children}</td>,
            }}
          >
            {cleanContent}
          </ReactMarkdown>
        </div>
        <div className={cn(
          "text-xs mt-1",
          isUser ? "text-gray-800/70" : "text-gray-500"
        )}>
          {format(timestamp, 'h:mm a')}
        </div>
      </div>
      
      {isUser && showAvatar && (
        <div className="h-8 w-8 mt-0.5 bg-[#f4b8dc] flex items-center justify-center rounded-full">
          <User size={16} className="text-gray-800" />
        </div>
      )}
      
      {isUser && !showAvatar && <div className="w-8" />}
    </div>
  );
};

export default ChatMessage;
