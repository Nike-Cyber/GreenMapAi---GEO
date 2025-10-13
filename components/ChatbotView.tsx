
import React, { useState, useRef, useEffect } from 'react';
import { getChatbotResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import Button from './ui/Button';
import { FaPaperPlane, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const ChatbotView: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 1, sender: 'bot', text: 'Hi there! I\'m Leafy, your friendly eco-assistant. How can I help you today? 🌱' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => {
        try {
            return localStorage.getItem('greenmap_voice_enabled') === 'true';
        } catch {
            return false;
        }
    });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isBotTyping]);
    
    useEffect(() => {
        try {
            localStorage.setItem('greenmap_voice_enabled', String(isVoiceEnabled));
        } catch (error) {
            console.error("Could not access localStorage:", error);
        }
    }, [isVoiceEnabled]);

    const speak = (text: string) => {
        if (!isVoiceEnabled || !('speechSynthesis' in window)) {
            return;
        }
        speechSynthesis.cancel(); // Cancel any previous speech
        const utterance = new SpeechSynthesisUtterance(text);
        // Add natural variation
        utterance.rate = 0.9 + Math.random() * 0.2; // Varies rate between 0.9 and 1.1
        utterance.pitch = 0.9 + Math.random() * 0.2; // Varies pitch between 0.9 and 1.1
        speechSynthesis.speak(utterance);
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!userInput.trim()) return;

        const newUserMessage: ChatMessage = {
            id: Date.now(),
            sender: 'user',
            text: userInput,
        };
        setMessages(prev => [...prev, newUserMessage]);
        const currentInput = userInput;
        setUserInput('');
        setIsBotTyping(true);

        const botResponseText = await getChatbotResponse(currentInput);

        const newBotMessage: ChatMessage = {
            id: Date.now() + 1,
            sender: 'bot',
            text: botResponseText,
        };
        
        setIsBotTyping(false);
        setMessages(prev => [...prev, newBotMessage]);
        speak(botResponseText);
    };

    return (
        <div className="container mx-auto p-4 md:p-8 h-[calc(100vh-174px)] md:h-[calc(100vh-76px)] flex flex-col animate-fade-in-up">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold text-forest-green dark:text-dark-text">Chat with Leafy</h1>
                <p className="text-lg text-lime-green dark:text-light-green mt-1">Your AI-powered environmental assistant.</p>
            </header>
            <div className="flex-grow flex flex-col bg-white/70 dark:bg-dark-card backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="space-y-4">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-lime-green flex items-center justify-center text-white text-lg flex-shrink-0">🌱</div>}
                                <div className={`max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-lime-green text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-600 text-forest-green dark:text-dark-text rounded-bl-none'}`}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isBotTyping && (
                             <div className="flex items-end gap-2 justify-start">
                                 <div className="w-8 h-8 rounded-full bg-lime-green flex items-center justify-center text-white text-lg flex-shrink-0">🌱</div>
                                 <div className="max-w-xs px-4 py-2 rounded-2xl bg-gray-200 dark:bg-gray-600 text-forest-green dark:text-dark-text rounded-bl-none">
                                    <div className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                    </div>
                                 </div>
                             </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
                <div className="p-4 border-t border-lime-green/30 dark:border-gray-600">
                    <form onSubmit={handleSend} className="flex items-center space-x-2">
                         <button
                            type="button"
                            onClick={() => setIsVoiceEnabled(prev => !prev)}
                            className="p-2 rounded-full text-forest-green dark:text-dark-text-secondary hover:bg-lime-green/20 dark:hover:bg-gray-700 transition-colors"
                            aria-label={isVoiceEnabled ? "Disable voice output" : "Enable voice output"}
                        >
                            {isVoiceEnabled ? <FaVolumeUp size={20}/> : <FaVolumeMute size={20}/>}
                        </button>
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Ask me about the environment..."
                            className="flex-1 px-4 py-2 border border-lime-green/50 dark:border-gray-500 bg-white dark:bg-gray-700 text-forest-green dark:text-dark-text rounded-full focus:outline-none focus:ring-2 focus:ring-lime-green"
                        />
                        <Button type="submit" className="rounded-full !px-4" aria-label="Send message">
                            <FaPaperPlane />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatbotView;