import "dotenv/config";
import { processMessage } from "../lib/chatbot/engine";
import { prisma } from "../lib/prisma";

async function runTests() {
    console.log("=== STARTING CHATBOT TESTS ===\n");

    // 1. Weather Test (Domain Check)
    console.log("TEST 1: Weather Query (Expect OUT_OF_SCOPE)");
    const weatherResponse = await processMessage("What is the weather in Mumbai?");
    console.log("Response:", weatherResponse);
    console.log("\n------------------------------------------------\n");

    // 2. Movie Info Test (Extraction Check)
    console.log("TEST 2: Movie Extraction (Search for Drama)");
    const movieResponse = await processMessage("List 5 drama movies");
    console.log("Response:", movieResponse);
    console.log("\n------------------------------------------------\n");

    // 3. Cinema Search Test
    console.log("TEST 3: Cinema Search Extraction (Search for Mumbai)");
    const cinemaResponse = await processMessage("Name of cinema locate in Mumbai");
    console.log("Response:", cinemaResponse);
    console.log("\n------------------------------------------------\n");
    // 4. Show Timings Test
    const movie = await prisma.movie.findFirst();
    if (movie) {
        console.log(`TEST 4: Show Timings Query for '${movie.title}'`);
        const showResponse = await processMessage(`Show timings for ${movie.title}`);
        console.log("Response:", showResponse);
    }
    console.log("\n------------------------------------------------\n");

    // 4. Policy Test
    console.log("TEST 4: Policy Query (Cancellation)");
    const policyResponse = await processMessage("How do I cancel my ticket?");
    console.log("Response:", policyResponse);
    console.log("\n------------------------------------------------\n");

    // 5. General Query
    console.log("TEST 5: General Greeting");
    const generalResponse = await processMessage("Hello, how can you help me?");
    console.log("Response:", generalResponse);
    console.log("\n------------------------------------------------\n");

    console.log("=== TESTS COMPLETED ===");
}

runTests()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
