import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage, Role } from '../../types';
import { ProfileIcon, SparklesIcon } from '../icons/NavIcons';

interface MessageBubbleProps {
  message: ChatMessage;
  userRole: Role;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, userRole }) => {
  const isUser = message.sender === 'user';

  const roleColors = {
    [Role.ADMIN]: 'bg-red-500',
    [Role.FACULTY]: 'bg-primary',
    [Role.STUDENT]: 'bg-green-600',
  };

  const bubbleClasses = isUser
    ? `text-white ${roleColors[userRole]}`
    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200';

  const containerClasses = isUser ? 'justify-end' : 'justify-start';
  const contentClasses = isUser ? 'items-end' : 'items-start';
  const icon = isUser ? <ProfileIcon className="h-6 w-6" /> : <SparklesIcon className="h-6 w-6 text-purple-500" />;

  return (
    <div className={`flex items-start space-x-3 my-4 ${containerClasses}`}>
      {!isUser && <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-full">{icon}</div>}
      <div className={`flex flex-col max-w-2xl ${contentClasses}`}>
        <div className={`prose dark:prose-invert prose-sm max-w-none px-4 py-3 rounded-2xl ${bubbleClasses}`}>
          <ReactMarkdown
            children={message.text}
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({node, ...props}) => <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
            }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isUser && <div className={`p-2 rounded-full ${roleColors[userRole]} text-white`}>{icon}</div>}
    </div>
  );
};

export default MessageBubble;
