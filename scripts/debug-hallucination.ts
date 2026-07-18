import "dotenv/config";
import { prisma } from "../lib/prisma";
import { findCinemas } from "../lib/chatbot/tools";
import { processMessage } from "../lib/chatbot/engine";

async function debugHallucination() {
    console.log("=== 1. CHECKING RAW DB CONTENT ===");
    const allCinemas = await prisma.cinema.findMany({
        include: { address: true }
    });
    console.log(`Total Cinemas in DB: ${allCinemas.length}`);
    console.log(JSON.stringify(allCinemas, null, 2));

    console.log("\n=== 2. TESTING TOOL RETRIEVAL ===");
    const userQuery = "available cinema in mumbau with adress";
    // We suspect 'mumbau' might get extracted as 'mumbau' or corrected to 'Mumbai'
    // Let's see what the tool returns for both.

    console.log("Searching for 'mumbau':");
    const resTypo = await findCinemas("mumbau");
    console.log(resTypo);

    console.log("Searching for 'Mumbai':");
    const resCorrect = await findCinemas("Mumbai");
    console.log(resCorrect);

    console.log("\n=== 3. TESTING FULL BOT FLOW ===");
    const botResponse = await processMessage(userQuery);
    console.log(`User Query: "${userQuery}"`);
    console.log(`Bot Response: ${botResponse}`);
}

debugHallucination()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
