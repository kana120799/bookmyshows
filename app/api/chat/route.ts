import { NextRequest, NextResponse } from "next/server";
import { processMessage } from "@/lib/chatbot/engine";

export async function POST(req: NextRequest) {
    try {
        const { message, history, userId } = await req.json();

        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        const response = await processMessage(message, history || [], userId);

        return NextResponse.json({ response });
    } catch (error) {
        console.error("Chatbot Error:", error);
        return NextResponse.json(
            { error: "Failed to process chat request" },
            { status: 500 }
        );
    }
}
