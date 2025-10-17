import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { getChatbotResponse } from '../services/geminiService';
import Card from './ui/Card';
import Button from './ui/Button';
import { FaPaperPlane, FaRobot } from 'react-icons/fa';

const ChatbotView: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 1, sender: 'bot', text: 'Hello! I am GreenBot. How can I help you with your environmental questions or GreenMap today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const MAX_CHARS = 500;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now(),
            sender: 'user',
            text: input,
        };

        const botMessageId = Date.now() + 1;
        const botPlaceholderMessage: ChatMessage = {
            id: botMessageId,
            sender: 'bot',
            text: '',
            isTyping: true,
        };
        
        const updatedMessages = [...messages, userMessage, botPlaceholderMessage];
        setMessages(updatedMessages);
        
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        const historyForApi = updatedMessages
            .filter(m => m.id !== botMessageId) // Exclude the placeholder from history
            .map(({id, isTyping, ...rest}) => rest);

        getChatbotResponse(
            currentInput,
            historyForApi,
            (chunk) => { // onChunk
                setMessages(prev => 
                    prev.map(msg => 
                        msg.id === botMessageId 
                        ? { ...msg, text: msg.text + chunk, isTyping: false } 
                        : msg
                    )
                );
            },
            () => { // onComplete
                setIsLoading(false);
            },
            (error) => { // onError
                console.error("Chatbot error:", error);
                setMessages(prev => 
                    prev.map(msg => 
                        msg.id === botMessageId 
                        ? { ...msg, text: "Sorry, I'm having a little trouble connecting to my circuits right now. Please try again in a moment.", isTyping: false } 
                        : msg
                    )
                );
                setIsLoading(false);
            }
        );
    };

    return (
        <div className="container mx-auto p-4 md:p-8 flex flex-col h-[calc(100vh-174px)] md:h-[calc(100vh-76px)] animate-fade-in-up">
            <header className="text-center mb-4">
                <h1 className="text-4xl font-bold text-forest-green dark:text-dark-text">AI Chatbot</h1>
                <p className="text-lg text-lime-green dark:text-light-green mt-1">Your personal environmental assistant.</p>
            </header>
            <Card className="flex-1 flex flex-col p-0 overflow-hidden">
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'bot' && <div className="w-10 h-10 rounded-full bg-lime-green/20 flex items-center justify-center flex-shrink-0"><FaRobot className="text-lime-green" /></div>}
                            <div className={`max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-lime-green text-white rounded-br-none' : 'bg-white dark:bg-dark-bg/80 text-forest-green dark:text-dark-text rounded-bl-none'}`}>
                                {msg.isTyping ? (
                                    <div className="flex items-center gap-1.5 py-1">
                                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                                    </div>
                                ) : (
                                    <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-lime-green/20 dark:border-gray-600 bg-cream/50 dark:bg-dark-card/50">
                    <form onSubmit={handleSendMessage} className="flex items-start gap-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => {
                                    if (e.target.value.length <= MAX_CHARS) {
                                        setInput(e.target.value);
                                    }
                                }}
                                placeholder="Chat with GreenBot... (e.g., 'What are the benefits of tree planting?')"
                                className="w-full px-4 py-2 pr-20 border border-lime-green/50 rounded-full focus:outline-none focus:ring-2 focus:ring-lime-green bg-white dark:bg-gray-700 dark:text-white transition-shadow focus:shadow-md"
                                disabled={isLoading}
                                maxLength={MAX_CHARS}
                                aria-label="Chat message input"
                            />
                             <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                <span className={`text-sm font-medium ${input.length > MAX_CHARS - 50 ? 'text-earth-red' : 'text-gray-400 dark:text-gray-500'}`}>
                                    {input.length}/{MAX_CHARS}
                                </span>
                            </div>
                        </div>
                        <Button 
                            type="submit" 
                            disabled={isLoading || !input.trim()} 
                            className="rounded-full !p-3.5 flex-shrink-0 disabled:bg-lime-green/50 disabled:hover:bg-lime-green/50 disabled:scale-100"
                            aria-label="Send message"
                        >
                            <FaPaperPlane />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
};

export default ChatbotView;