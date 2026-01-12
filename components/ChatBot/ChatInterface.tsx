"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, MessageCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { useSession } from "next-auth/react";

interface Message {
    role: "user" | "bot";
    content: string;
}

interface ChatInterfaceProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChatInterface({ isOpen, onClose }: ChatInterfaceProps) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([
        { role: "bot", content: "Hi! I'm your Movie Assistant. Ask me about movies, cinemas, or how to use the app!" },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        const newMsg: Message = { role: "user", content: userMessage };

        // Optimistically update UI
        const newHistory = [...messages, newMsg];
        setMessages(newHistory);
        setInput("");
        setIsLoading(true);

        try {
            // Send history along with the new message AND userId
            const response = await axios.post("/api/chat", {
                message: userMessage,
                history: newHistory.slice(-10), // Keep last 10 messages for context
                userId: session?.user?.id
            });

            const botResponse = response.data.response;
            setMessages((prev) => [...prev, { role: "bot", content: botResponse }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "bot", content: "Sorry, I encountered an error. Please try again." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl flex flex-col border border-gray-200 z-50 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
            {/* Header */}
            <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                    <MessageCircle size={20} />
                    <h3 className="font-semibold">Movie Assistant</h3>
                </div>
                <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-lg text-base ${msg.role === "user"
                                ? "bg-indigo-600 text-white rounded-br-none"
                                : "bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm"
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-lg rounded-bl-none border border-gray-200 shadow-sm">
                            <Loader2 className="animate-spin text-indigo-600" size={20} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Ask about movies..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-base"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
