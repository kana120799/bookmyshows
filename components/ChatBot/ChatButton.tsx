"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { MessageCircle } from "lucide-react";
import ChatInterface from "./ChatInterface";

export default function ChatButton() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);



    return (
        <>
            <ChatInterface isOpen={isOpen} onClose={() => setIsOpen(false)} />
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 z-50 flex items-center justify-center"
            >
                <MessageCircle size={28} />
            </button>
        </>
    );
}
