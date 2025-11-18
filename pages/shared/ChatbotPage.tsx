import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ChatMessage } from '../../types';
import * as aiService from '../../services/aiService';
import MessageBubble from '../../components/chatbot/MessageBubble';
import TypingIndicator from '../../components/chatbot/TypingIndicator';
import { SparklesIcon } from '../../components/icons/NavIcons';

const ChatbotPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const storageKey = `chatHistory_${user?.id}`;

  useEffect(() => {
    if (!user) return;
    try {
      const savedHistory = sessionStorage.getItem(storageKey);
      if (savedHistory) {
        setMessages(JSON.parse(savedHistory));
      } else {
         setMessages([{
            id: 'welcome-msg',
            sender: 'ai',
            text: `Hello **${user?.name}**! I am your advanced AI Academic Assistant.\n\nI can help you with:\n- Generating Study Notes 📝\n- Explaining Complex Topics 💡\n- Creating Practice Quizzes ❓\n\nHow can I assist you today?`,
            timestamp: new Date().toISOString()
         }]);
      }
    } catch (error) {
      console.error("Failed to load chat history", error);
    }
  }, [storageKey, user]);

  useEffect(() => {
    if (!user) return;
    try {
      if (messages.length > 1 || (messages.length === 1 && messages[0].id !== 'welcome-msg')) {
        sessionStorage.setItem(storageKey, JSON.stringify(messages));
      }
    } catch (error) {
      console.error("Failed to save chat history", error);
    }
  }, [messages, storageKey, user]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date().toISOString(),
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const historyForApi = messages;
      const aiResponseText = await aiService.generateResponse(input, historyForApi);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Sorry, I am having trouble connecting to the server. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-card-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-card-dark/80 backdrop-blur-md z-10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg shadow-lg shadow-purple-500/20">
                <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-white">AI Academic Assistant</h1>
                <p className="text-xs text-emerald-500 font-medium flex items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
                    Online & Ready
                </p>
            </div>
        </div>
        <button 
            onClick={() => {
                if(window.confirm("Clear chat history?")) {
                    setMessages([]); 
                    sessionStorage.removeItem(storageKey);
                }
            }}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors"
        >
            Clear Chat
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-dark-bg/50">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} userRole={user.role} />
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-700 rounded-2xl rounded-tl-none p-4 shadow-sm">
                    <TypingIndicator />
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-card-dark border-t border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSend} className="relative flex items-center max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your studies..."
            disabled={isLoading}
            className="w-full pl-6 pr-14 py-4 bg-slate-100 dark:bg-slate-800 border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary/50 text-slate-800 dark:text-white placeholder-slate-400 shadow-inner transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/30"
          >
            <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-400 mt-2">AI responses can vary. Verify important information.</p>
      </div>
    </div>
  );
};

export default ChatbotPage;