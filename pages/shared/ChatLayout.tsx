import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, Conversation, Message } from '../../types';
import * as chatService from '../../services/chatService';

const ChatLayout: React.FC = () => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState<User[]>([]);
    const [selectedContact, setSelectedContact] = useState<User | null>(null);
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            chatService.getContacts(user).then(setContacts);
        }
    }, [user]);

    useEffect(() => {
        const loadConversation = async () => {
            if (user && selectedContact) {
                setLoading(true);
                const conv = await chatService.getConversationForUsers(user.id, selectedContact.id);
                setConversation(conv);
                const msgs = await chatService.getMessages(conv.id);
                setMessages(msgs);
                setLoading(false);
            }
        };
        loadConversation();
    }, [selectedContact, user]);

    const handleSendMessage = async (text: string) => {
        if (user && conversation) {
            const newMessage = await chatService.sendMessage(conversation.id, user.id, text);
            setMessages(prev => [...prev, newMessage]);
        }
    };

    return (
        <div className="flex h-[calc(100vh-9rem)] bg-white dark:bg-card-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <ContactList 
                contacts={contacts} 
                onSelectContact={setSelectedContact}
                selectedContactId={selectedContact?.id}
            />
            <ChatWindow 
                contact={selectedContact}
                messages={messages}
                onSendMessage={handleSendMessage}
                currentUser={user}
                loading={loading}
            />
        </div>
    );
};

// --- Sub-components ---

interface ContactListProps {
    contacts: User[];
    onSelectContact: (contact: User) => void;
    selectedContactId?: string | null;
}

const ContactList: React.FC<ContactListProps> = ({ contacts, onSelectContact, selectedContactId }) => (
    <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Messages</h2>
            <div className="mt-3 relative">
                <input 
                    type="text" 
                    placeholder="Search contacts..." 
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {contacts.map(contact => (
                <div 
                    key={contact.id}
                    onClick={() => onSelectContact(contact)}
                    className={`p-4 flex items-center space-x-4 cursor-pointer transition-colors duration-200 hover:bg-white dark:hover:bg-slate-800 ${selectedContactId === contact.id ? 'bg-white dark:bg-slate-800 border-l-4 border-primary shadow-sm' : 'border-l-4 border-transparent'}`}
                >
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {contact.name.charAt(0)}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${selectedContactId === contact.id ? 'text-primary dark:text-primary' : 'text-slate-900 dark:text-white'}`}>{contact.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">{contact.role}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

interface ChatWindowProps {
    contact: User | null;
    messages: Message[];
    onSendMessage: (text: string) => void;
    currentUser: User | null;
    loading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ contact, messages, onSendMessage, currentUser, loading }) => {
    const [text, setText] = useState('');
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onSendMessage(text);
            setText('');
        }
    };

    if (!contact) {
        return (
            <div className="w-2/3 flex flex-col items-center justify-center text-slate-400 bg-white dark:bg-card-dark">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                </div>
                <p className="text-lg font-medium">Select a conversation to start chatting</p>
            </div>
        );
    }
    
    return (
        <div className="w-2/3 flex flex-col bg-slate-50/30 dark:bg-dark-bg/30">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center space-x-4 bg-white dark:bg-card-dark/90 backdrop-blur-sm z-10">
                 <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {contact.name.charAt(0)}
                 </div>
                 <div>
                    <p className="font-bold text-slate-900 dark:text-white">{contact.name}</p>
                    <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Active Now</p>
                    </div>
                 </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                {loading && <div className="text-center text-slate-400 text-sm">Loading conversation...</div>}
                {!loading && messages.map(msg => {
                    const isMe = msg.senderId === currentUser?.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm relative ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-bl-none'}`}>
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                                <p className={`text-[10px] mt-2 text-right ${isMe ? 'text-blue-200' : 'text-slate-400 dark:text-slate-300'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                        </div>
                    );
                })}
                 <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-card-dark border-t border-slate-200 dark:border-slate-700">
                <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                    <input 
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-slate-800 dark:text-white placeholder-slate-400 transition-all"
                    />
                    <button 
                        type="submit" 
                        className="p-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50"
                        disabled={!text.trim()}
                    >
                        <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatLayout;