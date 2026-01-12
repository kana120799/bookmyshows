import "dotenv/config";
import { processMessage } from "../lib/chatbot/engine";

async function verifyContext() {
    console.log("=== STARTING CONTEXT TEST ===\n");

    // Message 1: User asks for Cinema
    const query1 = "Name of cinema locate in Mumbai";
    console.log(`User: ${query1}`);
    const res1 = await processMessage(query1, []);
    console.log(`Bot: ${res1}\n`);

    // Simulate History
    const history = [
        { role: "user", content: query1 },
        { role: "bot", content: res1 }
    ];

    // Message 2: User says "Yes" (referring to the previous context)
    // The user's actual query is just "Yes", but we expect the system to Refine it.
    const query2 = "Yes";
    console.log(`User: ${query2} (Context: User asked about Mumbai cinema, Bot found INOX)`);

    // Check what happens
    const res2 = await processMessage(query2, history);
    console.log(`Bot Response to "Yes":\n${res2}\n`);

    console.log("=== TEST COMPLETED ===");
}

verifyContext().catch(console.error);
